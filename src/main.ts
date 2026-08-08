import './styles/base.css';

import { plateClass, plateUrl, prefetchPlates } from './art/plate';

import { SCENES, SCENE_BY_ID } from './content/scenes';
import { CHARACTERS } from './content/characters';
import { pickScenes } from './engine/scheduler';
import { advanceTurn } from './engine/sim';
import { clearSave, exportSlot, hasSave, importSave, listSlots, loadGame, mostRecentSlot, saveGame } from './engine/save';
import { TOTAL_TURNS, createState } from './engine/state';
import type { GameState, Scene } from './engine/types';
import { sfxAdvance, sfxSelect, setAudioEnabled, audioEnabled, ensureAudioReady } from './ui/audio';
import { renderBalance } from './ui/balance';
import { renderDirectives, renderTopbar } from './ui/console';
import { renderCodex, renderLog } from './ui/codex';
import { renderActBreak, renderEnding, renderReport } from './ui/report';
import { applyEra } from './ui/theme';
import { renderTree } from './ui/tree';
import { escapeHtml, playScene } from './ui/vn';
import type { Rewind } from './ui/vn';

const app = document.getElementById('app')!;
let state: GameState;
let topbarEl: HTMLElement;
let stageEl: HTMLElement;
let overlayEl: HTMLElement;

/** Scenes per turn. Enough for a beat and a consequence without becoming a reading task. */
const SCENES_PER_TURN = 3;

/**
 * The one step of history the player is allowed to take back: the state as it was when the
 * scene containing their last choice opened, plus the scenes that were still queued behind it.
 *
 * It is cleared the moment the turn advances. Undoing a choice is one thing; rolling back a
 * simulated four years to see whether the winter still happens is a different game, and the
 * run would stop being deterministic from its seed.
 */
let rewind: { at: Rewind; queue: string[]; then: () => void } | null = null;

/** Lets the Back button cut short whatever scene is currently on screen. */
let sceneAbort: AbortController | null = null;

/**
 * The slot this run autosaves into — where it was loaded from, or last saved to.
 *
 * Without this the per-turn autosave went to slot 1 unconditionally, which would quietly
 * overwrite whatever century the player had parked there the moment they took a turn in a
 * different one. A run stays with its own slot.
 */
let activeSlot = 1;

// ---------------------------------------------------------------------------
// Shell
// ---------------------------------------------------------------------------

function buildShell(): void {
  app.innerHTML = `
    <div class="topbar" id="topbar"></div>
    <div class="stage" id="stage"></div>
    <div id="overlay"></div>`;
  topbarEl = document.getElementById('topbar')!;
  stageEl = document.getElementById('stage')!;
  overlayEl = document.getElementById('overlay')!;
  refreshTopbar();
}

function refreshTopbar(): void {
  renderTopbar(topbarEl, state, {
    onTree: () => openOverlay((el, close) => renderTree(el, state, close)),
    onCodex: () => openOverlay((el, close) => renderCodex(el, state, close)),
    onLog: () => openOverlay((el, close) => renderLog(el, state, close)),
    onBalance: () => openOverlay((el, close) => renderBalance(el, state, close)),
    onMenu: () => openOverlay((el, close) => renderMenu(el, close)),
    onBack: rewind ? goBack : undefined,
    backLabel: rewind?.at.choice,
  });
}

function openOverlay(render: (el: HTMLElement, close: () => void) => void): void {
  const close = () => {
    overlayEl.innerHTML = '';
    window.removeEventListener('keydown', onEsc);
  };
  const onEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close();
  };
  window.addEventListener('keydown', onEsc);
  render(overlayEl, close);
}

/**
 * The four save slots.
 *
 * A century is a hundred years long, and the interesting thing to do with one is fork it — same
 * seed, different policy, compare the endings. One slot made that impossible without pasting
 * codes into a text file. Each row saves over itself, loads, exports and clears independently,
 * and a slot holding an unfinished run says which year it stopped in rather than a timestamp
 * nobody can place.
 */
function slotRows(): string {
  return listSlots()
    .map((info, i) => {
      const n = i + 1;
      const here = info && info.seed === state.seed && info.turn === state.turn;
      return `<div class="slot${info ? '' : ' empty'}${here ? ' current' : ''}">
        <span class="n">${n}</span>
        <span class="what">${
          info
            ? `<b>${info.year}</b> · turn ${info.turn + 1} of ${TOTAL_TURNS} · seed ${info.seed}`
            : '<i>empty</i>'
        }</span>
        <span class="acts">
          <button data-slot-save="${n}">${info ? 'Overwrite' : 'Save here'}</button>
          ${info ? `<button data-slot-load="${n}">Load</button>` : ''}
          ${info ? `<button data-slot-export="${n}">Copy code</button>` : ''}
          ${info ? `<button data-slot-clear="${n}">Clear</button>` : ''}
        </span>
      </div>`;
    })
    .join('');
}

/**
 * Replace the running century with a loaded one, from a slot or a pasted code.
 *
 * A scene may still be playing behind the overlay, holding the state being replaced — it has to
 * be aborted before the swap or it will keep writing into the old object and then hand control
 * back into a turn that no longer exists.
 */
function adoptLoadedState(loaded: GameState, close: () => void): void {
  const running = sceneAbort;
  sceneAbort = null;
  running?.abort();
  rewind = null;

  state = loaded;
  close();
  applyEra(state.act);
  refreshTopbar();
  void beginTurn();
}

function renderMenu(el: HTMLElement, close: () => void): void {
  el.innerHTML = `<div class="panel"><div class="wrap report">
    <div style="display:flex;align-items:baseline;gap:14px">
      <h2>Menu</h2><span style="flex:1"></span><button id="m-close">Close</button>
    </div>
    <div class="sub">Seed <b>${state.seed}</b> · turn ${state.turn + 1} of ${TOTAL_TURNS}. The whole run is deterministic from that seed plus the choices you made, so an exported code replays exactly.</div>

    <div class="section-head">Saved centuries</div>
    <div class="slots">${slotRows()}</div>

    <div style="display:flex;gap:10px;flex-wrap:wrap;margin:22px 0">
      <button id="m-import">Paste save code</button>
      <button id="m-audio">${audioEnabled() ? 'Sound: on' : 'Sound: off'}</button>
      <button id="m-quit">Abandon this century</button>
    </div>
    <div id="m-msg" style="color:var(--dim);font-size:12px;min-height:2em"></div>
    <div class="section-head">How this works</div>
    <p style="font-family:var(--font-body);line-height:1.7;max-width:70ch">
      You spend influence each turn on where the field's money, people and attention go. Four years
      pass. Ideas mature when their prerequisites are proved, their era has arrived, and a machine
      exists that can demonstrate them — and not otherwise, however hard you push.
    </p>
    <p style="font-family:var(--font-body);line-height:1.7;max-width:70ch">
      Nothing is scripted to fail. If the field promises more than it delivers for long enough,
      the money leaves, and whichever school was loudest at the time takes the blame. That is a
      rule, not an event, and it can fire in years it never fired in reality — or never fire at all.
    </p>
    <div style="height:60px"></div>
  </div></div>`;

  const msg = el.querySelector<HTMLElement>('#m-msg')!;
  el.querySelector('#m-close')!.addEventListener('click', close);
  /** Offer a code by clipboard, falling back to a selectable box where clipboard is refused. */
  const offerCode = async (code: string, what: string) => {
    try {
      await navigator.clipboard.writeText(code);
      msg.textContent = `${what} copied to the clipboard.`;
    } catch {
      msg.innerHTML = `<textarea style="width:100%;height:80px;background:transparent;color:inherit;border:1px solid var(--dim)">${escapeHtml(code)}</textarea>`;
    }
  };

  el.querySelectorAll<HTMLButtonElement>('[data-slot-save]').forEach((b) =>
    b.addEventListener('click', () => {
      const n = Number(b.dataset.slotSave);
      saveGame(state, n);
      activeSlot = n;
      renderMenu(el, close);
      el.querySelector<HTMLElement>('#m-msg')!.textContent = `Saved to slot ${n}.`;
    }),
  );
  el.querySelectorAll<HTMLButtonElement>('[data-slot-export]').forEach((b) =>
    b.addEventListener('click', () => {
      const code = exportSlot(Number(b.dataset.slotExport));
      if (!code) return void (msg.textContent = 'That slot is empty.');
      void offerCode(code, `Slot ${b.dataset.slotExport}`);
    }),
  );
  el.querySelectorAll<HTMLButtonElement>('[data-slot-clear]').forEach((b) =>
    b.addEventListener('click', () => {
      const n = Number(b.dataset.slotClear);
      clearSave(n);
      renderMenu(el, close);
      el.querySelector<HTMLElement>('#m-msg')!.textContent = `Slot ${n} cleared.`;
    }),
  );
  el.querySelectorAll<HTMLButtonElement>('[data-slot-load]').forEach((b) =>
    b.addEventListener('click', () => {
      const n = Number(b.dataset.slotLoad);
      const loaded = loadGame(n);
      if (!loaded) return void (msg.textContent = 'That slot could not be read.');
      activeSlot = n;
      adoptLoadedState(loaded, close);
    }),
  );
  el.querySelector('#m-import')!.addEventListener('click', () => {
    const code = window.prompt('Paste a save code:');
    if (!code) return;
    const loaded = importSave(code);
    if (!loaded) {
      msg.textContent = 'That code could not be read.';
      return;
    }
    adoptLoadedState(loaded, close);
  });
  el.querySelector('#m-audio')!.addEventListener('click', () => {
    setAudioEnabled(!audioEnabled());
    renderMenu(el, close);
  });
  el.querySelector('#m-quit')!.addEventListener('click', () => {
    // Abandoning the run in progress, not the saved centuries. Clearing every slot here used to
    // be harmless when there was only one; with four it would throw away three untouched games.
    close();
    titleScreen();
  });
}

// ---------------------------------------------------------------------------
// Title
// ---------------------------------------------------------------------------

function titleScreen(): void {
  const era = applyEra(1);
  const plate = plateUrl(era);
  // Warm the later acts' plates while the title is on screen. They are wanted at an act break,
  // where a blank two seconds would land in the middle of the one purely theatrical moment.
  prefetchPlates();
  app.innerHTML = `<div class="title-screen">
    ${plate ? `<div class="plate-bed title-bed"><img class="${plateClass(era)}" src="${plate}" alt=""></div>` : ''}
    <h1>AI TIMELINES</h1>
    <div class="tag">
      A hundred years of argument about what a mind is — 1950 to 2050 — and your hand on where
      the money, the people and the attention go.
    </div>
    <div class="row">
      <button class="primary" id="t-new">Begin · 1950</button>
      ${hasSave() ? '<button id="t-cont">Continue</button>' : ''}
      <button id="t-seed">Choose a seed</button>
    </div>
    <div class="foot">
      Eight schools. A hundred and five ideas. Every one of them real, and most still argued about.<br>
      ${
        audioEnabled()
          ? 'Sound is on — switch it off from the menu if you would rather read in quiet.'
          : 'Sound is off — switch it back on from the menu.'
      }
    </div>
  </div>`;

  document.getElementById('t-new')!.addEventListener('click', () => start(Date.now() & 0x7fffffff));
  document.getElementById('t-cont')?.addEventListener('click', () => {
    const slot = mostRecentSlot() ?? 1;
    activeSlot = slot;
    const loaded = loadGame(slot);
    if (loaded) start(loaded.seed, loaded);
    else start(Date.now() & 0x7fffffff);
  });
  document.getElementById('t-seed')!.addEventListener('click', () => {
    const raw = window.prompt('Seed (any number):', '1956');
    if (raw === null) return;
    const n = Number(raw);
    start(Number.isFinite(n) ? Math.floor(n) : 1956);
  });
}

function start(seed: number, existing?: GameState): void {
  ensureAudioReady();
  rewind = null;
  sceneAbort = null;
  state = existing ?? createState(seed);
  applyEra(state.act);
  buildShell();
  if (existing) {
    void beginTurn();
  } else {
    void openingSequence();
  }
}

// ---------------------------------------------------------------------------
// Turn loop
// ---------------------------------------------------------------------------

/** Characters step on and off the stage as their documented period of activity allows. */
function refreshCharacters(): void {
  for (const c of CHARACTERS) {
    const st = state.characters[c.id];
    if (!st) continue;
    const inSpan = state.year >= c.span[0] && state.year <= c.span[1];
    if (!inSpan) st.active = false;
    else if (st.met) st.active = true;
  }
}

/**
 * Play a queue of scenes, following each one's `goto` before moving on to the next queued id.
 *
 * This is a flat queue rather than nested loops specifically so that the Back button has
 * something concrete to restore: a scene id to replay plus everything still to come after it.
 * Returns without opening the directive board if a rewind took the loop over.
 */
async function playQueue(initial: string[], then: () => void): Promise<void> {
  let queue = initial.slice();
  const played = new Set<string>();

  while (queue.length > 0) {
    const id = queue[0]!;
    const rest = queue.slice(1);
    queue = rest;

    const sc: Scene | undefined = SCENE_BY_ID[id];
    if (!sc || played.has(id)) continue;
    played.add(id);

    const ctrl = new AbortController();
    sceneAbort = ctrl;
    const result = await playScene(stageEl, state, sc, { signal: ctrl.signal });
    if (sceneAbort === ctrl) sceneAbort = null;
    if (result.aborted) return;

    if (result.rewind) rewind = { at: result.rewind, queue: [id, ...rest], then };
    refreshTopbar();

    if (state.ending) break;
    if (result.goto) queue = [result.goto, ...rest];
  }

  refreshTopbar();
  then();
}

/**
 * Put the state back as it was when the last choice's scene opened and play it again. Anything
 * spent since — including directives taken after the scene — comes back with it, because the
 * snapshot is the whole state and not just the choice.
 */
function goBack(): void {
  const r = rewind;
  if (!r) return;
  rewind = null;
  state = r.at.state;
  applyEra(state.act);
  refreshCharacters();
  refreshTopbar();

  const running = sceneAbort;
  sceneAbort = null;
  running?.abort();

  // Deferred so the aborted loop unwinds first and cannot clear the new loop's abort handle.
  void Promise.resolve().then(() => playQueue(r.queue, r.then));
}

async function openingSequence(): Promise<void> {
  await playQueue(['open-1'], () => void beginTurn());
}

async function beginTurn(): Promise<void> {
  refreshCharacters();
  refreshTopbar();

  const picked = pickScenes(state, SCENES, SCENES_PER_TURN);
  await playQueue(
    picked.map((p) => p.id),
    directivePhase,
  );
}

function directivePhase(): void {
  stageEl.innerHTML = '';
  renderDirectives(
    stageEl,
    state,
    () => {
      sfxAdvance();
      saveGame(state, activeSlot);
      nextTurn();
    },
    refreshTopbar,
    // A purchase is an undo point like any other choice. The queue is empty because there are
    // no scenes left to replay — going back just reopens the board with the money unspent.
    (before, label) => {
      rewind = { at: { state: before, choice: label }, queue: [], then: directivePhase };
      refreshTopbar();
    },
  );
}

function nextTurn(): void {
  // Four years are about to pass. Past this point the choice is history like everything else.
  rewind = null;
  refreshTopbar();

  if (state.turn >= TOTAL_TURNS - 1) {
    void finish();
    return;
  }

  const priorAct = state.act;
  const report = advanceTurn(state);
  refreshCharacters();
  refreshTopbar();

  const showReport = () => {
    stageEl.innerHTML = '';
    renderReport(stageEl, state, report, () => {
      void beginTurn();
    });
  };

  if (state.act !== priorAct) {
    renderActBreak(document.body, state.act, state, () => {
      refreshTopbar();
      showReport();
    });
  } else {
    showReport();
  }
}

async function finish(): Promise<void> {
  stageEl.innerHTML = '';
  await renderEnding(stageEl, stageEl, state, () => {
    clearSave(activeSlot);
    titleScreen();
  });
  saveGame(state, activeSlot);
}

// ---------------------------------------------------------------------------

// The first interaction is what unblocks the AudioContext, whatever the player clicks.
document.addEventListener(
  'click',
  () => {
    ensureAudioReady();
    sfxSelect();
  },
  { once: true },
);
titleScreen();

import './styles/base.css';

import { SCENES, SCENE_BY_ID } from './content/scenes';
import { CHARACTERS } from './content/characters';
import { pickScenes } from './engine/scheduler';
import { advanceTurn } from './engine/sim';
import { clearSave, exportSave, hasSave, importSave, loadGame, saveGame } from './engine/save';
import { TOTAL_TURNS, createState } from './engine/state';
import type { GameState, Scene } from './engine/types';
import { sfxAdvance, sfxSelect, setAudioEnabled, audioEnabled } from './ui/audio';
import { renderDirectives, renderTopbar } from './ui/console';
import { renderCodex, renderLog } from './ui/codex';
import { renderActBreak, renderEnding, renderReport } from './ui/report';
import { applyEra } from './ui/theme';
import { renderTree } from './ui/tree';
import { escapeHtml, playScene } from './ui/vn';

const app = document.getElementById('app')!;
let state: GameState;
let topbarEl: HTMLElement;
let stageEl: HTMLElement;
let overlayEl: HTMLElement;

/** Scenes per turn. Enough for a beat and a consequence without becoming a reading task. */
const SCENES_PER_TURN = 3;

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
    onMenu: () => openOverlay((el, close) => renderMenu(el, close)),
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

function renderMenu(el: HTMLElement, close: () => void): void {
  el.innerHTML = `<div class="panel"><div class="wrap report">
    <div style="display:flex;align-items:baseline;gap:14px">
      <h2>Menu</h2><span style="flex:1"></span><button id="m-close">Close</button>
    </div>
    <div class="sub">Seed <b>${state.seed}</b> · turn ${state.turn + 1} of ${TOTAL_TURNS}. The whole run is deterministic from that seed plus the choices you made, so an exported code replays exactly.</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:22px">
      <button id="m-save">Save</button>
      <button id="m-export">Copy save code</button>
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
  el.querySelector('#m-save')!.addEventListener('click', () => {
    saveGame(state);
    msg.textContent = 'Saved to this browser.';
  });
  el.querySelector('#m-export')!.addEventListener('click', async () => {
    const code = exportSave(state);
    try {
      await navigator.clipboard.writeText(code);
      msg.textContent = 'Save code copied to the clipboard.';
    } catch {
      msg.innerHTML = `<textarea style="width:100%;height:80px;background:transparent;color:inherit;border:1px solid var(--dim)">${escapeHtml(code)}</textarea>`;
    }
  });
  el.querySelector('#m-import')!.addEventListener('click', () => {
    const code = window.prompt('Paste a save code:');
    if (!code) return;
    const loaded = importSave(code);
    if (!loaded) {
      msg.textContent = 'That code could not be read.';
      return;
    }
    state = loaded;
    close();
    applyEra(state.act);
    refreshTopbar();
    void beginTurn();
  });
  el.querySelector('#m-audio')!.addEventListener('click', () => {
    setAudioEnabled(!audioEnabled());
    renderMenu(el, close);
  });
  el.querySelector('#m-quit')!.addEventListener('click', () => {
    clearSave();
    close();
    titleScreen();
  });
}

// ---------------------------------------------------------------------------
// Title
// ---------------------------------------------------------------------------

function titleScreen(): void {
  applyEra(1);
  app.innerHTML = `<div class="title-screen">
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
      Eight schools. Ninety-six ideas. Every one of them real, and most of them still argued about.<br>
      Sound is off by default — it can be switched on from the menu.
    </div>
  </div>`;

  document.getElementById('t-new')!.addEventListener('click', () => start(Date.now() & 0x7fffffff));
  document.getElementById('t-cont')?.addEventListener('click', () => {
    const loaded = loadGame();
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
  setAudioEnabled(audioEnabled());
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

async function playChain(startId: string): Promise<void> {
  let id: string | null = startId;
  const guard = new Set<string>();
  while (id) {
    if (guard.has(id)) break;
    guard.add(id);
    const sc: Scene | undefined = SCENE_BY_ID[id];
    if (!sc) break;
    const result = await playScene(stageEl, state, sc);
    refreshTopbar();
    id = result.goto;
  }
}

async function openingSequence(): Promise<void> {
  await playChain('open-1');
  await beginTurn();
}

async function beginTurn(): Promise<void> {
  refreshCharacters();
  refreshTopbar();

  const picked = pickScenes(state, SCENES, SCENES_PER_TURN);
  for (const sc of picked) {
    await playChain(sc.id);
    if (state.ending) break;
  }

  refreshTopbar();
  directivePhase();
}

function directivePhase(): void {
  stageEl.innerHTML = '';
  renderDirectives(
    stageEl,
    state,
    () => {
      sfxAdvance();
      saveGame(state);
      nextTurn();
    },
    refreshTopbar,
  );
}

function nextTurn(): void {
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
    renderActBreak(document.body, state.act, () => {
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
    clearSave();
    titleScreen();
  });
  saveGame(state);
}

// ---------------------------------------------------------------------------

document.addEventListener('click', () => sfxSelect(), { once: true, capture: false });
titleScreen();

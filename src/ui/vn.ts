import { backdropSvg } from '../art/backdrops';
import { portraitSvg, signalSvg } from '../art/portraits';
import { CHARACTER_BY_ID } from '../content/characters';
import { evaluate } from '../engine/conditions';
import { describeEffects, effectFamily } from '../engine/describe';
import { recordDecision } from '../engine/directives';
import { applyEffects } from '../engine/effects';
import { cloneState } from '../engine/state';
import type { BackdropId, Choice, GameState, Line, Scene } from '../engine/types';
import { sfxSelect, sfxType } from './audio';
import { currentEra } from './theme';

const TYPE_MS = 16;

/**
 * Sentinel for "the console is speaking" in the same slot that otherwise holds a character id.
 * The leading space keeps it out of the id namespace; it was a raw NUL byte, which worked but
 * made git treat this whole file as binary and refuse to diff it.
 */
const SYSTEM_SPEAKER = ' system';

/**
 * What the Back button needs in order to undo a choice: the state exactly as it was when the
 * scene opened, plus what the player picked, for the button's tooltip.
 *
 * The snapshot is taken at scene entry rather than at the moment of the choice so that undoing
 * means replaying the whole scene from its first line. A snapshot taken at the choice itself
 * would leave the scene's `onEnter` effects already applied and then apply them a second time
 * on the replay.
 */
export interface Rewind {
  state: GameState;
  choice: string;
}

export interface SceneResult {
  goto: string | null;
  /** Set only if the player actually chose something here; null for scenes that just play. */
  rewind: Rewind | null;
  /** True if the scene was cut short by a rewind rather than played to its end. */
  aborted?: boolean;
}

export interface SceneOptions {
  /** Aborting this cuts the scene short, leaving the state untouched from that point on. */
  signal?: AbortSignal;
}

/**
 * Play one scene to completion. Lines type out; a click, tap, space or enter advances or
 * skips the typing. Choices apply their effects immediately so that a later line in the same
 * turn can react to them.
 */
export function playScene(
  stage: HTMLElement,
  s: GameState,
  scene: Scene,
  opts: SceneOptions = {},
): Promise<SceneResult> {
  return new Promise((resolve) => {
    const era = currentEra();
    const eraIndex = Math.max(0, s.act - 1);
    const entryState = cloneState(s);

    applyEffects(s, scene.onEnter);
    if (!s.seenScenes.includes(scene.id)) s.seenScenes.push(scene.id);

    // Anyone who speaks in a scene has, by definition, been met.
    for (const line of scene.lines) {
      if (!line.who) continue;
      const st = s.characters[line.who];
      if (st) {
        st.met = true;
        st.active = true;
      }
    }

    let backdrop: BackdropId = scene.backdrop ?? 'void';

    stage.innerHTML = `
      <div class="backdrop fade" id="vn-bd"></div>
      <div class="portrait" id="vn-portrait" hidden></div>
      <div class="dialogue">
        <div class="inner">
          <div class="speaker" id="vn-speaker"></div>
          <div class="text" id="vn-text"></div>
          <div class="continue" id="vn-cont" hidden>▸ click, space or enter</div>
        </div>
        <div class="choices" id="vn-choices"></div>
      </div>`;

    const bdEl = stage.querySelector<HTMLElement>('#vn-bd')!;
    const portraitEl = stage.querySelector<HTMLElement>('#vn-portrait')!;
    const speakerEl = stage.querySelector<HTMLElement>('#vn-speaker')!;
    const textEl = stage.querySelector<HTMLElement>('#vn-text')!;
    const contEl = stage.querySelector<HTMLElement>('#vn-cont')!;
    const choicesEl = stage.querySelector<HTMLElement>('#vn-choices')!;

    const drawBackdrop = () => {
      bdEl.innerHTML = backdropSvg(backdrop, era, scene.id);
      bdEl.classList.remove('fade');
      void bdEl.offsetWidth;
      bdEl.classList.add('fade');
    };
    drawBackdrop();

    let i = 0;
    let typing = false;
    let timer: number | undefined;
    let shownWho: string | null = null;

    const setSpeaker = (line: Line) => {
      if (line.system) {
        speakerEl.innerHTML = `<span>${era.id === 'lucid' ? '—' : 'CONSOLE'}</span>`;
        showPortrait(null, true);
        return;
      }
      if (!line.who) {
        speakerEl.innerHTML = '';
        showPortrait(null, false);
        return;
      }
      const c = CHARACTER_BY_ID[line.who];
      const name = c?.title ?? c?.name ?? line.who;
      const kind = c?.kind === 'historical' ? 'historical' : c?.kind === 'composite' ? 'composite' : '';
      speakerEl.innerHTML = `<span>${escapeHtml(name)}</span>${kind ? `<span class="kind">${kind}</span>` : ''}`;
      showPortrait(line.who, false);
    };

    const showPortrait = (who: string | null, system: boolean) => {
      if (system) {
        if (shownWho !== SYSTEM_SPEAKER) {
          portraitEl.hidden = false;
          portraitEl.innerHTML = signalSvg(era, 4242 + s.turn);
          shownWho = SYSTEM_SPEAKER;
        }
        return;
      }
      if (!who) {
        portraitEl.hidden = true;
        portraitEl.innerHTML = '';
        shownWho = null;
        return;
      }
      if (shownWho === who) return;
      const c = CHARACTER_BY_ID[who];
      if (!c) {
        portraitEl.hidden = true;
        shownWho = null;
        return;
      }
      portraitEl.hidden = false;
      portraitEl.innerHTML =
        c.id === 'second' || c.id === 'archivist' ? signalSvg(era, c.portraitSeed) : portraitSvg(c, era);
      portraitEl.classList.remove('portrait');
      void portraitEl.offsetWidth;
      portraitEl.classList.add('portrait');
      shownWho = who;
    };

    const finishTyping = () => {
      if (timer !== undefined) window.clearTimeout(timer);
      typing = false;
      const line = scene.lines[i]!;
      textEl.textContent = line.text;
      contEl.hidden = false;
    };

    const typeLine = (line: Line) => {
      textEl.className = `text${line.system ? ' system' : ''}`;
      textEl.textContent = '';
      contEl.hidden = true;
      typing = true;
      let k = 0;
      const step = () => {
        if (!typing) return;
        k += 1;
        textEl.textContent = line.text.slice(0, k);
        if (k % 3 === 0) sfxType(eraIndex);
        if (k >= line.text.length) {
          typing = false;
          contEl.hidden = false;
          return;
        }
        timer = window.setTimeout(step, TYPE_MS);
      };
      step();
    };

    const showLine = () => {
      const line = scene.lines[i];
      if (!line) return endOfLines();
      if (line.backdrop && line.backdrop !== backdrop) {
        backdrop = line.backdrop;
        drawBackdrop();
      }
      setSpeaker(line);
      typeLine(line);
    };

    const endOfLines = () => {
      contEl.hidden = true;
      const choices = (scene.choices ?? []).filter((c) => evaluate(c.when, s) && affordable(s, c));
      if (choices.length === 0) {
        detach();
        resolve({ goto: scene.next ?? null, rewind: null });
        return;
      }
      textEl.classList.add('done');
      choicesEl.innerHTML = '';
      for (const ch of choices) {
        const b = document.createElement('button');
        b.className = 'choice';
        b.innerHTML = `${escapeHtml(ch.text)}${ch.hint ? `<span class="hint">${escapeHtml(ch.hint)}</span>` : ''}${ch.cost ? `<span class="hint">costs ${ch.cost} influence</span>` : ''}`;
        b.addEventListener('click', (ev) => {
          ev.stopPropagation();
          sfxSelect();
          if (ch.cost) s.resources.influence = Math.max(0, s.resources.influence - ch.cost);
          applyEffects(s, ch.effects);
          s.log.push({ year: s.year, text: `— ${ch.text}`, kind: 'choice' });
          recordDecision(s, {
            turn: s.turn,
            year: s.year,
            kind: 'choice',
            label: ch.text,
            source: scene.id,
            family: effectFamily(ch.effects),
            influenceSpent: ch.cost ?? 0,
            consequences: describeEffects(ch.effects),
          });
          detach();
          resolve({
            goto: ch.goto ?? scene.next ?? null,
            rewind: { state: entryState, choice: ch.text },
          });
        });
        choicesEl.appendChild(b);
      }
      choicesEl.querySelector<HTMLButtonElement>('.choice')?.focus();
    };

    const advance = () => {
      if (choicesEl.childElementCount > 0) return;
      if (typing) {
        finishTyping();
        return;
      }
      i += 1;
      if (i >= scene.lines.length) endOfLines();
      else showLine();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        if (document.activeElement?.classList.contains('choice')) return;
        e.preventDefault();
        advance();
      }
    };
    const onClick = () => advance();

    const detach = () => {
      window.removeEventListener('keydown', onKey);
      stage.removeEventListener('click', onClick);
      opts.signal?.removeEventListener('abort', onAbort);
      if (timer !== undefined) window.clearTimeout(timer);
    };

    const onAbort = () => {
      typing = false;
      detach();
      resolve({ goto: null, rewind: null, aborted: true });
    };

    window.addEventListener('keydown', onKey);
    stage.addEventListener('click', onClick);
    opts.signal?.addEventListener('abort', onAbort, { once: true });

    showLine();
  });
}

function affordable(s: GameState, c: Choice): boolean {
  return !c.cost || s.resources.influence >= c.cost;
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

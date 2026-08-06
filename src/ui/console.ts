import { availableDirectives, canAfford, takeDirective } from '../engine/directives';
import { ACT_TITLES, TOTAL_TURNS } from '../engine/state';
import type { Directive, GameState } from '../engine/types';
import { sfxSelect } from './audio';
import { escapeHtml } from './vn';

/**
 * `max` must match the ceiling in engine/effects.ts, or the bar fills long before the number
 * does. `hint` is the tooltip — the labels say what a gauge is called, not what it means.
 */
const GAUGES: {
  key: keyof GameState['resources'];
  label: string;
  max: number;
  hint: string;
  warnAbove?: boolean;
}[] = [
  {
    key: 'influence',
    label: 'influence',
    max: 60,
    hint: 'What you spend on directives. Unspent influence carries over, and you regenerate more of it each turn when the field has credibility.',
  },
  {
    key: 'capability',
    label: 'capability',
    max: 400,
    hint: 'What the field can actually do. Rises when a paradigm matures on hardware able to demonstrate it.',
  },
  {
    key: 'understanding',
    label: 'understanding',
    max: 300,
    hint: 'How much of what has been built anyone can explain. Decays as the frontier moves, so it needs continuous investment.',
  },
  {
    key: 'attention',
    label: 'attention',
    max: 100,
    hint: 'Public and institutional excitement. The cheapest thing to raise and the most expensive to owe — sustained attention is a debt against delivery.',
  },
  {
    key: 'credibility',
    label: 'credibility',
    max: 100,
    hint: 'The field\'s standing with the people holding the chequebooks. Feeds your influence; collapses in a winter.',
  },
  {
    key: 'deployment',
    label: 'deployment',
    max: 100,
    hint: 'How far the technology has spread into ordinary life.',
  },
  {
    key: 'exposure',
    label: 'exposure',
    max: 100,
    hint: 'Accumulated consequence nobody has got round to addressing. Grows fastest when capability outruns understanding.',
    warnAbove: true,
  },
];

export interface TopbarHandlers {
  onTree: () => void;
  onCodex: () => void;
  onLog: () => void;
  onMenu: () => void;
  /**
   * Undo the most recent choice. Omitted when there is nothing to undo — the button is absent
   * rather than disabled, so it never invites a click that does nothing.
   */
  onBack?: () => void;
  /** The choice `onBack` would undo, quoted back in the tooltip. */
  backLabel?: string;
}

export function renderTopbar(el: HTMLElement, s: GameState, h: TopbarHandlers): void {
  const gauges = GAUGES.map((g) => {
    const v = s.resources[g.key];
    const pct = Math.max(0, Math.min(100, (v / g.max) * 100));
    const warn = g.warnAbove ? v > 45 : false;
    return `<div class="gauge${warn ? ' warn' : ''}" title="${escapeHtml(g.hint)}">
      <b>${g.label}</b>
      <div class="bar"><i style="width:${pct.toFixed(1)}%"></i></div>
      <span class="val">${Math.round(v)}</span>
    </div>`;
  }).join('');

  el.innerHTML = `
    <div class="topline">
      <span class="year">${s.year}</span>
      <span class="act">Act ${roman(s.act)} · ${escapeHtml(ACT_TITLES[s.act - 1] ?? '')}${s.inWinter ? ' · <b style="color:var(--warn)">WINTER</b>' : ''}</span>
      <span class="spacer"></span>
      ${
        h.onBack
          ? `<button data-a="back" title="${escapeHtml(
              h.backLabel
                ? `Undo “${h.backLabel}” and play that moment again. Anything you have spent since then comes back too.`
                : 'Undo your most recent choice and play that moment again.',
            )}">◂ Back</button>`
          : ''
      }
      <button data-a="tree">Paradigms</button>
      <button data-a="codex">Codex</button>
      <button data-a="log">Record</button>
      <button data-a="menu">Menu</button>
    </div>
    <div class="gauges">${gauges}</div>`;

  if (h.onBack) el.querySelector('[data-a="back"]')!.addEventListener('click', h.onBack);
  el.querySelector('[data-a="tree"]')!.addEventListener('click', h.onTree);
  el.querySelector('[data-a="codex"]')!.addEventListener('click', h.onCodex);
  el.querySelector('[data-a="log"]')!.addEventListener('click', h.onLog);
  el.querySelector('[data-a="menu"]')!.addEventListener('click', h.onMenu);
}

export function roman(n: number): string {
  return ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'][n] ?? String(n);
}

const CATEGORY_LABEL: Record<Directive['category'], string> = {
  fund: 'Where the money goes',
  people: 'Who gets to keep working',
  field: 'What the field says about itself',
  world: 'What the world does with it',
};

/**
 * The directive phase. This is where the player actually plays the simulation: influence is
 * finite, most of what you would like to do costs more than you have, and the cards you are
 * not shown are as informative as the ones you are.
 */
export function renderDirectives(
  root: HTMLElement,
  s: GameState,
  onAdvance: () => void,
  /**
   * Called after every purchase. The top bar is a sibling element that this function does not
   * own, so without this the gauges sit frozen for the whole directive phase while the panel
   * below them updates — influence visibly not going down as you spend it.
   */
  onChange?: () => void,
): void {
  const draw = () => {
    const all = availableDirectives(s);
    const byCat: Record<string, Directive[]> = { fund: [], people: [], field: [], world: [] };
    for (const d of all) byCat[d.category]!.push(d);
    byCat.fund!.sort((a, b) => a.name.localeCompare(b.name));

    const last = s.turn >= TOTAL_TURNS - 1;
    const sections = (['field', 'fund', 'people', 'world'] as const)
      .filter((c) => byCat[c]!.length > 0)
      .map(
        (c) => `<div class="section-head">${CATEGORY_LABEL[c]}</div>
          <div class="cards">${byCat[c]!.map(card).join('')}</div>`,
      )
      .join('');

    root.innerHTML = `<div class="panel"><div class="wrap">
      <h2>Directives · ${s.year}–${s.year + 3}</h2>
      <div class="sub">
        You have <b>${Math.round(s.resources.influence)}</b> influence to spend before the next four years pass.
        Anything you do not spend carries over. Anything you back gets worked on; anything you do not,
        somebody else decides about.
      </div>
      ${sections}
      <div style="margin:34px 0 60px;display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <button class="primary" id="adv">${last ? 'Let the century finish ▸' : `Advance to ${s.year + 4} ▸`}</button>
        <span style="color:var(--dim);font-size:11px">${describeState(s)}</span>
      </div>
    </div></div>`;

    root.querySelectorAll<HTMLButtonElement>('.card').forEach((btn) => {
      btn.addEventListener('click', () => {
        const d = all.find((x) => x.id === btn.dataset.id);
        if (!d || !canAfford(s, d)) return;
        sfxSelect();
        takeDirective(s, d);
        onChange?.();
        if (d.endsTurn) {
          onAdvance();
          return;
        }
        draw();
      });
    });
    root.querySelector('#adv')!.addEventListener('click', onAdvance);
  };

  const card = (d: Directive) => {
    const afford = canAfford(s, d);
    return `<button class="card${afford ? '' : ' taken'}" data-id="${escapeHtml(d.id)}" ${afford ? '' : 'disabled'}>
      <span class="name">${escapeHtml(d.name)}</span>
      <span class="blurb">${escapeHtml(d.blurb)}</span>
      <span class="cost">${d.cost === 0 ? 'free' : `${d.cost} influence`}</span>
    </button>`;
  };

  draw();
}

function describeState(s: GameState): string {
  const bits: string[] = [];
  bits.push(`compute frontier 10^${s.computeLog.toFixed(1)} operations`);
  if (s.promises > 24) bits.push('the field has promised a great deal lately');
  if (s.gapStreak > 0) bits.push('funders are asking pointed questions');
  if (s.inWinter) bits.push('the money is gone and hiring has stopped');
  return bits.join(' · ');
}

import { familyColour } from '../art/palette';
import { FAMILIES } from '../content/paradigms';
import { describeEffects, effectFamily } from '../engine/describe';
import { availableDirectives, canAfford, takeDirective } from '../engine/directives';
import { ACT_TITLES, TOTAL_TURNS } from '../engine/state';
import type { Directive, FamilyId, GameState } from '../engine/types';
import { FAMILY_IDS } from '../engine/types';
import { sfxSelect } from './audio';
import { currentEra } from './theme';
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
  /**
   * True for a resource the player spends in whole units. Those are floored rather than
   * rounded — see `gaugeValue`.
   */
  spendable?: boolean;
}[] = [
  {
    key: 'influence',
    label: 'influence',
    max: 60,
    spendable: true,
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

/**
 * Influence accrues in fractions — the per-turn grant is `8 + credibility×0.055 + turn×0.16` —
 * but every directive costs a whole number. Rounding the display therefore used to promise
 * influence that could not be spent: 6.57 showed as "7" while a 7-cost card stayed greyed out,
 * with nothing on screen to explain why. Flooring a spendable resource restores the invariant
 * the player is entitled to assume: if the gauge says 7, anything costing 7 can be bought.
 */
export function gaugeValue(v: number, spendable = false): number {
  return spendable ? Math.floor(v) : Math.round(v);
}

/** Whole influence available to spend, which is what every cost is compared against. */
export function spendableInfluence(s: GameState): number {
  return Math.floor(s.resources.influence);
}

export interface TopbarHandlers {
  onTree: () => void;
  onCodex: () => void;
  onLog: () => void;
  onBalance: () => void;
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
      <span class="val">${gaugeValue(v, g.spendable)}</span>
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
      <button data-a="balance" title="Who holds the field, how that has moved across the century, and every decision you have taken with what came of it">Balance</button>
      <button data-a="tree">Paradigms</button>
      <button data-a="codex">Codex</button>
      <button data-a="log">Record</button>
      <button data-a="menu">Menu</button>
    </div>
    <div class="gauges">${gauges}</div>`;

  if (h.onBack) el.querySelector('[data-a="back"]')!.addEventListener('click', h.onBack);
  el.querySelector('[data-a="balance"]')!.addEventListener('click', h.onBalance);
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

const CATEGORY_TAB: Record<Directive['category'], string> = {
  fund: 'Money',
  people: 'People',
  field: 'The field',
  world: 'The world',
};

/** Tab order. `fund` first because it is where most of a term actually goes. */
const CATEGORY_ORDER: Directive['category'][] = ['fund', 'field', 'people', 'world'];

/**
 * The directive phase. This is where the player actually plays the simulation: influence is
 * finite, most of what you would like to do costs more than you have, and the cards you are
 * not shown are as informative as the ones you are.
 *
 * The funding category alone can offer sixty cards in a busy decade, which is why it is filtered
 * by school rather than printed in one wall: the choice being made is which school to back, so
 * that is the axis the board is organised on.
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
  const era = currentEra();
  let category: Directive['category'] = 'fund';
  /** null means every school. */
  let school: FamilyId | null = null;

  /** What was taken this term, newest first, so the board shows its own consequences. */
  const takenThisTerm = () =>
    (s.decisions ?? []).filter((d) => d.kind === 'directive' && d.turn === s.turn);

  const draw = () => {
    const all = availableDirectives(s);
    const byCat = {} as Record<Directive['category'], Directive[]>;
    for (const c of CATEGORY_ORDER) byCat[c] = [];
    for (const d of all) byCat[d.category].push(d);
    byCat.fund.sort((a, b) => a.name.localeCompare(b.name));

    // Do not strand the player on an empty tab when the last card in it has been taken.
    if (byCat[category].length === 0) {
      category = CATEGORY_ORDER.find((c) => byCat[c].length > 0) ?? 'fund';
    }

    const inCategory = byCat[category];
    const schoolCounts = {} as Record<FamilyId, number>;
    for (const f of FAMILY_IDS) schoolCounts[f] = 0;
    for (const d of inCategory) {
      const f = effectFamily(d.effects);
      if (f) schoolCounts[f] += 1;
    }
    // One school is not a choice between schools, so the filter row only earns its space at two.
    const taggedSchools = FAMILY_IDS.filter((f) => schoolCounts[f] > 0);
    const anySchoolTagged = taggedSchools.length > 1;
    if (school !== null && schoolCounts[school] === 0) school = null;
    if (!anySchoolTagged) school = null;

    const shown = school === null ? inCategory : inCategory.filter((d) => effectFamily(d.effects) === school);

    const tabs = CATEGORY_ORDER.filter((c) => byCat[c].length > 0)
      .map(
        (c) =>
          `<button data-cat="${c}" class="${c === category ? 'on' : ''}">${CATEGORY_TAB[c]} <span class="n">${byCat[c].length}</span></button>`,
      )
      .join('');

    const schoolTabs = anySchoolTagged
      ? `<div class="filterbar schools">
          <button data-school="" class="${school === null ? 'on' : ''}">All schools <span class="n">${inCategory.length}</span></button>
          ${taggedSchools
            .map(
              (f) =>
                `<button data-school="${f}" class="${school === f ? 'on' : ''}" style="--fam:${familyColour(FAMILIES[f].hue, era)}">
                  <i class="swatch"></i>${escapeHtml(FAMILIES[f].name)} <span class="n">${schoolCounts[f]}</span>
                </button>`,
            )
            .join('')}
        </div>`
      : '';

    const last = s.turn >= TOTAL_TURNS - 1;
    const taken = takenThisTerm();
    const ledger = taken.length
      ? `<div class="section-head">Taken this term</div>
         <div class="ledger">${taken
           .map(
             (d) => `<div class="ledger-row"${d.family ? ` style="--fam:${familyColour(FAMILIES[d.family].hue, era)}"` : ''}>
               <b>${escapeHtml(d.label)}</b>
               <span class="spent">−${d.influenceSpent} influence</span>
               <span class="eff">${d.consequences.length ? escapeHtml(d.consequences.join(' · ')) : 'no immediate effect you can measure'}</span>
             </div>`,
           )
           .join('')}</div>`
      : '';

    root.innerHTML = `<div class="panel"><div class="wrap">
      <h2>Directives · ${s.year}–${s.year + 3}</h2>
      <div class="sub">
        You have <b>${spendableInfluence(s)}</b> influence to spend before the next four years pass.
        Anything you do not spend carries over. Anything you back gets worked on; anything you do not,
        somebody else decides about.
      </div>
      <div class="filterbar tabs">${tabs}</div>
      ${schoolTabs}
      <div class="section-head">${CATEGORY_LABEL[category]}${school !== null ? ` · ${escapeHtml(FAMILIES[school].name)}` : ''}</div>
      <div class="cards">${shown.map(card).join('') || '<p style="color:var(--dim)">Nothing here this term.</p>'}</div>
      ${ledger}
      <div style="margin:34px 0 60px;display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <button class="primary" id="adv">${last ? 'Let the century finish ▸' : `Advance to ${s.year + 4} ▸`}</button>
        <span style="color:var(--dim);font-size:11px">${describeState(s)}</span>
      </div>
    </div></div>`;

    root.querySelectorAll<HTMLButtonElement>('[data-cat]').forEach((btn) =>
      btn.addEventListener('click', () => {
        category = btn.dataset.cat as Directive['category'];
        school = null;
        sfxSelect();
        draw();
      }),
    );
    root.querySelectorAll<HTMLButtonElement>('[data-school]').forEach((btn) =>
      btn.addEventListener('click', () => {
        school = btn.dataset.school ? (btn.dataset.school as FamilyId) : null;
        sfxSelect();
        draw();
      }),
    );
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
    const fam = effectFamily(d.effects);
    const effects = describeEffects(d.effects);
    const short = effects.slice(0, 3);
    return `<button class="card${afford ? '' : ' unaffordable'}" data-id="${escapeHtml(d.id)}" ${afford ? '' : 'disabled'}${
      fam ? ` style="--fam:${familyColour(FAMILIES[fam].hue, era)}"` : ''
    }>
      <span class="name">${escapeHtml(d.name)}</span>
      <span class="blurb">${escapeHtml(d.blurb)}</span>
      ${short.length ? `<span class="effects">${short.map((e) => `<i>${escapeHtml(e)}</i>`).join('')}${effects.length > short.length ? `<i class="more">+${effects.length - short.length} more</i>` : ''}</span>` : ''}
      <span class="cost">${
        d.cost === 0
          ? 'free'
          : afford
            ? `${d.cost} influence`
            : `${d.cost} influence — you have ${spendableInfluence(s)}`
      }</span>
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

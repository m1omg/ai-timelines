import { familyColour } from '../art/palette';
import { FAMILIES } from '../content/paradigms';
import { describeEffects, effectFamily } from '../engine/describe';
import { availableDirectives, canAfford, takeDirective } from '../engine/directives';
import { TOTAL_TURNS, cloneState } from '../engine/state';
import { actTitle } from '../content/act-titles';
import type { Directive, FamilyId, GameState, PatronId } from '../engine/types';
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
  /**
   * Influence committed to directives selected but not yet confirmed.
   *
   * Shown as already gone, because to the player it is — that is what selecting a card means.
   * It is *not* taken out of the state: a save taken mid-selection, or a glance at the menu,
   * would otherwise record influence that has not been spent and cannot be got back. The gauge
   * lies helpfully for a few seconds; the century does not.
   */
  heldInfluence?: number;
}

/**
 * Who is paying. These four were simulated from the first commit and shown nowhere: corporate
 * standing drives deployment and bends the compute curve, and a winter cuts all four hard, so a
 * player could watch their century turn on a number the interface never mentioned.
 */
export const PATRONS: { key: PatronId; label: string; hint: string }[] = [
  {
    key: 'military',
    label: 'defence',
    hint: 'The agencies. Deep pockets and the first to leave when a report says the promises were not met.',
  },
  {
    key: 'corporate',
    label: 'industry',
    hint: 'Firms with an application to pay for. Drives how far the work reaches into ordinary life, and is the only patron that speeds the hardware up.',
  },
  {
    key: 'academic',
    label: 'universities',
    hint: 'Chairs, journals, conferences. Slow, cheap, hardest to lose in a winter, and it decides what the next generation believes.',
  },
  {
    key: 'public',
    label: 'the public',
    hint: 'Ordinary attention. Rises with what has been deployed and falls with anything the work has left unaddressed.',
  },
];

/**
 * The expectation debt, which the winter rule reads against delivery every turn and which the
 * interface never showed.
 *
 * It is the quantity the whole mechanic turns on — the menu tells the player that if the field
 * promises more than it delivers for long enough the money leaves — and it was invisible, so a
 * funding review triggered by it arrived looking arbitrary. A rule you cannot see is not a rule
 * the player can play against.
 *
 * It sits on the patron line rather than among the gauges because it is the same kind of thing:
 * not something you hold, something you owe to the people who hold the chequebooks.
 */
function owedHtml(s: GameState): string {
  const owed = Math.round(s.promises);
  const asking = s.gapStreak > 0;
  const heavy = s.promises > 24;
  return `<span class="owed${heavy || asking ? ' warn' : ''}" title="${escapeHtml(
    'Excitement the field has generated and not yet delivered against. It decays on its own and rises when a loud, brittle result matures or you talk the work up. When it outruns delivery for two terms in a row, the funding breaks.',
  )}">
    <i class="bar"><i style="width:${Math.max(0, Math.min(100, (s.promises / 45) * 100)).toFixed(0)}%"></i></i>
    <span class="lab">owed</span>
    <span class="v">${owed}</span>
    ${asking ? '<span class="asking">funders asking</span>' : ''}
  </span>`;
}

export function renderTopbar(el: HTMLElement, s: GameState, h: TopbarHandlers): void {
  const held = Math.max(0, h.heldInfluence ?? 0);
  const gauges = GAUGES.map((g) => {
    const raw = s.resources[g.key];
    const v = g.key === 'influence' ? Math.max(0, raw - held) : raw;
    const pct = Math.max(0, Math.min(100, (v / g.max) * 100));
    const warn = g.warnAbove ? v > 45 : false;
    const holding = g.key === 'influence' && held > 0;
    return `<div class="gauge${warn ? ' warn' : ''}${holding ? ' holding' : ''}" title="${escapeHtml(
      holding ? `${gaugeValue(raw, true)} influence, ${held} of it committed to directives you have selected but not confirmed. Deselect a card to get it back.` : g.hint,
    )}">
      <b>${g.label}${holding ? ` <i class="held">−${held}</i>` : ''}</b>
      <div class="bar"><i style="width:${pct.toFixed(1)}%"></i></div>
      <span class="val">${gaugeValue(v, g.spendable)}</span>
    </div>`;
  }).join('');

  el.innerHTML = `
    <div class="topline">
      <span class="year">${s.year}</span>
      <span class="act">Act ${roman(s.act)} · ${escapeHtml(actTitle(s.act, s))}${s.inWinter ? ' · <b style="color:var(--warn)">WINTER</b>' : ''}</span>
      <span class="spacer"></span>
      ${
        h.onBack
          ? `<button data-a="back" title="${escapeHtml(
              h.backLabel
                ? `Undo “${h.backLabel}”. Everything goes back to just before it, including anything spent since.`
                : 'Undo your most recent choice. Everything goes back to just before it.',
            )}">◂ Back</button>`
          : ''
      }
      <button data-a="balance" title="Who holds the field, how that has moved across the century, and every decision you have taken with what came of it">Balance</button>
      <button data-a="tree">Paradigms</button>
      <button data-a="codex">Codex</button>
      <button data-a="log">Record</button>
      <button data-a="menu">Menu</button>
    </div>
    <div class="gauges">${gauges}</div>
    <div class="patrons" title="Who is currently funding the field. A winter takes all four down at once.">
      <b>funded by</b>
      ${PATRONS.map((p) => {
        const v = s.patrons[p.key];
        return `<span class="patron" title="${escapeHtml(p.hint)}">
          <i class="bar"><i style="width:${Math.max(0, Math.min(100, v)).toFixed(0)}%"></i></i>
          <span class="lab">${p.label}</span>
          <span class="v">${Math.round(v)}</span>
        </span>`;
      }).join('')}
      ${owedHtml(s)}
    </div>`;

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
  /**
   * Called with the state as it was *before* a purchase, so the Back button can undo a card.
   *
   * Without this the board was the one place in the game where a click could not be taken
   * back: `rewind` was only ever set by a scene choice, so a term whose scenes happened to
   * offer none had no Back button at all, and a mistapped directive was permanent.
   */
  onRewindPoint?: (before: GameState, label: string) => void,
  /** Influence committed to selected-but-unconfirmed cards, for the gauge to show as spent. */
  onHold?: (amount: number) => void,
): void {
  const era = currentEra();
  let category: Directive['category'] = 'fund';
  /** null means every school. */
  let school: FamilyId | null = null;

  /*
   * Directives are chosen, not bought one at a time.
   *
   * The board used to spend on the click: the card applied immediately and the only way back was
   * the Back button, which restored a whole snapshot and read as undoing history rather than
   * changing your mind. Selection is now free until it is confirmed — tap to add, tap again to
   * remove, and nothing touches the state until the player says so.
   *
   * Order is kept because directives are applied in sequence and one can open or close another;
   * a Set would lose the order the player expressed.
   */
  let selected: string[] = [];
  const committed = (all: Directive[]) =>
    selected.reduce((n, id) => n + (all.find((d) => d.id === id)?.cost ?? 0), 0);

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

    /*
     * A redraw replaces `.panel`, which is the element that scrolls, so the reading position has
     * to be carried across by hand. Confirming a directive halfway down a long board otherwise
     * threw the player back to the top to look at a card they had just finished with.
     */
    const wasAt = root.querySelector('.panel')?.scrollTop ?? 0;

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
      <div class="cards">${shown.map((d) => card(d, all)).join('') || '<p style="color:var(--dim)">Nothing here this term.</p>'}</div>
      ${ledger}
      <div class="board-foot">${footHtml(all)}</div>
    </div></div>`;

    const panel = root.querySelector('.panel');
    if (panel && wasAt > 0) {
      // The entry animation is for opening the board, not for returning to the same place in it.
      panel.classList.add('no-entry');
      panel.scrollTop = wasAt;
    }

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
        if (!d) return;
        const at = selected.indexOf(d.id);
        if (at >= 0) {
          selected.splice(at, 1);
        } else {
          // A card that ends the term cannot be combined with anything: it is the decision to
          // spend the term deciding nothing. Picking it clears the rest, and picking anything
          // else clears it.
          if (d.endsTurn) selected = [d.id];
          else selected = [...selected.filter((id) => !all.find((x) => x.id === id)?.endsTurn), d.id];
        }
        sfxSelect();
        onHold?.(committed(all));
        onChange?.();
        syncSelection();
      });
    });

    /*
     * Update the cards and the footer in place.
     *
     * A tap used to call draw(), which rewrites the panel — and `.panel` is the element that
     * scrolls, so every selection threw the page back to the top and replayed the entry
     * animation. Nothing about picking a card changes the card list, the tabs or the ledger, so
     * nothing but the cards' own state and the footer needs to move.
     */
    function syncSelection(): void {
      const remaining = spendableInfluence(s) - committed(all);
      root.querySelectorAll<HTMLButtonElement>('.card').forEach((el) => {
        const d = all.find((x) => x.id === el.dataset.id);
        if (!d) return;
        const picked = selected.includes(d.id);
        const afford = picked || d.cost <= remaining;
        el.classList.toggle('picked', picked);
        el.classList.toggle('unaffordable', !afford);
        el.disabled = !afford;
        el.setAttribute('aria-pressed', String(picked));
        const cost = el.querySelector('.cost');
        if (cost) cost.textContent = costLabel(d, picked, remaining);
      });
      const foot = root.querySelector('.board-foot');
      if (!foot) return;
      foot.innerHTML = footHtml(all);
      bindFoot();
    }

    /** The footer is replaced wholesale, so its two buttons are rebound each time. */
    function bindFoot(): void {
      root.querySelector('#confirm')?.addEventListener('click', onConfirm);
      root.querySelector('#adv')?.addEventListener('click', onAdvanceClick);
    }

    /**
     * Spend whatever is selected. Returns whether a card ended the term.
     *
     * Shared by both buttons, because confirming is no longer a step the player has to take:
     * advancing takes what is selected on the way out. Making them press Confirm and *then*
     * Advance was a toll on every single turn to say something the selection already said.
     */
    function applySelected(): { applied: number; endsTurn: boolean } {
      const chosen = selected
        .map((id) => all.find((d) => d.id === id))
        .filter((d): d is Directive => Boolean(d));
      if (chosen.length === 0) return { applied: 0, endsTurn: false };

      // One snapshot for the whole batch, taken before anything is applied. Back now undoes a
      // decision the player made rather than an individual click they may not remember.
      const before = cloneState(s);
      let endsTurn = false;
      let applied = 0;
      for (const d of chosen) {
        // Applying one directive can make the next unaffordable or unavailable, so each is
        // re-checked against the state it actually lands in rather than the one it was picked in.
        if (!canAfford(s, d)) continue;
        if (!availableDirectives(s).some((x) => x.id === d.id)) continue;
        takeDirective(s, d);
        applied += 1;
        if (d.endsTurn) endsTurn = true;
      }

      selected = [];
      onHold?.(0);
      if (applied > 0) {
        onRewindPoint?.(before, applied === 1 ? chosen[0]!.name : `${applied} directives`);
        onChange?.();
      }
      return { applied, endsTurn };
    }

    /*
     * Confirming without advancing survives for one reason, and it is a real one: taking a
     * directive can put a new directive on the board within the same turn, and that card is
     * unreachable if everything resolves at the moment the turn ends.
     *
     * The case that exists today is the champion/centrepiece chain. Championing an unaffiliated
     * figure adds 18 affinity, so backing someone already at 17 or more carries them over the
     * centrepiece bar of 35 and their card — 7 influence, −14 owed — appears immediately.
     * Verified: Dreyfus at 20 goes to 38 and `centrepiece:dreyfus` is offered on the next call to
     * availableDirectives.
     *
     * Note it is *not* "champion twice in a turn": champion is not repeatable, so the second one
     * is gone until the term turns over. Anything relying on that would silently never fire.
     */
    function onConfirm(): void {
      const { applied, endsTurn } = applySelected();
      if (applied === 0) return;
      if (endsTurn) {
        onAdvance();
        return;
      }
      // A confirmed batch changes the card list and the ledger, so this one is a real redraw.
      draw();
    }

    function onAdvanceClick(): void {
      // Anything still selected is taken on the way out. Leaving the board used to throw the
      // selection away, which meant the only route to spending it was the extra button.
      applySelected();
      onAdvance();
    }

    bindFoot();
  };

  const card = (d: Directive, all: Directive[]) => {
    const picked = selected.includes(d.id);
    // What is left after everything already selected. A picked card is always clickable, because
    // clicking it is how you get the influence back.
    const remaining = spendableInfluence(s) - committed(all);
    const afford = picked || d.cost <= remaining;
    const fam = effectFamily(d.effects);
    const effects = describeEffects(d.effects);
    const short = effects.slice(0, 3);
    return `<button class="card${picked ? ' picked' : ''}${afford ? '' : ' unaffordable'}" data-id="${escapeHtml(d.id)}" ${afford ? '' : 'disabled'}${
      fam ? ` style="--fam:${familyColour(FAMILIES[fam].hue, era)}"` : ''
    } aria-pressed="${picked}">
      <span class="name">${escapeHtml(d.name)}</span>
      <span class="blurb">${escapeHtml(d.blurb)}</span>
      ${short.length ? `<span class="effects">${short.map((e) => `<i>${escapeHtml(e)}</i>`).join('')}${effects.length > short.length ? `<i class="more">+${effects.length - short.length} more</i>` : ''}</span>` : ''}
      <span class="cost">${costLabel(d, picked, remaining)}</span>
    </button>`;
  };

  /** Written both into fresh markup and, on a selection change, straight into the live node. */
  const costLabel = (d: Directive, picked: boolean, remaining: number): string =>
    picked
      ? 'selected — tap to remove'
      : d.cost === 0
        ? 'free'
        : d.cost <= remaining
          ? `${d.cost} influence`
          : `${d.cost} influence — ${remaining} left`;

  /** The pending strip and the two buttons: everything a selection changes below the cards. */
  const footHtml = (all: Directive[]): string => {
    const last = s.turn >= TOTAL_TURNS - 1;
    const chosen = selected
      .map((id) => all.find((d) => d.id === id))
      .filter((d): d is Directive => Boolean(d));
    return `${
      chosen.length
        ? `<div class="pending">
             <span class="lab">Selected</span>
             <span class="items">${chosen
               .map((d) => `<i>${escapeHtml(d.name)}${d.cost ? ` · ${d.cost}` : ''}</i>`)
               .join('')}</span>
             <span class="tot">${committed(all)} of ${spendableInfluence(s)} influence</span>
           </div>`
        : ''
    }
    <div style="margin:34px 0 60px;display:flex;gap:10px;flex-wrap:wrap;align-items:center">
      <button class="primary" id="adv">${
        last
          ? `${chosen.length ? `Take ${chosen.length === 1 ? 'it' : `all ${chosen.length}`} and let` : 'Let'} the century finish ▸`
          : `${chosen.length ? `Take ${chosen.length === 1 ? 'it' : `all ${chosen.length}`} and advance` : 'Advance'} to ${s.year + 4} ▸`
      }</button>
      ${
        chosen.length
          ? `<button id="confirm" title="Spend it now without ending the term, then keep choosing with what is left. Worth it when a directive puts a new one on the board: championing someone you have already backed can carry them over the line, and their centrepiece appears the same turn.">Take ${chosen.length === 1 ? 'it' : 'them'} now, keep choosing</button>`
          : ''
      }
      <span style="color:var(--dim);font-size:11px">${describeState(s)}</span>
    </div>`;
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

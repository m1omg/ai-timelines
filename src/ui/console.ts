import { familyColour } from '../art/palette';
import { FAMILIES } from '../content/paradigms';
import { describeEffects, effectFamily } from '../engine/describe';
import { availableDirectives, canAfford, takeDirective } from '../engine/directives';
import { START_COMPUTE_LOG, TOTAL_TURNS, cloneState } from '../engine/state';
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

/**
 * The compute frontier: the largest demonstration the hardware of the year can support, in
 * log10 operations.
 *
 * It belongs with the gauges rather than on the patron line because it is the same kind of
 * fact — something the field has — and because content refers to it directly. The Archivist's
 * 1990 line asks the player to look at the compute figure at the top of the interface, which
 * for a long time was not there.
 *
 * Not a `GAUGES` entry: those read `s.resources`, and this is `s.computeLog`, a different unit
 * on a different scale. The bar runs from the 1950 frontier to 10^30, which a substrate-heavy
 * century passes and an ordinary one does not — it is a sense of pace, not a percentage of
 * anything.
 */
function computeHtml(s: GameState): string {
  const span = 30 - START_COMPUTE_LOG;
  const pct = Math.max(0, Math.min(100, ((s.computeLog - START_COMPUTE_LOG) / span) * 100));
  return `<div class="gauge compute" title="${escapeHtml(
    'The largest computation anyone can actually run, in operations, as a power of ten. It grows on its own as the hardware improves, faster once industry is paying and a paradigm has shown that scale is worth buying. A paradigm cannot be demonstrated at all until the frontier reaches what it needs.',
  )}">
      <b>compute</b>
      <div class="bar"><i style="width:${pct.toFixed(1)}%"></i></div>
      <span class="val">10<sup>${s.computeLog.toFixed(1)}</sup></span>
    </div>`;
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
    <div class="gauges">${gauges}${computeHtml(s)}</div>
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

  /**
   * Directives that are not on the board yet but would be, given what is already selected.
   *
   * Taking a directive can reveal another — funding a paradigm offers concentrating on it, and
   * championing someone already backed can put their centrepiece up. Those used to be reachable
   * for free, because a card applied the moment it was clicked. Deferring selection took that
   * away and a Confirm button was added to buy it back, which is a button to pay for a problem
   * the redesign introduced.
   *
   * So a revealed directive can simply be selected too. It applies after the one that reveals
   * it, because the batch is applied in the order it was picked and each is re-checked against
   * the state it lands in — the same rule that already made a partly-unaffordable batch safe.
   */
  let revealed: Directive[] = [];

  const resolveDir = (id: string, all: Directive[]): Directive | undefined =>
    all.find((d) => d.id === id) ?? revealed.find((d) => d.id === id);

  const committed = (all: Directive[]) =>
    selected.reduce((n, id) => n + (resolveDir(id, all)?.cost ?? 0), 0);

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
      <div class="board-foot">${footHtml(all, project(all))}</div>
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
      /*
       * Prune before anything is drawn. A selection can become unreachable when the card that
       * revealed it is dropped, and leaving it in `selected` held its cost on the gauge while
       * showing nothing in the strip — money the player could watch leaving but never see spent.
       */
      let proj = project(all);
      if (proj && proj.unreachable.length > 0) {
        const gone = proj.unreachable;
        selected = selected.filter((id) => !gone.includes(id));
        proj = project(all);
      }
      onHold?.(committed(all));
      onChange?.();

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
      foot.innerHTML = footHtml(all, proj);
      bindFoot();
    }

    /** The footer is replaced wholesale, so everything in it is rebound each time. */
    function bindFoot(): void {
      root.querySelector('#adv')?.addEventListener('click', onAdvanceClick);
      root.querySelectorAll<HTMLButtonElement>('[data-add]').forEach((btn) =>
        btn.addEventListener('click', () => {
          const id = btn.dataset.add!;
          if (!selected.includes(id)) selected = [...selected, id];
          sfxSelect();
          syncSelection();
        }),
      );
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
        .map((id) => resolveDir(id, all))
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

  /**
   * What the selection would do, computed on a throwaway copy of the century.
   *
   * The cards each state their own effects, but nobody adds four of them up in their head, and
   * the two things that actually decide a term — what this does to the expectation debt, and
   * whether it puts a new card on the board — are invisible until it is too late to change your
   * mind.
   *
   * Deliberately a clone that is read and discarded. Applying the effects to the live state
   * would show the same numbers and would also mean a save taken mid-selection recorded a
   * century that never happened, with decisions logged for directives nobody took. The board
   * may speculate; the record may not.
   */
  const project = (all: Directive[]) => {
    if (selected.length === 0) {
      revealed = [];
      return null;
    }

    const before = new Set(all.map((d) => d.id));
    const c = cloneState(s);

    /*
     * Replay the selection in order against a copy, exactly as applying it will. What survives
     * is what is genuinely reachable; what does not is a card whose prerequisite has since been
     * dropped, and it is pruned rather than left to fail silently at apply time.
     *
     * This is the cascade, and it needs no dependency graph: order plus a per-step availability
     * check gets it for nothing, which is the same rule that already made a partly-unaffordable
     * batch safe.
     */
    const applied: string[] = [];
    const unreachable: string[] = [];
    for (const id of selected) {
      const d = availableDirectives(c).find((x) => x.id === id);
      if (d && canAfford(c, d)) {
        takeDirective(c, d);
        applied.push(id);
      } else {
        unreachable.push(id);
      }
    }

    const bits: string[] = [];
    // Influence is already on the gauge, and reporting it twice reads as spending it twice.
    for (const key of ['capability', 'understanding', 'attention', 'credibility', 'deployment', 'exposure'] as const) {
      const delta = Math.round(c.resources[key] - s.resources[key]);
      if (delta !== 0) bits.push(`${delta > 0 ? '+' : ''}${delta} ${key}`);
    }
    const owed = Math.round(c.promises - s.promises);
    if (owed !== 0) bits.push(`${owed > 0 ? '+' : ''}${owed} owed`);
    for (const f of FAMILY_IDS) {
      const mom = Math.round(c.families[f].momentum - s.families[f].momentum);
      const ins = Math.round(c.families[f].insight - s.families[f].insight);
      if (mom !== 0 || ins !== 0) {
        const parts = [mom !== 0 ? `${mom > 0 ? '+' : ''}${mom} momentum` : '', ins !== 0 ? `${ins > 0 ? '+' : ''}${ins} insight` : '']
          .filter(Boolean)
          .join(', ');
        bits.push(`${FAMILIES[f].name}: ${parts}`);
      }
    }

    const unlocked = availableDirectives(c).filter((d) => !before.has(d.id) && !selected.includes(d.id));
    // Keep a revealed card resolvable only while the selection that revealed it still stands.
    revealed = [...unlocked, ...revealed.filter((r) => applied.includes(r.id))];
    return { bits, unlocked, unreachable };
  };

  /** The pending strip and the two buttons: everything a selection changes below the cards. */
  const footHtml = (all: Directive[], proj: ReturnType<typeof project>): string => {
    const last = s.turn >= TOTAL_TURNS - 1;
    // Through `revealed` as well as the board: a card added from the strip is not on the board.
    const chosen = selected
      .map((id) => resolveDir(id, all))
      .filter((d): d is Directive => Boolean(d));
    return `${
      chosen.length
        ? `<div class="pending">
             <span class="lab">Selected</span>
             <span class="items">${chosen
               .map((d) => `<i>${escapeHtml(d.name)}${d.cost ? ` · ${d.cost}` : ''}</i>`)
               .join('')}</span>
             <span class="tot">${committed(all)} of ${spendableInfluence(s)} influence</span>
             ${
               proj && proj.bits.length
                 ? `<span class="proj"><b>Together:</b> ${proj.bits.map((t) => escapeHtml(t)).join(' · ')}</span>`
                 : ''
             }
             ${
               proj && proj.unlocked.length
                 ? `<span class="proj unlocks"><b>This opens up:</b> ${proj.unlocked
                     .map(
                       (d) =>
                         `<button class="reveal" data-add="${escapeHtml(d.id)}">${escapeHtml(d.name)}${d.cost ? ` · ${d.cost}` : ''}</button>`,
                     )
                     .join('')} <span class="hint">— take ${
                     proj.unlocked.length === 1 ? 'it' : 'them'
                   } in the same term by adding ${proj.unlocked.length === 1 ? 'it' : 'them'} here</span></span>`
                 : ''
             }
           </div>`
        : ''
    }
    <div style="margin:34px 0 60px;display:flex;gap:10px;flex-wrap:wrap;align-items:center">
      <button class="primary" id="adv">${
        last
          ? `${chosen.length ? `Take ${chosen.length === 1 ? 'it' : `all ${chosen.length}`} and let` : 'Let'} the century finish ▸`
          : `${chosen.length ? `Take ${chosen.length === 1 ? 'it' : `all ${chosen.length}`} and advance` : 'Advance'} to ${s.year + 4} ▸`
      }</button>
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

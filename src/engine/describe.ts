import { FAMILIES, PARADIGM_BY_ID } from '../content/paradigms';
import { CHARACTER_BY_ID } from '../content/characters';
import type { Effect, FamilyId, GameState, TurnSnapshot } from './types';
import { FAMILY_IDS } from './types';

/**
 * Effects in plain English.
 *
 * This exists because the declarative Effect union (see the note in CLAUDE.md about conditions
 * and effects being data rather than functions) can be read as well as applied. A predicate
 * closure could tell you nothing about itself; this can tell the player what a card will do
 * before they buy it, and what a decision did years after they took it.
 */

const RESOURCE_WORDS: Record<string, string> = {
  influence: 'influence',
  capability: 'capability',
  understanding: 'understanding',
  attention: 'public attention',
  credibility: 'credibility with funders',
  deployment: 'deployment',
  exposure: 'unaddressed consequence',
};

const PATRON_WORDS: Record<string, string> = {
  military: 'the defence agencies',
  corporate: 'industry',
  academic: 'the universities',
  public: 'the public',
};

const FIELD_WORDS: Record<string, string> = {
  insight: 'accumulated insight',
  momentum: 'momentum',
  talent: 'share of the field',
};

function signed(n: number, digits = 0): string {
  const v = n.toFixed(digits);
  return n >= 0 ? `+${v}` : v;
}

/** One effect, in a phrase. Returns null for effects with nothing useful to show a player. */
export function describeEffect(e: Effect): string | null {
  switch (e.kind) {
    case 'resource': {
      const word = RESOURCE_WORDS[e.key] ?? e.key;
      if (e.op === 'add') return `${signed(e.value)} ${word}`;
      if (e.op === 'mul') return `${word} ×${e.value}`;
      return `${word} set to ${e.value}`;
    }
    case 'patron': {
      const word = PATRON_WORDS[e.patron] ?? e.patron;
      if (e.op === 'add') return `${signed(e.value)} standing with ${word}`;
      if (e.op === 'mul') return `standing with ${word} ×${e.value}`;
      return `standing with ${word} set to ${e.value}`;
    }
    case 'compute':
      return e.op === 'add'
        ? `${signed(e.value, 1)} to the compute frontier (log₁₀)`
        : `compute frontier ×${e.value}`;
    case 'family': {
      const name = FAMILIES[e.family].name;
      const word = FIELD_WORDS[e.field] ?? e.field;
      const value = e.field === 'talent' ? e.value * 100 : e.value;
      if (e.op === 'add') return `${signed(value, e.field === 'talent' ? 1 : 0)} ${word} for ${name}`;
      return `${name}'s ${word} ×${e.value}`;
    }
    case 'paradigm': {
      const p = PARADIGM_BY_ID[e.id];
      const name = p?.name ?? e.id;
      switch (e.op) {
        case 'progress':
          return `${signed(e.value ?? 0)} progress toward ${name}`;
        case 'emphasis':
          return `${name} gets the field's attention this term`;
        case 'mature':
          return `${name} is established`;
        case 'unlock':
          return `${name} becomes possible to work on`;
        case 'dormant':
          return `${name} goes dormant`;
      }
      return null;
    }
    case 'character': {
      const c = CHARACTER_BY_ID[e.id];
      const name = c?.name ?? e.id;
      if (e.op !== 'add') return `${name}'s regard for you set to ${e.value}`;
      return e.value >= 0 ? `${name} remembers this well` : `${name} does not forget this`;
    }
    case 'commons':
      return `+${e.value} insight to the field at large, weighted to whichever school has least`;
    case 'joinery':
      return `up to +${e.value} bridge insight — as much of it as the thinner of the two schools can carry`;
    case 'promises':
      return e.value <= 0
        ? `talks the field down by ${-e.value} — less owed against delivery`
        : `+${e.value} owed against delivery`;
    case 'flag':
    case 'log':
    case 'characterActive':
    case 'actor':
      // Bookkeeping, or something the narrative will say better than a stat line would.
      return null;
    case 'ending':
      return 'the century ends here';
  }
  return null;
}

/** Every effect worth showing, deduplicated and in order. */
export function describeEffects(effects: Effect[] | undefined): string[] {
  const out: string[] = [];
  for (const e of effects ?? []) {
    const d = describeEffect(e);
    if (d && !out.includes(d)) out.push(d);
  }
  return out;
}

/** The school an effect list is pulling for, if it pulls clearly for one. */
export function effectFamily(effects: Effect[] | undefined): FamilyId | undefined {
  const seen = new Set<FamilyId>();
  for (const e of effects ?? []) {
    if (e.kind === 'family') seen.add(e.family);
    // Brokering pays the bridge school by definition, so a card that only brokers is still a
    // bridge card and belongs under that colour on the board.
    else if (e.kind === 'joinery') seen.add('bridge');
    else if (e.kind === 'paradigm') {
      const p = PARADIGM_BY_ID[e.id];
      if (p) seen.add(p.family);
    }
  }
  return seen.size === 1 ? [...seen][0] : undefined;
}

/**
 * How much of the field each school commands. One definition, used by the balance chart, the
 * report's "centre of gravity" line and the ending summary, so those three never disagree
 * about who is winning.
 *
 * Matured work counts for most because it is the only thing that cannot be taken back; insight
 * and momentum are the parts of a school's position that a winter can undo.
 */
export function familyStanding(s: GameState, f: FamilyId): number {
  const st = s.families[f];
  return Math.max(
    0,
    st.matured * 10 + st.insight * 0.55 + st.talent * 40 + Math.max(0, st.momentum) * 0.35,
  );
}

/** Standing as a share of the whole field, 0–1 per school, summing to 1. */
export function familyShares(s: GameState): Record<FamilyId, number> {
  const raw = {} as Record<FamilyId, number>;
  let total = 0;
  for (const f of FAMILY_IDS) {
    raw[f] = familyStanding(s, f);
    total += raw[f];
  }
  if (total <= 0) {
    for (const f of FAMILY_IDS) raw[f] = 1 / FAMILY_IDS.length;
    return raw;
  }
  for (const f of FAMILY_IDS) raw[f] = raw[f] / total;
  return raw;
}

/**
 * One row of the balance-of-power chart, taken after everything else in a turn has settled.
 *
 * Lives here rather than in sim.ts because state.ts needs it too, to lay down row zero — and
 * state.ts must not import sim.ts, which imports state.ts back.
 */
export function recordSnapshot(s: GameState): void {
  const history = (s.history ??= []);
  const row: TurnSnapshot = {
    turn: s.turn,
    year: s.year,
    shares: familyShares(s),
    patrons: { ...s.patrons },
    capability: s.resources.capability,
    understanding: s.resources.understanding,
    computeLog: s.computeLog,
    inWinter: s.inWinter,
  };
  // Undoing a choice replays a turn, so overwrite that turn's row instead of duplicating it.
  const existing = history.findIndex((h) => h.turn === s.turn);
  if (existing >= 0) history[existing] = row;
  else history.push(row);
}

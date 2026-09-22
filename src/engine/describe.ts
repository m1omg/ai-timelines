import { FAMILIES, PARADIGM_BY_ID } from '../content/paradigms';
import { CHARACTER_BY_ID } from '../content/characters';
import type { CmpOp, Condition, Effect, FamilyId, GameState, TurnSnapshot } from './types';
import { evaluate, leadMargin, leadingFamily } from './conditions';
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

// ---------------------------------------------------------------------------
// Conditions in plain English
// ---------------------------------------------------------------------------

/*
 * The same argument as for effects: a Condition is data, so it can be read back. This is what
 * lets the ending screen say *why* a verdict was reached rather than only what it was — and,
 * for the ending that was one condition away, what that condition was.
 *
 * Every flag an ending reads needs an entry here. The fallback spells the raw flag name, which
 * a test treats as a defect: a player should never be shown `showedWorking`.
 */

interface FlagWords {
  /** The flag is set, or the numeric flag meets the bar. */
  held: string;
  /** The flag is absent, or the bar was not met. */
  missing: string;
  /** For counted flags: a phrase that takes the bar. */
  count?: (op: CmpOp, value: number) => string;
}

const FLAG_WORDS: Record<string, FlagWords> = {
  abundance: { held: 'the capability was pointed at the diseases', missing: 'the capability was never pointed at a problem people have' },
  autonomy: { held: 'the people were taken out of the loop', missing: 'people stayed in the loop' },
  interruptible: {
    held: 'interruptibility was made a condition of operating',
    missing: 'nothing required that a system could be stopped',
    count: (_op, v) => (v >= 2 ? 'an interruption standard, enforced more than once' : 'an interruption standard'),
  },
  nationalised: { held: 'the frontier was nationalised', missing: 'the frontier was never nationalised' },
  openness: {
    held: 'results were published openly',
    missing: 'results were held back',
    count: (op, v) =>
      op === '>=' || op === '>'
        ? v >= 2 ? 'open publication, insisted on more than once' : 'open publication'
        : 'results held back rather than published',
  },
  screened: { held: 'the dangerous half was put behind a door', missing: 'nothing was screened' },
  succession: { held: 'terms of succession were drafted', missing: 'no terms of succession were ever drafted' },
  treaty: { held: 'a compute treaty was signed', missing: 'no treaty was signed' },
  showedWorking: { held: 'the working was shown beside the verdict', missing: 'the working was never shown' },
  verifiedStandard: { held: 'verified systems were made the standard', missing: 'no verification standard' },
  sawTheFrame: { held: 'the century was told what it was', missing: 'the century was never told what it was' },
  assuranceBacked: {
    held: 'the people who look for the failure were funded',
    missing: 'the people who look for the failure were not funded',
    count: (_op, v) => `the people who look for the failure funded ${v >= 3 ? 'again and again' : 'more than once'}`,
  },
  institutions: {
    held: 'institutions with the authority to refuse were built',
    missing: 'no institution with the authority to refuse',
    count: (op, v) =>
      op === '<' || op === '<='
        ? `fewer than ${op === '<=' ? v + 1 : v} institutions with the authority to refuse`
        : `at least ${op === '>' ? v + 1 : v} institutions with the authority to refuse`,
  },
  concentration: {
    held: 'the frontier concentrated in a few hands',
    missing: 'the frontier did not concentrate',
    count: (op, v) =>
      op === '<' || op === '<='
        ? v <= -1 ? 'capability pushed outward rather than concentrated' : 'the frontier kept from concentrating'
        : v >= 2 ? 'the frontier concentrated in a few hands' : 'the frontier leaning toward a few hands',
  },
  externalAudit: { held: 'the reconstruction was handed to an outside body', missing: 'the reconstruction was never checked from outside' },
  auditDoubt: { held: 'the century declared its own verdict worthless', missing: 'the century was willing to rule on itself' },
  theoryFirst: { held: 'the frontier was held for the account to catch up', missing: 'the frontier was never held for the account' },
  publicDrill: { held: 'the halt was tested in public before it mattered', missing: 'the halt was never tested in public' },
  lastObjectorGone: { held: 'the last body that could refuse was let go', missing: 'the last body that could refuse was kept' },
  recordDelegated: { held: 'the record was handed to the systems it describes', missing: 'the record was still kept by someone' },
  keptFaith: {
    held: 'unfashionable schools were kept alive',
    missing: 'no unfashionable school was kept alive',
    count: () => 'unfashionable schools kept alive, repeatedly',
  },
};

const RESOURCE_PHRASE: Record<string, string> = {
  capability: 'capability',
  understanding: 'understanding',
  deployment: 'deployment',
  exposure: 'unaddressed consequence',
  attention: 'public attention',
  credibility: 'credibility with funders',
  influence: 'influence',
};

function bar(word: string, op: CmpOp, value: number | string): string {
  switch (op) {
    case '>':
      return `${word} above ${value}`;
    case '>=':
      return `${word} of at least ${value}`;
    case '<':
      return `${word} kept below ${value}`;
    case '<=':
      return `${word} kept to ${value} or less`;
    case '==':
      return `${word} at ${value}`;
    case '!=':
      return `${word} anything but ${value}`;
  }
}

/**
 * A condition as a requirement, in prose, without reference to any particular century. Null for
 * the leaves that are bookkeeping rather than a claim about the run (`always`, the calendar).
 * `negated` phrases the requirement's absence, for `not(...)`.
 */
export function phraseCondition(c: Condition, negated = false): string | null {
  switch (c.kind) {
    case 'always':
    case 'year':
    case 'act':
    case 'turn':
    case 'seen':
      return null;
    case 'flagSet': {
      const w = FLAG_WORDS[c.flag];
      if (w) return negated ? w.missing : w.held;
      return `${negated ? 'not ' : ''}${c.flag}`;
    }
    case 'flag': {
      const w = FLAG_WORDS[c.flag];
      if (w?.count && typeof c.value === 'number') {
        const text = w.count(c.op, c.value);
        return negated ? `not: ${text}` : text;
      }
      if (w) return negated ? w.missing : w.held;
      return bar(c.flag, negated ? invert(c.op) : c.op, String(c.value));
    }
    case 'resource':
      return bar(RESOURCE_PHRASE[c.key] ?? c.key, negated ? invert(c.op) : c.op, c.value);
    case 'ratio': {
      const pct = `${Math.round(c.value * 100)}%`;
      const op = negated ? invert(c.op) : c.op;
      if (c.num === 'understanding' && c.den === 'capability') {
        return op === '>=' || op === '>'
          ? `understanding kept pace with capability — at least ${pct} of it`
          : `understanding fell to under ${pct} of capability`;
      }
      return bar(`${c.num} against ${c.den}`, op, c.value);
    }
    case 'compute':
      return bar('a compute frontier', negated ? invert(c.op) : c.op, `10^${c.value}`);
    case 'strain':
      return bar(c.field === 'promises' ? 'promises outstanding' : 'terms of overpromising in a row', negated ? invert(c.op) : c.op, c.value);
    case 'patron':
      return bar(`standing with ${PATRON_WORDS[c.patron] ?? c.patron}`, negated ? invert(c.op) : c.op, c.value);
    case 'paradigm': {
      const name = PARADIGM_BY_ID[c.id]?.name ?? c.id;
      const want = c.status === undefined ? 'reached' : Array.isArray(c.status) ? c.status.join(' or ') : c.status;
      if (want === 'mature') return negated ? `${name} never established` : `${name} established`;
      return `${name} ${negated ? 'not ' : ''}${want}`;
    }
    case 'family': {
      const word = FIELD_WORDS[c.field] ?? c.field;
      const value = c.field === 'talent' ? `${Math.round(c.value * 100)}%` : c.value;
      return bar(`${FAMILIES[c.family].name}'s ${word}`, negated ? invert(c.op) : c.op, value);
    }
    case 'leadFamily':
      return negated ? `${FAMILIES[c.family].name} not holding the field` : `${FAMILIES[c.family].name} held the field`;
    case 'leadMargin': {
      const op = negated ? invert(c.op) : c.op;
      return op === '<' || op === '<=' ? 'no school dominant' : 'the lead settled rather than contested';
    }
    case 'character': {
      const name = CHARACTER_BY_ID[c.id]?.name ?? c.id;
      return bar(`${name}'s regard`, negated ? invert(c.op) : c.op, c.value);
    }
    case 'characterMet': {
      const name = CHARACTER_BY_ID[c.id]?.name ?? c.id;
      return negated ? `${name} never met` : `${name} met`;
    }
    case 'actor':
      return bar(`${c.id}'s ${c.field}`, negated ? invert(c.op) : c.op, c.value);
    case 'inWinter':
      return c.is !== negated ? 'the century ended in a funding collapse' : 'no funding collapse at the close';
    case 'winterCount': {
      const op = negated ? invert(c.op) : c.op;
      if ((op === '==' || op === '<=') && c.value === 0) return 'no funding collapse in a hundred years';
      if (op === '<=' && c.value === 1) return 'at most one funding collapse';
      if (op === '<') return `fewer than ${c.value} funding collapses`;
      return `${c.value} or more funding collapses`;
    }
    case 'not':
      return phraseCondition(c.c, !negated);
    case 'all':
    case 'any': {
      const parts = c.cs.map((x) => phraseCondition(x, negated)).filter((x): x is string => Boolean(x));
      if (parts.length === 0) return null;
      // De Morgan: the absence of an `any` is the absence of every branch.
      const disjunctive = (c.kind === 'any') !== negated;
      return disjunctive ? `one of: ${parts.join('; ')}` : parts.join('; and ');
    }
  }
}

function invert(op: CmpOp): CmpOp {
  switch (op) {
    case '<':
      return '>=';
    case '<=':
      return '>';
    case '>':
      return '<=';
    case '>=':
      return '<';
    case '==':
      return '!=';
    case '!=':
      return '==';
  }
}

/**
 * Why a satisfied condition holds for this century: one phrase per leaf that contributed. For
 * an `any`, only the branch that actually carried it is reported, so the list reads as what
 * happened rather than as everything that might have.
 */
export function describeCondition(c: Condition, s: GameState): string[] {
  switch (c.kind) {
    case 'all':
      return c.cs.flatMap((x) => describeCondition(x, s));
    case 'any': {
      const carried = c.cs.find((x) => evaluate(x, s));
      return carried ? describeCondition(carried, s) : [];
    }
    default: {
      const text = phraseCondition(c);
      return text ? [text] : [];
    }
  }
}

/** The value a leaf was measured against, where one exists, to sit beside what it needed. */
export function measured(c: Condition, s: GameState): string | null {
  switch (c.kind) {
    case 'resource':
      return `${Math.round(s.resources[c.key])}`;
    case 'ratio': {
      const den = s.resources[c.den];
      return den <= 0 ? null : `${Math.round((s.resources[c.num] / den) * 100)}%`;
    }
    case 'compute':
      return `10^${s.computeLog.toFixed(1)}`;
    case 'flag': {
      const v = s.flags[c.flag];
      return typeof v === 'number' ? `${v}` : v === undefined ? '0' : null;
    }
    case 'winterCount':
      return `${s.winters.length}`;
    case 'leadFamily':
      return FAMILIES[leadingFamily(s)].name;
    case 'leadMargin':
      return `${Math.round(leadMargin(s) * 100)} points`;
    case 'family':
      return c.field === 'talent' ? `${Math.round(s.families[c.family].talent * 100)}%` : `${Math.round(s.families[c.family][c.field])}`;
    default:
      return null;
  }
}

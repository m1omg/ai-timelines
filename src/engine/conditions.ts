import { familyShares, familyStanding } from './describe';
import type { CmpOp, Condition, FamilyId, FlagValue, GameState } from './types';
import { FAMILY_IDS } from './types';

export function compare(a: FlagValue, op: CmpOp, b: FlagValue): boolean {
  switch (op) {
    case '==':
      return a === b;
    case '!=':
      return a !== b;
    default:
      break;
  }
  const x = typeof a === 'number' ? a : a === true ? 1 : a === false ? 0 : NaN;
  const y = typeof b === 'number' ? b : b === true ? 1 : b === false ? 0 : NaN;
  if (Number.isNaN(x) || Number.isNaN(y)) return false;
  switch (op) {
    case '<':
      return x < y;
    case '<=':
      return x <= y;
    case '>=':
      return x >= y;
    case '>':
      return x > y;
  }
}

/**
 * The school currently holding the field. Ties break by id order.
 *
 * Scored by `familyStanding`, the same definition the balance chart, the turn report and the
 * ending summary use — three places that used to compute "who is winning" slightly differently
 * and could therefore disagree on screen within the same turn.
 */
export function leadingFamily(s: GameState): FamilyId {
  let best: FamilyId = FAMILY_IDS[0];
  let bestScore = -Infinity;
  for (const f of FAMILY_IDS) {
    const score = familyStanding(s, f);
    if (score > bestScore) {
      bestScore = score;
      best = f;
    }
  }
  return best;
}

/**
 * How far clear the leading school is, as a share of the whole field.
 *
 * Shares rather than raw standing so the number means the same thing in 1954 and 2046, when the
 * field is an order of magnitude larger. 0 is a dead heat; anything past about 0.1 is a lead
 * everyone in the room can feel.
 */
export function leadMargin(s: GameState): number {
  const shares = familyShares(s);
  let first = -Infinity;
  let second = -Infinity;
  for (const f of FAMILY_IDS) {
    const v = shares[f];
    if (v > first) {
      second = first;
      first = v;
    } else if (v > second) {
      second = v;
    }
  }
  return Math.max(0, first - second);
}

export function evaluate(c: Condition | undefined, s: GameState): boolean {
  if (!c) return true;
  switch (c.kind) {
    case 'always':
      return true;

    case 'year':
      return (c.min === undefined || s.year >= c.min) && (c.max === undefined || s.year <= c.max);

    case 'act':
      return s.act === c.is;

    case 'turn':
      return (c.min === undefined || s.turn >= c.min) && (c.max === undefined || s.turn <= c.max);

    case 'flag': {
      const v = s.flags[c.flag];
      if (v === undefined) {
        // An unset flag reads as 0/false so content can test flags before they exist.
        return compare(typeof c.value === 'string' ? '' : 0, c.op, c.value);
      }
      return compare(v, c.op, c.value);
    }

    case 'flagSet':
      return s.flags[c.flag] !== undefined && s.flags[c.flag] !== false && s.flags[c.flag] !== 0;

    case 'resource':
      return compare(s.resources[c.key], c.op, c.value);

    case 'ratio': {
      const den = s.resources[c.den];
      // A denominator of zero means nothing has been built, so the ratio is treated as
      // maximally favourable rather than undefined.
      return compare(den <= 0 ? Number.MAX_SAFE_INTEGER : s.resources[c.num] / den, c.op, c.value);
    }

    case 'patron':
      return compare(s.patrons[c.patron], c.op, c.value);

    case 'strain':
      return compare(c.field === 'promises' ? s.promises : s.gapStreak, c.op, c.value);
    case 'compute':
      return compare(s.computeLog, c.op, c.value);

    case 'paradigm': {
      const p = s.paradigms[c.id];
      if (!p) return false;
      if (c.status !== undefined) {
        const want = Array.isArray(c.status) ? c.status : [c.status];
        if (!want.includes(p.status)) return false;
      }
      if (c.minProgress !== undefined && p.progress < c.minProgress) return false;
      return true;
    }

    case 'family':
      return compare(s.families[c.family][c.field], c.op, c.value);

    case 'leadFamily':
      return leadingFamily(s) === c.family;

    case 'leadMargin':
      return compare(leadMargin(s), c.op, c.value);

    case 'character': {
      const ch = s.characters[c.id];
      if (!ch) return false;
      return compare(ch.affinity, c.op, c.value);
    }

    case 'characterMet':
      return Boolean(s.characters[c.id]?.met);

    case 'actor': {
      const a = s.actors[c.id];
      if (!a) return false;
      return compare(a[c.field], c.op, c.value);
    }

    case 'seen':
      return s.seenScenes.includes(c.scene);

    case 'inWinter':
      return s.inWinter === c.is;

    case 'winterCount':
      return compare(s.winters.length, c.op, c.value);

    case 'not':
      return !evaluate(c.c, s);

    case 'all':
      return c.cs.every((x) => evaluate(x, s));

    case 'any':
      return c.cs.some((x) => evaluate(x, s));
  }
}

// ---------------------------------------------------------------------------
// Small builders. Content reads much better with these than with raw object literals.
// ---------------------------------------------------------------------------

export const always: Condition = { kind: 'always' };
export const all = (...cs: Condition[]): Condition => ({ kind: 'all', cs });
export const any = (...cs: Condition[]): Condition => ({ kind: 'any', cs });
export const not = (c: Condition): Condition => ({ kind: 'not', c });
export const yearIn = (min: number, max: number): Condition => ({ kind: 'year', min, max });
export const after = (min: number): Condition => ({ kind: 'year', min });
export const before = (max: number): Condition => ({ kind: 'year', max });
export const flagIs = (flag: string, value: FlagValue): Condition => ({ kind: 'flag', flag, op: '==', value });
export const flagSet = (flag: string): Condition => ({ kind: 'flagSet', flag });
export const mature = (id: string): Condition => ({ kind: 'paradigm', id, status: 'mature' });
export const notMature = (id: string): Condition => not(mature(id));
export const leadFamily = (family: FamilyId): Condition => ({ kind: 'leadFamily', family });
/**
 * A school is *dominant* rather than merely top when it is this far clear of second place.
 *
 * One number, used by every scene that wants to say "somebody has won" or "nobody has", so the
 * game cannot tell a player both things in the same decade. Measured mid-century, about one run
 * in ten is under it.
 */
export const DOMINANT_MARGIN = 0.07;

/**
 * The same question asked at the close, where it means something different and wants a smaller
 * number: not "is one school clearly ahead in the room" but "did the century settle on one".
 *
 * A lead of four points in 2006 is an argument still running; the same lead in 2050 is how the
 * hundred years came out, because there is no more time in which to lose it. Measured at the
 * close, a tenth of runs are under this and a third are under `DOMINANT_MARGIN` — so gating the
 * school endings on the mid-century number handed a sixth of all centuries to "no school won"
 * while their players watched a school plainly ahead on the chart above it.
 */
export const SETTLED_MARGIN = 0.02;

export const dominant = (family: FamilyId, margin = DOMINANT_MARGIN): Condition =>
  all(leadFamily(family), { kind: 'leadMargin', op: '>=', value: margin });
/** True when the field is genuinely contested: nobody is clear of second place. */
export const contested: Condition = { kind: 'leadMargin', op: '<', value: DOMINANT_MARGIN };
/** Outstanding excitement the field has not yet delivered against. */
export const promises = (op: CmpOp, value: number): Condition => ({ kind: 'strain', field: 'promises', op, value });
/** Consecutive turns the expectation gap has been open. Non-zero means funders have noticed. */
export const gapStreak = (op: CmpOp, value: number): Condition => ({ kind: 'strain', field: 'gapStreak', op, value });
export const resource = (
  key: Extract<Condition, { kind: 'resource' }>['key'],
  op: CmpOp,
  value: number,
): Condition => ({ kind: 'resource', key, op, value });

export const ratio = (
  num: Extract<Condition, { kind: 'ratio' }>['num'],
  den: Extract<Condition, { kind: 'ratio' }>['den'],
  op: CmpOp,
  value: number,
): Condition => ({ kind: 'ratio', num, den, op, value });

export const fam = (
  family: FamilyId,
  field: Extract<Condition, { kind: 'family' }>['field'],
  op: CmpOp,
  value: number,
): Condition => ({ kind: 'family', family, field, op, value });

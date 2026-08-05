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

/** The family with the largest share of matured work, weighted by insight. Ties break by id order. */
export function leadingFamily(s: GameState): FamilyId {
  let best: FamilyId = FAMILY_IDS[0];
  let bestScore = -Infinity;
  for (const f of FAMILY_IDS) {
    const st = s.families[f];
    const score = st.matured * 10 + st.insight + st.talent * 20;
    if (score > bestScore) {
      bestScore = score;
      best = f;
    }
  }
  return best;
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

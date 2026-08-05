/**
 * Deterministic PRNG (mulberry32).
 *
 * Every random decision in the game draws from the state's own cursor, so a run is fully
 * reproducible from `seed` plus the list of choices made. That is what makes the Monte Carlo
 * playtest harness and any bug report worth anything.
 */

export interface RngCursor {
  rng: number;
}

/** Advance the cursor and return a float in [0, 1). */
export function next(s: RngCursor): number {
  s.rng = (s.rng + 0x6d2b79f5) | 0;
  let t = s.rng;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Uniform float in [min, max). */
export function range(s: RngCursor, min: number, max: number): number {
  return min + next(s) * (max - min);
}

/** Uniform integer in [min, max] inclusive. */
export function int(s: RngCursor, min: number, max: number): number {
  return Math.floor(range(s, min, max + 1));
}

export function chance(s: RngCursor, p: number): boolean {
  return next(s) < p;
}

export function pick<T>(s: RngCursor, xs: readonly T[]): T {
  if (xs.length === 0) throw new Error('pick() from empty array');
  return xs[int(s, 0, xs.length - 1)]!;
}

/** Weighted pick. Weights need not sum to one; non-positive weights are skipped. */
export function weightedPick<T>(s: RngCursor, xs: readonly T[], weight: (x: T) => number): T | null {
  let total = 0;
  for (const x of xs) {
    const w = weight(x);
    if (w > 0) total += w;
  }
  if (total <= 0) return null;
  let roll = next(s) * total;
  for (const x of xs) {
    const w = weight(x);
    if (w <= 0) continue;
    roll -= w;
    if (roll <= 0) return x;
  }
  return xs[xs.length - 1]!;
}

/** Fisher-Yates, returning a new array and leaving the input alone. */
export function shuffled<T>(s: RngCursor, xs: readonly T[]): T[] {
  const out = xs.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = int(s, 0, i);
    const a = out[i]!;
    out[i] = out[j]!;
    out[j] = a;
  }
  return out;
}

/** Hash an arbitrary string to a 32-bit seed. Used for portrait and backdrop generation. */
export function hashString(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** A standalone cursor, for art and other things that must not disturb the game's RNG. */
export function cursor(seed: number): RngCursor {
  return { rng: seed | 0 };
}

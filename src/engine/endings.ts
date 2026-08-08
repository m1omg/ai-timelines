import { ENDINGS } from '../content/endings';
import { evaluate } from './conditions';
import type { Ending, GameState } from './types';

/**
 * Endings are evaluated in priority order and the first satisfied one wins, so specific
 * outcomes shadow general ones. `the-unfinished` has priority 0 and an unconditional trigger,
 * which guarantees every run terminates somewhere — the linter checks that it still does.
 */
export function resolveEnding(s: GameState): Ending {
  const sorted = [...ENDINGS].sort((a, b) => b.priority - a.priority);
  for (const e of sorted) {
    if (evaluate(e.when, s)) return e;
  }
  return sorted[sorted.length - 1]!;
}

/**
 * Every ending this century qualifies for, most specific first.
 *
 * Only one can be the verdict, and that is right — a century is entitled to a headline. But the
 * losing matches are not wrong, they are merely outranked, and throwing them away meant a run
 * that broke the concentration *and* was led by the substrate school was told about the first
 * and never the second. The report shows the rest as things that are also true.
 *
 * The unconditional fallback is excluded: it qualifies for everything by construction, so
 * listing it would say nothing about the run. Note it is excluded by having an `always` gate
 * rather than a missing one — checking for `when === undefined` looked right and let it through.
 */
export function qualifyingEndings(s: GameState): Ending[] {
  return [...ENDINGS]
    .sort((a, b) => b.priority - a.priority)
    .filter((e) => e.when !== undefined && e.when.kind !== 'always' && evaluate(e.when, s));
}

export function endingById(id: string): Ending | undefined {
  return ENDINGS.find((e) => e.id === id);
}

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

export function endingById(id: string): Ending | undefined {
  return ENDINGS.find((e) => e.id === id);
}

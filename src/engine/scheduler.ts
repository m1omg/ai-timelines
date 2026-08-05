import { evaluate } from './conditions';
import { next as rand, shuffled } from './rng';
import type { GameState, Scene } from './types';

/**
 * Scenes are not a playlist. Every turn the scheduler gathers everything whose conditions
 * currently hold and plays a handful, so the same year reads differently across runs and a
 * scene written for 1974 will simply not fire if the player has arranged for 1974 to go
 * differently. `pinned` is the escape hatch for beats the story genuinely requires.
 */

export function isEligible(s: GameState, sc: Scene): boolean {
  if (sc.once !== false && s.seenScenes.includes(sc.id)) return false;
  if (sc.act !== s.act && sc.act !== 0) return false;
  if (sc.years) {
    const [lo, hi] = sc.years;
    if (s.year < lo || s.year > hi) return false;
  }
  return evaluate(sc.when, s);
}

export function eligibleScenes(s: GameState, all: Scene[]): Scene[] {
  return all.filter((sc) => isEligible(s, sc));
}

/**
 * Pick this turn's scenes: every eligible pinned scene, then a weighted sample of the rest.
 * Weight rises steeply with priority so that a priority-9 crisis beats three priority-2
 * conversations, without ever making the conversations impossible.
 */
export function pickScenes(s: GameState, all: Scene[], count: number): Scene[] {
  const eligible = eligibleScenes(s, all);
  const pinned = eligible.filter((sc) => sc.pinned);
  const rest = eligible.filter((sc) => !sc.pinned);

  const chosen: Scene[] = pinned.slice().sort((a, b) => (b.priority ?? 1) - (a.priority ?? 1));
  const slots = Math.max(0, count - chosen.length);
  if (slots === 0 || rest.length === 0) return chosen;

  const pool = shuffled(s, rest);
  const scored = pool
    .map((sc) => ({ sc, key: Math.pow(sc.priority ?? 1, 1.6) * (0.55 + rand(s)) }))
    .sort((a, b) => b.key - a.key);

  for (const x of scored.slice(0, slots)) chosen.push(x.sc);
  return chosen;
}

/** Follow `next` and choice `goto` links from a scene to the end of its chain. */
export function resolveChain(all: Record<string, Scene>, startId: string, limit = 24): Scene[] {
  const out: Scene[] = [];
  let id: string | undefined = startId;
  const guard = new Set<string>();
  while (id && out.length < limit) {
    if (guard.has(id)) break;
    guard.add(id);
    const sc: Scene | undefined = all[id];
    if (!sc) break;
    out.push(sc);
    id = sc.next;
  }
  return out;
}

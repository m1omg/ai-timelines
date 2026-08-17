import { cursor, hashString, int } from './rng';
import type { Line } from './types';

/**
 * Choosing between a line's alternative wordings.
 *
 * Pure, and deliberately not inside the scene player: the narrator carries more than half the
 * text in this game and several of its scenes fire three or four times in a century, so whether
 * this actually varies is a property worth testing rather than trusting.
 *
 * The choice is made from the seed, the scene, the line and the turn. Seed and scene mean two
 * runs read differently; the turn means a scene that fires twice in one century does not repeat
 * itself the second time; and every input is part of the run's own state, so a replayed seed
 * still produces the identical century, word for word.
 */
export function wordingOf(line: Line, sceneId: string, seed: number, turn: number): string {
  if (!line.alts?.length) return line.text;
  const options = [line.text, ...line.alts];
  const rc = cursor(hashString(`${seed}:${sceneId}:${line.text.length}:${turn}`));
  return options[int(rc, 0, options.length - 1)]!;
}

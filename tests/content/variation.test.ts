import { describe, expect, it } from 'vitest';
import { ALL_SCENES } from '../../src/content/scenes';
import { CHARACTERS } from '../../src/content/characters';
import { wordingOf } from '../../src/engine/wording';
import type { Line } from '../../src/engine/types';

/**
 * Replay variety, which is a content property rather than a code one and so is easy to assert
 * loudly and then quietly lose. The narrator carries more than half the lines in this game, and
 * a handful of its scenes fire three or four times in a single century — so "the archivist says
 * the same thing every run" is the default state unless something checks.
 */

const NARRATORS = new Set(CHARACTERS.filter((c) => c.narrator).map((c) => c.id));
const RECURRING = ALL_SCENES.filter((s) => s.act === 'any' || s.once === false);

const linesOf = (pred: (l: Line) => boolean) =>
  ALL_SCENES.flatMap((s) => s.lines.filter(pred).map((l) => ({ scene: s.id, line: l })));

describe('replay variation', () => {
  it('varies the wording across seeds and holds it steady within a run', () => {
    const withAlts = linesOf((l) => Boolean(l.alts?.length));
    expect(withAlts.length).toBeGreaterThan(20);

    let differed = 0;
    for (const { scene, line } of withAlts) {
      const a = wordingOf(line, scene, 1956, 3);
      const b = wordingOf(line, scene, 1956, 3);
      expect(b, 'the same run must replay word for word').toBe(a);

      const spread = new Set([1, 2, 3, 4, 5, 6, 7, 8].map((seed) => wordingOf(line, scene, seed, 3)));
      if (spread.size > 1) differed += 1;
    }
    // Not every line has to differ over eight seeds — a two-option line lands the same way often
    // enough — but the great majority must, or the alternatives are decorative.
    expect(differed / withAlts.length).toBeGreaterThan(0.9);
  });

  it('gives a scene that fires more than once something new to say the second time', () => {
    for (const s of RECURRING) {
      const varied = s.lines.filter((l) => l.alts?.length || l.when);
      expect(varied.length, `${s.id} plays identically every time it fires`).toBeGreaterThan(0);
    }
  });

  it('never offers an alternative that is not an alternative', () => {
    for (const { scene, line } of linesOf((l) => Boolean(l.alts?.length))) {
      const all = [line.text, ...line.alts!];
      expect(new Set(all).size, `${scene}: duplicate wording`).toBe(all.length);
      for (const a of line.alts!) expect(a.trim().length, `${scene}: empty wording`).toBeGreaterThan(0);
    }
  });

  it('keeps the narrator, who speaks most, the best varied', () => {
    const narrator = linesOf((l) => Boolean(l.who && NARRATORS.has(l.who)));
    const varied = narrator.filter(({ line }) => line.alts?.length || line.when);
    // Every narrator line does not need a variant — many are single beats in a scene that plays
    // once. This is a floor, and it is the number that regressed to zero before any of this.
    expect(varied.length / narrator.length).toBeGreaterThan(0.25);
  });
});

import { describe, expect, it } from 'vitest';
import { ENDINGS } from '../../src/content/endings';
import { all, flagSet, mature, not, resource } from '../../src/engine/conditions';
import { describeCondition, measured, phraseCondition } from '../../src/engine/describe';
import { leaves, nearestMiss, resolveEnding } from '../../src/engine/endings';
import { createState } from '../../src/engine/state';
import type { Condition } from '../../src/engine/types';

/**
 * Conditions read back as prose. The ending screen shows the player why a verdict was reached,
 * so every leaf an ending can turn on has to have words — and the words must never be the raw
 * flag name or a kind, which is what the fallback prints and what a player must never see.
 */

const RAW = /\b(flagSet|leadFamily|winterCount|inWinter|[a-z]+[A-Z][a-zA-Z]+)\b/;

const everyLeaf = (c: Condition): Condition[] => {
  switch (c.kind) {
    case 'all':
    case 'any':
      return c.cs.flatMap(everyLeaf);
    case 'not':
      return everyLeaf(c.c);
    default:
      return [c];
  }
};

describe('conditions in prose', () => {
  it('has words for every leaf of every ending, and none of them are an identifier', () => {
    for (const e of ENDINGS) {
      if (!e.when || e.when.kind === 'always') continue;
      for (const leaf of everyLeaf(e.when)) {
        for (const negated of [false, true]) {
          const text = phraseCondition(leaf, negated);
          expect(text, `${e.id}: ${JSON.stringify(leaf)}`).toBeTruthy();
          expect(text, `${e.id}: ${text}`).not.toMatch(RAW);
        }
      }
    }
  });

  it('reports only what carried an any, and everything in an all', () => {
    const s = createState(1956);
    s.flags['treaty'] = 1;
    s.resources.capability = 100;
    const c = all(resource('capability', '>', 50), { kind: 'any', cs: [flagSet('treaty'), flagSet('succession')] });
    const reasons = describeCondition(c, s);
    expect(reasons).toHaveLength(2);
    expect(reasons[0]).toBe('capability above 50');
    expect(reasons[1]).toBe('a compute treaty was signed');
  });

  it('phrases an absence as an absence', () => {
    expect(phraseCondition(not(flagSet('treaty')))).toBe('no treaty was signed');
    expect(phraseCondition(not(mature('grand-synthesis')))).toMatch(/never established$/);
    expect(phraseCondition(not(resource('exposure', '<', 20)))).toBe('unaddressed consequence of at least 20');
  });

  it('flattens an all into the leaves a player would count separately', () => {
    const c = all(resource('capability', '>', 50), all(flagSet('treaty'), not(flagSet('autonomy'))));
    expect(leaves(c)).toHaveLength(3);
  });

  it('names the ending that was one leaf away, and never the verdict itself', () => {
    const s = createState(1956);
    s.turn = 25;
    s.year = 2050;
    const resolved = resolveEnding(s);
    const miss = nearestMiss(s);
    if (miss) {
      expect(miss.ending.id).not.toBe(resolved.id);
      expect(miss.ending.priority).toBeGreaterThan(resolved.priority);
      expect(leaves(miss.ending.when).filter((l) => !phraseCondition(l))).toHaveLength(0);
    }
    // A century that was clearly one thing short: everything for the settlement but the node.
    const measuredText = measured(resource('capability', '>', 330), s);
    expect(measuredText).toBe(`${Math.round(s.resources.capability)}`);
  });
});

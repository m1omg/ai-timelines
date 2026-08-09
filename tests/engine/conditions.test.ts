import { describe, expect, it } from 'vitest';

import {
  all,
  any,
  compare,
  contested,
  dominant,
  evaluate,
  leadMargin,
  mature,
  not,
  ratio,
  resource,
} from '../../src/engine/conditions';
import { advanceTurn } from '../../src/engine/sim';
import { FAMILY_IDS } from '../../src/engine/types';
import { applyEffect } from '../../src/engine/effects';
import { createState } from '../../src/engine/state';

describe('compare', () => {
  it('handles the ordering operators on numbers', () => {
    expect(compare(3, '<', 5)).toBe(true);
    expect(compare(5, '<=', 5)).toBe(true);
    expect(compare(5, '>', 5)).toBe(false);
    expect(compare(6, '>=', 5)).toBe(true);
  });

  it('handles equality on strings and booleans', () => {
    expect(compare('build', '==', 'build')).toBe(true);
    expect(compare('build', '!=', 'guard')).toBe(true);
    expect(compare(true, '==', true)).toBe(true);
  });

  it('coerces booleans to 0/1 for ordering', () => {
    expect(compare(true, '>', 0)).toBe(true);
    expect(compare(false, '<', 1)).toBe(true);
  });

  it('refuses to order strings rather than guessing', () => {
    expect(compare('a', '<', 'b')).toBe(false);
  });
});

describe('flag conditions', () => {
  it('reads an unset numeric flag as zero', () => {
    const s = createState(1);
    expect(evaluate({ kind: 'flag', flag: 'nope', op: '==', value: 0 }, s)).toBe(true);
    expect(evaluate({ kind: 'flag', flag: 'nope', op: '>=', value: 1 }, s)).toBe(false);
  });

  it('reads an unset string flag as empty', () => {
    const s = createState(1);
    expect(evaluate({ kind: 'flag', flag: 'disposition', op: '==', value: '' }, s)).toBe(true);
  });

  it('treats zero and false as not set', () => {
    const s = createState(1);
    applyEffect(s, { kind: 'flag', flag: 'x', op: 'set', value: 0 });
    expect(evaluate({ kind: 'flagSet', flag: 'x' }, s)).toBe(false);
    applyEffect(s, { kind: 'flag', flag: 'x', op: 'set', value: true });
    expect(evaluate({ kind: 'flagSet', flag: 'x' }, s)).toBe(true);
  });

  it('accumulates with the add operator', () => {
    const s = createState(1);
    applyEffect(s, { kind: 'flag', flag: 'institutions', op: 'add', value: 1 });
    applyEffect(s, { kind: 'flag', flag: 'institutions', op: 'add', value: 2 });
    expect(s.flags.institutions).toBe(3);
  });
});

describe('ratio', () => {
  it('compares one resource against another', () => {
    const s = createState(1);
    s.resources.understanding = 60;
    s.resources.capability = 100;
    expect(evaluate(ratio('understanding', 'capability', '>=', 0.6), s)).toBe(true);
    expect(evaluate(ratio('understanding', 'capability', '>=', 0.7), s)).toBe(false);
  });

  it('treats a zero denominator as maximally favourable rather than throwing', () => {
    const s = createState(1);
    s.resources.capability = 0;
    s.resources.understanding = 5;
    expect(evaluate(ratio('understanding', 'capability', '>', 1000), s)).toBe(true);
  });
});

describe('boolean combinators', () => {
  it('short-circuits correctly', () => {
    const s = createState(1);
    s.resources.capability = 50;
    expect(evaluate(all(resource('capability', '>', 10), resource('capability', '<', 100)), s)).toBe(true);
    expect(evaluate(all(resource('capability', '>', 10), resource('capability', '<', 20)), s)).toBe(false);
    expect(evaluate(any(resource('capability', '<', 20), resource('capability', '>', 40)), s)).toBe(true);
    expect(evaluate(not(resource('capability', '>', 40)), s)).toBe(false);
  });

  it('treats an absent condition as satisfied', () => {
    expect(evaluate(undefined, createState(1))).toBe(true);
  });
});

describe('paradigm conditions', () => {
  it('matches on status', () => {
    const s = createState(1);
    expect(evaluate(mature('perceptron'), s)).toBe(false);
    applyEffect(s, { kind: 'paradigm', id: 'perceptron', op: 'mature' });
    expect(evaluate(mature('perceptron'), s)).toBe(true);
  });

  it('matches on a set of statuses', () => {
    const s = createState(1);
    applyEffect(s, { kind: 'paradigm', id: 'perceptron', op: 'progress', value: 5 });
    expect(evaluate({ kind: 'paradigm', id: 'perceptron', status: ['active', 'dormant'] }, s)).toBe(true);
  });

  it('returns false for an unknown paradigm rather than throwing', () => {
    const s = createState(1);
    expect(evaluate({ kind: 'paradigm', id: 'does-not-exist', status: 'mature' }, s)).toBe(false);
  });
});

/*
 * A lead is not the same thing as dominance, and until there was a way to say so, content could
 * not tell the difference: `leadFamily` is an argmax, so *some* school always satisfies it and
 * "nobody has won" was unsayable. A scene wanting to assert a contested field had to say it
 * unconditionally — and then said it in centuries where one school plainly had won.
 */
describe('how far ahead the leading school is', () => {
  it('is zero when the schools are level', () => {
    const s = createState(101);
    for (const f of FAMILY_IDS) {
      s.families[f].insight = 10;
      s.families[f].matured = 1;
      s.families[f].momentum = 0;
    }
    expect(leadMargin(s)).toBeCloseTo(0, 6);
    expect(evaluate(contested, s)).toBe(true);
  });

  it('grows as one school pulls clear', () => {
    const s = createState(102);
    for (const f of FAMILY_IDS) {
      s.families[f].insight = 10;
      s.families[f].matured = 1;
    }
    const level = leadMargin(s);
    s.families.connectionist.insight = 400;
    s.families.connectionist.matured = 20;
    expect(leadMargin(s)).toBeGreaterThan(level);
    expect(evaluate(dominant('connectionist'), s)).toBe(true);
  });

  it('is never negative, whatever the standings', () => {
    const s = createState(103);
    for (const f of FAMILY_IDS) s.families[f].momentum = -50;
    expect(leadMargin(s)).toBeGreaterThanOrEqual(0);
  });

  /*
   * The property the content depends on. Exactly one of these holds in any century, so a scene
   * can offer a contested line and eight school lines and be certain of showing precisely one.
   */
  it('is exclusive and exhaustive against dominance, in every century', () => {
    for (let seed = 1; seed <= 40; seed++) {
      const s = createState(seed * 131);
      for (let t = 0; t < 25; t++) {
        advanceTurn(s);
        const said = [
          evaluate(contested, s),
          ...FAMILY_IDS.map((f) => evaluate(dominant(f), s)),
        ].filter(Boolean).length;
        expect(said).toBe(1);
      }
    }
  });
});

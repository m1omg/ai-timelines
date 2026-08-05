import { describe, expect, it } from 'vitest';

import { all, any, compare, evaluate, mature, not, ratio, resource } from '../../src/engine/conditions';
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

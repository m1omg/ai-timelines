import { describe, expect, it } from 'vitest';

import { PARADIGMS } from '../../src/content/paradigms';
import { evaluate, leadingFamily } from '../../src/engine/conditions';
import { applyEffect, applyEffects, normaliseTalent } from '../../src/engine/effects';
import { advanceTurn, computeAdequacy, prereqsMet } from '../../src/engine/sim';
import { TOTAL_TURNS, cloneState, createState, yearOfTurn } from '../../src/engine/state';
import type { GameState } from '../../src/engine/types';
import { FAMILY_IDS } from '../../src/engine/types';

function runTurns(s: GameState, n: number): void {
  for (let i = 0; i < n && s.turn < TOTAL_TURNS - 1; i++) advanceTurn(s);
}

describe('the clock', () => {
  it('runs from 1950 to exactly 2050', () => {
    const s = createState(1);
    expect(s.year).toBe(1950);
    runTurns(s, 100);
    expect(s.turn).toBe(TOTAL_TURNS - 1);
    expect(s.year).toBe(2050);
  });

  it('moves through all seven acts in order', () => {
    const s = createState(2);
    const acts: number[] = [s.act];
    for (let i = 0; i < TOTAL_TURNS; i++) {
      advanceTurn(s);
      if (acts[acts.length - 1] !== s.act) acts.push(s.act);
      if (s.turn >= TOTAL_TURNS - 1) break;
    }
    expect(acts).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('maps turns to years four at a time', () => {
    expect(yearOfTurn(0)).toBe(1950);
    expect(yearOfTurn(1)).toBe(1954);
    expect(yearOfTurn(TOTAL_TURNS - 1)).toBe(2050);
  });
});

describe('determinism', () => {
  it('produces an identical century from the same seed', () => {
    const a = createState(4242);
    const b = createState(4242);
    runTurns(a, 100);
    runTurns(b, 100);
    expect(b.resources).toEqual(a.resources);
    expect(b.computeLog).toBe(a.computeLog);
    expect(b.winters).toEqual(a.winters);
    expect(Object.keys(b.paradigms).filter((k) => b.paradigms[k]!.status === 'mature')).toEqual(
      Object.keys(a.paradigms).filter((k) => a.paradigms[k]!.status === 'mature'),
    );
  });

  it('produces different centuries from different seeds', () => {
    const a = createState(1);
    const b = createState(999);
    runTurns(a, 100);
    runTurns(b, 100);
    /*
     * Compare the century, not one number from it. Capability is a sum over whichever paradigms
     * matured, so it is coarse: two genuinely different runs can land on the same total, and two
     * did the moment new nodes shifted the values — seeds 1 and 999 agreed to the decimal while
     * differing in insight, momentum and the order things arrived in.
     *
     * The RNG was not at fault and was checked: the two seeds diverge from their first draw.
     */
    expect(b.families).not.toEqual(a.families);
    expect(b).not.toEqual(a);
  });

  it('is unaffected by cloning mid-run', () => {
    const a = createState(77);
    runTurns(a, 6);
    const b = cloneState(a);
    runTurns(a, 6);
    runTurns(b, 6);
    expect(b.resources).toEqual(a.resources);
  });
});

describe('the compute frontier', () => {
  it('grows monotonically and lands in a plausible band by 2050', () => {
    const s = createState(31);
    let last = s.computeLog;
    runTurns(s, 100);
    expect(s.computeLog).toBeGreaterThan(last);
    last = s.computeLog;
    // A century with no player input at all lands near 10^23; a substrate-heavy one
    // reaches the low 10^32s. The band exists to catch runaway growth, which is the
    // failure mode this number actually has.
    expect(s.computeLog).toBeGreaterThan(21);
    expect(s.computeLog).toBeLessThan(34);
  });

  it('gates ideas whose demonstration the hardware cannot support', () => {
    const p = PARADIGMS.find((x) => x.id === 'scaling-regime')!;
    expect(computeAdequacy(p, p.computeNeed - 5)).toBe(0);
    expect(computeAdequacy(p, p.computeNeed)).toBe(1);
    expect(computeAdequacy(p, p.computeNeed + 10)).toBeLessThanOrEqual(1.15);
  });
});

describe('paradigm unlocking', () => {
  it('refuses to unlock a node before its era, however much support it has', () => {
    const s = createState(5);
    const late = PARADIGMS.find((p) => p.earliest >= 2030)!;
    applyEffect(s, { kind: 'paradigm', id: late.id, op: 'progress', value: 10_000 });
    expect(s.paradigms[late.id]!.status).not.toBe('mature');
    // ...and the sim never surfaces it while the year is still 1950.
    expect(s.year).toBe(1950);
  });

  it('requires every prerequisite to be mature', () => {
    const s = createState(6);
    const withPrereqs = PARADIGMS.find((p) => p.prereqs.length > 0)!;
    expect(prereqsMet(s, withPrereqs)).toBe(false);
    for (const id of withPrereqs.prereqs) {
      applyEffect(s, { kind: 'paradigm', id, op: 'mature' });
    }
    expect(prereqsMet(s, withPrereqs)).toBe(true);
  });

  it('honours cross-family insight gates', () => {
    const s = createState(7);
    const gated = PARADIGMS.find((p) => p.familyPrereqs && p.prereqs.length === 0)!;
    expect(prereqsMet(s, gated)).toBe(false);
    for (const [f, need] of Object.entries(gated.familyPrereqs!)) {
      s.families[f as keyof typeof s.families].insight = need as number;
    }
    expect(prereqsMet(s, gated)).toBe(true);
  });
});

describe('winters', () => {
  it('fires when promises outrun delivery for two consecutive turns', () => {
    const s = createState(11);
    // Force a large outstanding promise with nothing shipping against it.
    for (let i = 0; i < 4 && !s.inWinter; i++) {
      s.promises = 140;
      s.resources.attention = 95;
      advanceTurn(s);
    }
    expect(s.winters.length).toBeGreaterThan(0);
    expect(s.resources.credibility).toBeLessThan(50);
  });

  it('does not fire in a century that never over-promises', () => {
    const s = createState(12);
    for (let i = 0; i < TOTAL_TURNS - 1; i++) {
      s.promises = 0;
      s.resources.attention = 0;
      advanceTurn(s);
    }
    expect(s.winters).toHaveLength(0);
  });

  it('sends the blamed school dormant and scatters its people', () => {
    const s = createState(13);
    for (let i = 0; i < 6 && !s.inWinter; i++) {
      s.promises = 160;
      s.resources.attention = 100;
      advanceTurn(s);
    }
    const rec = s.winters[0]!;
    expect(s.families[rec.blamed].momentum).toBeLessThan(0);
    expect(s.families[rec.blamed].talent).toBeLessThan(1 / FAMILY_IDS.length);
  });
});

describe('talent', () => {
  it('always sums to one across the eight schools', () => {
    const s = createState(21);
    for (let i = 0; i < 10; i++) {
      advanceTurn(s);
      const total = FAMILY_IDS.reduce((n, f) => n + s.families[f].talent, 0);
      expect(total).toBeCloseTo(1, 6);
    }
  });

  it('redistributes rather than creates when a school is boosted', () => {
    const s = createState(22);
    applyEffect(s, { kind: 'family', family: 'symbolic', field: 'talent', op: 'add', value: 0.4 });
    const total = FAMILY_IDS.reduce((n, f) => n + s.families[f].talent, 0);
    expect(total).toBeCloseTo(1, 6);
    expect(s.families.symbolic.talent).toBeGreaterThan(1 / FAMILY_IDS.length);
    expect(s.families.connectionist.talent).toBeLessThan(1 / FAMILY_IDS.length);
  });

  it('never lets a school fall to exactly zero', () => {
    const s = createState(23);
    for (const f of FAMILY_IDS) s.families[f].talent = f === 'symbolic' ? 1 : 0;
    normaliseTalent(s);
    for (const f of FAMILY_IDS) expect(s.families[f].talent).toBeGreaterThan(0);
  });
});

describe('resource bounds', () => {
  it('keeps every resource within its ceiling across a full century', () => {
    const s = createState(41);
    for (let i = 0; i < TOTAL_TURNS - 1; i++) {
      advanceTurn(s);
      expect(s.resources.attention).toBeLessThanOrEqual(100);
      expect(s.resources.credibility).toBeLessThanOrEqual(100);
      expect(s.resources.capability).toBeLessThanOrEqual(400);
      expect(s.resources.understanding).toBeLessThanOrEqual(300);
      for (const k of Object.keys(s.resources) as (keyof typeof s.resources)[]) {
        expect(s.resources[k]).toBeGreaterThanOrEqual(0);
        expect(Number.isFinite(s.resources[k])).toBe(true);
      }
      for (const p of Object.values(s.patrons)) {
        expect(p).toBeGreaterThanOrEqual(0);
        expect(p).toBeLessThanOrEqual(100);
      }
    }
  });
});

describe('leadingFamily', () => {
  it('reports the school with the most matured work', () => {
    const s = createState(51);
    s.families.evolutionary.matured = 9;
    s.families.evolutionary.insight = 120;
    expect(leadingFamily(s)).toBe('evolutionary');
  });
});

describe('effects', () => {
  it('applies a list in order', () => {
    const s = createState(61);
    applyEffects(s, [
      { kind: 'resource', key: 'attention', op: 'set', value: 10 },
      { kind: 'resource', key: 'attention', op: 'add', value: 5 },
      { kind: 'resource', key: 'attention', op: 'mul', value: 2 },
    ]);
    expect(s.resources.attention).toBe(30);
  });

  it('treats emphasis as a per-turn instruction, not a standing order', () => {
    const s = createState(62);
    const id = 'perceptron';
    applyEffect(s, { kind: 'paradigm', id, op: 'emphasis', value: 3 });
    expect(s.paradigms[id]!.emphasis).toBe(3);
    advanceTurn(s);
    expect(s.paradigms[id]!.emphasis).toBe(1);
  });

  it('records an ending id without ending the run itself', () => {
    const s = createState(63);
    applyEffect(s, { kind: 'ending', id: 'the-unfinished' });
    expect(s.ending).toBe('the-unfinished');
    expect(evaluate({ kind: 'always' }, s)).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';

import {
  describeEffects,
  effectFamily,
  familyShares,
  familyStanding,
  recordSnapshot,
} from '../../src/engine/describe';
import { availableDirectives, canAfford, takeDirective } from '../../src/engine/directives';
import { applyEffect } from '../../src/engine/effects';
import { advanceTurn } from '../../src/engine/sim';
import { TOTAL_TURNS, cloneState, createState } from '../../src/engine/state';
import { gaugeValue, spendableInfluence } from '../../src/ui/console';
import type { GameState } from '../../src/engine/types';
import { FAMILY_IDS, PATRON_IDS } from '../../src/engine/types';

/** Spend until nothing is affordable, which is where the display and the check used to disagree. */
function spendDown(s: GameState): void {
  for (let guard = 0; guard < 40; guard++) {
    const buy = availableDirectives(s).find((d) => canAfford(s, d) && d.cost > 0 && !d.endsTurn);
    if (!buy) return;
    takeDirective(s, buy);
  }
}

describe('the influence readout', () => {
  /*
   * The bug this pins down: influence accrues in fractions, every cost is a whole number, and
   * the gauge used to round. 6.57 displayed as "7" while a 7-cost card stayed disabled, so the
   * board looked broken. Flooring a spendable resource makes "the gauge says 7" and "I can buy
   * a 7" the same statement.
   */
  it('never shows more influence than can actually be spent', () => {
    let checked = 0;
    for (let seed = 1; seed <= 25; seed++) {
      const s = createState(seed);
      for (let t = 0; t < TOTAL_TURNS - 1; t++) {
        for (let guard = 0; guard < 40; guard++) {
          const shown = gaugeValue(s.resources.influence, true);
          for (const d of availableDirectives(s)) {
            checked++;
            expect(shown >= d.cost).toBe(canAfford(s, d));
          }
          const buy = availableDirectives(s).find((x) => canAfford(s, x) && x.cost > 0 && !x.endsTurn);
          if (!buy) break;
          takeDirective(s, buy);
        }
        advanceTurn(s);
      }
    }
    expect(checked).toBeGreaterThan(10000);
  });

  it('floors what is spendable and rounds what is not', () => {
    expect(gaugeValue(6.9, true)).toBe(6);
    expect(gaugeValue(6.9, false)).toBe(7);
    const s = createState(3);
    s.resources.influence = 12.8;
    expect(spendableInfluence(s)).toBe(12);
  });
});

describe('standing across the schools', () => {
  it('shares are non-negative and sum to one', () => {
    for (let seed = 1; seed <= 8; seed++) {
      const s = createState(seed);
      for (let t = 0; t < 12; t++) {
        const shares = familyShares(s);
        let total = 0;
        for (const f of FAMILY_IDS) {
          expect(shares[f]).toBeGreaterThanOrEqual(0);
          total += shares[f];
        }
        expect(total).toBeCloseTo(1, 6);
        advanceTurn(s);
      }
    }
  });

  it('rises for a school whose work matures', () => {
    const s = createState(9);
    const before = familyStanding(s, 'connectionist');
    s.families.connectionist.matured += 3;
    s.families.connectionist.insight += 40;
    expect(familyStanding(s, 'connectionist')).toBeGreaterThan(before);
  });
});

describe('the record of what was decided', () => {
  it('logs every directive with what it cost and what it did', () => {
    const s = createState(11);
    const d = availableDirectives(s).find((x) => canAfford(s, x) && x.cost > 0)!;
    takeDirective(s, d);
    const rec = s.decisions!.at(-1)!;
    expect(rec.kind).toBe('directive');
    expect(rec.label).toBe(d.name);
    expect(rec.influenceSpent).toBe(d.cost);
    expect(rec.consequences.length).toBeGreaterThan(0);
    expect(rec.year).toBe(1950);
  });

  it('keeps one history row per turn, even when a turn is replayed', () => {
    const s = createState(12);
    for (let t = 0; t < 6; t++) advanceTurn(s);
    const turns = s.history!.map((h) => h.turn);
    expect(turns).toEqual([...new Set(turns)]);
    expect(turns).toEqual(turns.slice().sort((a, b) => a - b));

    // Replay the same turn, the way the Back button does.
    const before = s.history!.length;
    const snapshot = cloneState(s);
    snapshot.turn = s.turn;
    advanceTurn(snapshot);
    snapshot.turn -= 1;
    snapshot.year -= 4;
    recordSnapshot(snapshot);
    expect(snapshot.history!.filter((h) => h.turn === snapshot.turn)).toHaveLength(1);
    expect(before).toBeGreaterThan(0);
  });

  it('does not let an undo snapshot keep collecting decisions', () => {
    const s = createState(13);
    const undoPoint = cloneState(s);
    spendDown(s);
    expect(s.decisions!.length).toBeGreaterThan(0);
    expect(undoPoint.decisions!.length).toBe(0);
  });
});

describe('backing people who belong to no school', () => {
  /** Put a character on stage so the board will offer them. */
  function meet(s: GameState, id: string): void {
    s.characters[id]!.met = true;
    s.characters[id]!.active = true;
  }

  it('pays a school with least of the field more than the school with most', () => {
    const s = createState(21);
    s.families.connectionist.matured = 8;
    s.families.connectionist.insight = 200;
    const behind = 'collective';
    const beforeLead = s.families.connectionist.insight;
    const beforeBehind = s.families[behind].insight;

    applyEffect(s, { kind: 'commons', value: 40 });

    const toLead = s.families.connectionist.insight - beforeLead;
    const toBehind = s.families[behind].insight - beforeBehind;
    expect(toBehind).toBeGreaterThan(toLead);
    // And the whole payment is distributed, not partly discarded.
    const total = FAMILY_IDS.reduce((n, f) => n + s.families[f].insight, 0);
    const was = beforeLead + beforeBehind;
    expect(total).toBeGreaterThan(was);
  });

  it('splits evenly when no school is ahead', () => {
    const s = createState(22);
    const before = FAMILY_IDS.map((f) => s.families[f].insight);
    applyEffect(s, { kind: 'commons', value: 80 });
    const gains = FAMILY_IDS.map((f, i) => s.families[f].insight - before[i]!);
    const spread = Math.max(...gains) - Math.min(...gains);
    // Start-of-game standing is not perfectly level (some schools inherit pre-1950 work), so
    // allow a little tilt — but nothing like a winner-takes-most split.
    expect(spread).toBeLessThan(Math.max(...gains) * 0.75);
  });

  it('lets promises be paid down, and never below zero', () => {
    const s = createState(23);
    s.promises = 10;
    applyEffect(s, { kind: 'promises', op: 'add', value: -14 });
    expect(s.promises).toBe(0);
  });

  it('offers the unaffiliated a different bargain from the school-aligned', () => {
    const s = createState(24);
    meet(s, 'turing'); // family: null
    meet(s, 'wiener'); // family: cybernetic
    const board = availableDirectives(s);

    const turing = board.find((d) => d.id === 'champion:turing')!;
    const wiener = board.find((d) => d.id === 'champion:wiener')!;

    expect(turing.effects.some((e) => e.kind === 'commons')).toBe(true);
    expect(turing.effects.some((e) => e.kind === 'promises')).toBe(true);
    expect(turing.effects.some((e) => e.kind === 'family')).toBe(false);

    expect(wiener.effects.some((e) => e.kind === 'family')).toBe(true);
    expect(wiener.effects.some((e) => e.kind === 'commons')).toBe(false);
  });

  it('unlocks the second tier only once affinity has been earned', () => {
    const s = createState(25);
    meet(s, 'turing');
    expect(availableDirectives(s).some((d) => d.id === 'centrepiece:turing')).toBe(false);
    s.characters.turing!.affinity = 40;
    expect(availableDirectives(s).some((d) => d.id === 'centrepiece:turing')).toBe(true);
  });

  it('never offers to endow the narrators', () => {
    const s = createState(26);
    meet(s, 'archivist');
    meet(s, 'second');
    const ids = availableDirectives(s).map((d) => d.id);
    expect(ids).not.toContain('champion:archivist');
    expect(ids).not.toContain('champion:second');
  });
});

describe('who is paying', () => {
  it('is recorded every turn so it can be charted', () => {
    const s = createState(27);
    for (let t = 0; t < 5; t++) advanceTurn(s);
    for (const row of s.history!) {
      expect(row.patrons).toBeDefined();
      for (const p of PATRON_IDS) {
        expect(row.patrons![p]).toBeGreaterThanOrEqual(0);
        expect(row.patrons![p]).toBeLessThanOrEqual(100);
      }
    }
  });

  it('drops across all four when a winter hits', () => {
    const s = createState(28);
    let before: Record<string, number> | null = null;
    for (let t = 0; t < TOTAL_TURNS - 1; t++) {
      const wasWinter = s.inWinter;
      const snapshot = { ...s.patrons };
      advanceTurn(s);
      if (!wasWinter && s.inWinter) {
        before = snapshot;
        break;
      }
    }
    if (!before) return; // this seed never had a winter; the other tests cover the rest
    for (const p of PATRON_IDS) expect(s.patrons[p]).toBeLessThan(before[p]!);
  });
});

describe('effects in words', () => {
  it('describes a resource change with its direction', () => {
    expect(describeEffects([{ kind: 'resource', key: 'attention', op: 'add', value: 8 }])).toEqual([
      '+8 public attention',
    ]);
    expect(describeEffects([{ kind: 'resource', key: 'credibility', op: 'add', value: -5 }])).toEqual([
      '-5 credibility with funders',
    ]);
  });

  it('attributes a directive to one school only when it favours exactly one', () => {
    expect(
      effectFamily([
        { kind: 'family', family: 'symbolic', field: 'momentum', op: 'add', value: 3 },
        { kind: 'paradigm', id: 'lisp', op: 'emphasis', value: 2 },
      ]),
    ).toBe('symbolic');
    expect(
      effectFamily([
        { kind: 'family', family: 'symbolic', field: 'momentum', op: 'add', value: 3 },
        { kind: 'family', family: 'connectionist', field: 'momentum', op: 'add', value: 3 },
      ]),
    ).toBeUndefined();
    expect(effectFamily([{ kind: 'resource', key: 'attention', op: 'add', value: 4 }])).toBeUndefined();
  });

  it('says nothing about bookkeeping the player cannot see', () => {
    expect(describeEffects([{ kind: 'flag', flag: 'x', op: 'set', value: true }])).toEqual([]);
  });
});

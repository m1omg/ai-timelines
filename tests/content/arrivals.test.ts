import { describe, expect, it } from 'vitest';

import { ARRIVALS } from '../../src/content/acts/arrivals';
import { SCENES } from '../../src/content/scenes';
import type { Condition, Effect, FamilyId } from '../../src/engine/types';
import { FAMILY_IDS } from '../../src/engine/types';

function conditionsIn(c: Condition | undefined, out: Condition[] = []): Condition[] {
  if (!c) return out;
  out.push(c);
  if (c.kind === 'all' || c.kind === 'any') c.cs.forEach((x) => conditionsIn(x, out));
  if (c.kind === 'not') conditionsIn(c.c, out);
  return out;
}

const effectsOf = (family: FamilyId): Effect[] => {
  const sc = ARRIVALS.find((s) => conditionsIn(s.when).some((c) => c.kind === 'leadFamily' && c.family === family));
  return (sc?.choices ?? []).flatMap((ch) => ch.effects ?? []);
};

const netOf = (family: FamilyId, key: string): number => {
  const sc = ARRIVALS.find((s) => conditionsIn(s.when).some((c) => c.kind === 'leadFamily' && c.family === family));
  // Best case across the scene's choices, which is what a player optimising for it would get.
  return Math.max(
    ...(sc?.choices ?? []).map((ch) =>
      (ch.effects ?? []).reduce((n, e) => (e.kind === 'resource' && e.key === key ? n + e.value : n), 0),
    ),
  );
};

describe('the arrivals', () => {
  it('gives every school but connectionist a moment of its own', () => {
    // Connectionism arrives in act 5 with the text box; the rest arrive in the 2030s or not at all.
    const covered = ARRIVALS.flatMap((s) =>
      conditionsIn(s.when).filter((c) => c.kind === 'leadFamily').map((c) => (c as { family: FamilyId }).family),
    );
    expect(new Set(covered)).toEqual(new Set(FAMILY_IDS.filter((f) => f !== 'connectionist')));
    expect(SCENES.some((s) => s.id === 'a5-public-arrives')).toBe(true);
  });

  it('fires only for the school that actually holds the field', () => {
    for (const s of ARRIVALS) {
      expect(conditionsIn(s.when).some((c) => c.kind === 'leadFamily')).toBe(true);
    }
  });

  /*
   * Each arrival is era-free and carries its own window, because the era a school could reach
   * people in is a fact about that school. Filing them all in one act made every alternative a
   * late version of connectionism's moment, which is the flattening these scenes exist to undo.
   */
  it('lets each school arrive in its own era, not in one shared decade', () => {
    const starts = new Set<number>();
    for (const s of ARRIVALS) {
      expect(s.act).toBe('any');
      expect(s.years).toBeDefined();
      expect(s.years![0]).toBeLessThan(s.years![1]);
      starts.add(s.years![0]);
    }
    // Several distinct opening years, and at least one that beats connectionism's 2022.
    expect(starts.size).toBeGreaterThanOrEqual(4);
    expect(Math.min(...starts)).toBeLessThan(2022);
  });

  it('lets no historical figure speak past the record', () => {
    // The depiction rules bar real people from act 6 onward; these are all invented or narration.
    const speakers = new Set(ARRIVALS.flatMap((s) => s.lines.map((l) => l.who).filter(Boolean)));
    for (const who of speakers) {
      expect(['archivist', 'second', 'nkemelu', 'wieczorek', 'okonjo', 'sorensen', 'halvorsen']).toContain(who);
    }
  });

  /*
   * The point of these scenes is that the centuries are not interchangeable, so this asserts
   * the shape of the differences rather than any particular number. If a future balance pass
   * flattens them into the same event with different prose, this fails.
   */
  it('makes the centuries genuinely different in kind', () => {
    // The collective century is discovered through an incident: the worst exposure on offer.
    expect(netOf('collective', 'exposure')).toBeGreaterThan(netOf('symbolic', 'exposure'));
    expect(netOf('collective', 'exposure')).toBeGreaterThan(netOf('statistical', 'exposure'));

    // The quiet ones buy understanding rather than attention.
    expect(netOf('statistical', 'attention')).toBeLessThan(netOf('collective', 'attention'));
    expect(netOf('bridge', 'understanding')).toBeGreaterThan(netOf('evolutionary', 'understanding'));

    // Substrate and symbolic arrive by reaching people, not by being talked about.
    expect(netOf('substrate', 'deployment')).toBeGreaterThan(netOf('substrate', 'attention'));
    expect(netOf('symbolic', 'deployment')).toBeGreaterThan(netOf('symbolic', 'attention'));

    // Only the schools that can account for themselves get to pay the hype debt down.
    const paysDown = (f: FamilyId) => effectsOf(f).some((e) => e.kind === 'promises' && e.value < 0);
    expect(paysDown('statistical')).toBe(true);
    expect(paysDown('bridge')).toBe(true);
    expect(paysDown('collective')).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';

import { CHARACTERS } from '../../src/content/characters';
import { ENDINGS } from '../../src/content/endings';
import { PARADIGMS } from '../../src/content/paradigms';
import { ALL_SCENES, SCENES } from '../../src/content/scenes';
import { resolveEnding } from '../../src/engine/endings';
import { pickScenes } from '../../src/engine/scheduler';
import { advanceTurn } from '../../src/engine/sim';
import { TOTAL_TURNS, createState } from '../../src/engine/state';
import { FAMILY_IDS } from '../../src/engine/types';

/**
 * These duplicate a few of tools/lint-content.ts's checks on purpose: the linter is a build
 * gate that a contributor can forget to run, and `npm test` is not.
 */

describe('content shape', () => {
  it('has content in every act', () => {
    for (let act = 1; act <= 7; act++) {
      expect(SCENES.filter((s) => s.act === act).length).toBeGreaterThan(0);
    }
  });

  it('has paradigms in every family', () => {
    for (const f of FAMILY_IDS) {
      expect(PARADIGMS.filter((p) => p.family === f).length).toBeGreaterThan(5);
    }
  });

  it('gives every real person a source', () => {
    for (const c of CHARACTERS.filter((x) => x.kind === 'historical')) {
      expect(c.sources, `${c.id} has no sources`).toBeDefined();
      expect(c.sources!.length).toBeGreaterThan(0);
    }
  });

  it('keeps real people out of the speculative acts', () => {
    const historical = new Set(CHARACTERS.filter((c) => c.kind === 'historical').map((c) => c.id));
    // The rule is about the year, not the act number: an era-free scene is bounded by its
    // years window instead, and 2026 is where the reconstruction stops.
    const pastTheRecord = (x: (typeof SCENES)[number]) =>
      x.act === 'any' ? (x.years?.[1] ?? 2050) > 2026 : x.act >= 6;
    for (const s of SCENES.filter(pastTheRecord)) {
      for (const line of s.lines) {
        expect(line.who && historical.has(line.who), `${s.id} puts words in a real person's mouth`).toBeFalsy();
      }
    }
    for (const e of ENDINGS) {
      for (const line of e.lines) {
        expect(line.who && historical.has(line.who), `ending ${e.id} does`).toBeFalsy();
      }
    }
  });

  it('has unique ids', () => {
    const ids = ALL_SCENES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    const pids = PARADIGMS.map((p) => p.id);
    expect(new Set(pids).size).toBe(pids.length);
  });

  it('resolves every choice target to a real scene', () => {
    const ids = new Set(ALL_SCENES.map((s) => s.id));
    for (const s of ALL_SCENES) {
      if (s.next) expect(ids.has(s.next), `${s.id} -> ${s.next}`).toBe(true);
      for (const c of s.choices ?? []) {
        if (c.goto) expect(ids.has(c.goto), `${s.id} -> ${c.goto}`).toBe(true);
      }
    }
  });
});

describe('endings', () => {
  it('always resolves to something', () => {
    for (let seed = 1; seed <= 40; seed++) {
      const s = createState(seed);
      for (let i = 0; i < TOTAL_TURNS - 1; i++) advanceTurn(s);
      const ending = resolveEnding(s);
      expect(ending).toBeDefined();
      expect(ending.lines.length).toBeGreaterThan(0);
      expect(ending.verdict.length).toBeGreaterThan(0);
    }
  });

  it('has exactly one unconditional fallback', () => {
    const fallback = ENDINGS.filter((e) => e.when.kind === 'always');
    expect(fallback).toHaveLength(1);
    expect(fallback[0]!.priority).toBe(0);
  });
});

describe('the scheduler', () => {
  it('never offers a scene twice in one run', () => {
    const s = createState(808);
    const seen = new Set<string>();
    for (let i = 0; i < TOTAL_TURNS - 1; i++) {
      for (const sc of pickScenes(s, SCENES, 3)) {
        if (sc.once !== false) {
          expect(seen.has(sc.id), `${sc.id} repeated`).toBe(false);
          seen.add(sc.id);
        }
        s.seenScenes.push(sc.id);
      }
      advanceTurn(s);
    }
  });

  it('finds something to play in every turn of every act', () => {
    for (let seed = 1; seed <= 12; seed++) {
      const s = createState(seed);
      for (let i = 0; i < TOTAL_TURNS - 1; i++) {
        const picked = pickScenes(s, SCENES, 3);
        expect(picked.length, `nothing to play in ${s.year} (seed ${seed})`).toBeGreaterThan(0);
        for (const sc of picked) s.seenScenes.push(sc.id);
        advanceTurn(s);
      }
    }
  });

  it('plays every pinned scene whose conditions hold', () => {
    const s = createState(4);
    const pinnedInActOne = SCENES.filter((sc) => sc.pinned && sc.act === 1 && sc.years?.[0] === 1950);
    const picked = pickScenes(s, SCENES, 3).map((sc) => sc.id);
    for (const sc of pinnedInActOne) expect(picked).toContain(sc.id);
  });
});

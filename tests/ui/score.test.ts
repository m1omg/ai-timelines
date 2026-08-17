import { describe, expect, it } from 'vitest';
import { ERA_VOICES, barSeconds, composeBar, eraVoice, type ScoreParams } from '../../src/ui/score';
import { FAMILY_IDS } from '../../src/engine/types';

/**
 * The score is pure on purpose, and this is the reason: sixteen bars of every era against every
 * school is 784 pieces of music that nobody is ever going to sit and listen to, and most of the
 * ways this can break are silent — a mode that indexes off its end, a composer that emits
 * nothing, a frequency that leaves the audible band and simply is not there.
 */

const ERAS = Object.keys(ERA_VOICES);

const base = (over: Partial<ScoreParams> = {}): ScoreParams => ({
  era: 'glass',
  school: 'symbolic',
  seed: 1956,
  bar: 0,
  winter: false,
  strain: 0,
  hold: 0.6,
  exposure: 0,
  ...over,
});

describe('the score', () => {
  it('gives every era and every school something to play, in every bar', () => {
    for (const era of ERAS) {
      for (const school of FAMILY_IDS) {
        for (let bar = 0; bar < 16; bar++) {
          const notes = composeBar(base({ era, school, bar }));
          expect(notes.length, `${era}/${school} bar ${bar}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('never emits a note outside the audible band or off the end of its bar', () => {
    for (const era of ERAS) {
      const voice = eraVoice(era);
      const length = barSeconds(voice);
      expect(length).toBeGreaterThan(0.5);
      for (const school of FAMILY_IDS) {
        for (const n of composeBar(base({ era, school, bar: 3 }))) {
          expect(Number.isFinite(n.freq)).toBe(true);
          expect(n.freq).toBeGreaterThan(20);
          expect(n.freq).toBeLessThan(12000);
          expect(n.gain).toBeGreaterThan(0);
          expect(n.gain).toBeLessThan(1);
          expect(n.at).toBeGreaterThanOrEqual(0);
          // A note may ring past the bar line — that is what sustain is — but not by a century.
          expect(n.at).toBeLessThanOrEqual(length);
          expect(n.dur).toBeGreaterThan(0);
        }
      }
    }
  });

  it('replays a century identically from its seed', () => {
    const once = composeBar(base({ era: 'cga', school: 'evolutionary', bar: 9 }));
    const twice = composeBar(base({ era: 'cga', school: 'evolutionary', bar: 9 }));
    expect(twice).toEqual(once);

    const elsewhere = composeBar(base({ era: 'cga', school: 'evolutionary', bar: 9, seed: 1957 }));
    expect(elsewhere).not.toEqual(once);
  });

  it('sounds like a different school in the same era', () => {
    const a = composeBar(base({ era: 'cga', school: 'symbolic', bar: 2 }));
    const b = composeBar(base({ era: 'cga', school: 'collective', bar: 2 }));
    expect(a.map((n) => n.freq)).not.toEqual(b.map((n) => n.freq));
  });

  it('thins out in a winter and keeps a floor under it', () => {
    for (const school of FAMILY_IDS) {
      const open = composeBar(base({ school, bar: 5 }));
      const winter = composeBar(base({ school, bar: 5, winter: true }));
      const loudness = (ns: typeof open) => ns.reduce((acc, n) => acc + n.gain * n.dur, 0);
      expect(loudness(winter), school).toBeLessThan(loudness(open));
      // Whatever else goes, the bass stays: a century without a floor reads as a bug.
      expect(winter.some((n) => n.role === 'bass'), school).toBe(true);
    }
  });

  it('detunes rather than rewrites when the field is overpromising', () => {
    const calm = composeBar(base({ school: 'statistical', bar: 4 }));
    const strained = composeBar(base({ school: 'statistical', bar: 4, strain: 0.9 }));
    expect(strained.length).toBe(calm.length);
    const moved = strained.filter((n, i) => n.freq !== calm[i]!.freq);
    expect(moved.length).toBeGreaterThan(0);
    for (const [i, n] of strained.entries()) {
      // Half a semitone at the very worst: out of tune with itself, not in another key.
      expect(Math.abs(Math.log2(n.freq / calm[i]!.freq) * 12)).toBeLessThan(0.5);
    }
  });

  it('takes the top off the mix as consequence accumulates, without rewriting the piece', () => {
    // Exposure is not another dissonance — strain is that. This should read as a century that
    // has stopped noticing rather than one that is worried, so the test is about brightness.
    for (const era of ['cga', 'glass', 'ambient']) {
      const clear = composeBar(base({ era, school: 'connectionist', bar: 6 }));
      const dulled = composeBar(base({ era, school: 'connectionist', bar: 6, exposure: 0.9 }));

      const top = (ns: typeof clear) => Math.max(...ns.map((n) => n.freq));
      expect(top(dulled), `${era}: the ceiling should come down`).toBeLessThanOrEqual(top(clear));

      // The floor of the piece is untouched: the bass and the beat are still there.
      const bass = (ns: typeof clear) => ns.filter((n) => n.role === 'bass' || n.role === 'perc').length;
      expect(bass(dulled), era).toBe(bass(clear));
    }
  });

  it('has a voice for every era the game can be in', () => {
    for (const era of ['teletype', 'phosphor', 'cga', 'web', 'glass', 'ambient', 'lucid']) {
      expect(ERA_VOICES[era], era).toBeDefined();
    }
  });
});

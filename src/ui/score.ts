import { chance, cursor, hashString, int, next, range, type RngCursor } from '../engine/rng';
import type { FamilyId } from '../engine/types';

/**
 * The score.
 *
 * Two axes, and neither one alone would be the game. The **era** decides what the music is made
 * of — a single square wave through a tinny speaker in 1954, an FM chip in 1986, warm sine
 * stacks by 2030 — and the **school in the lead** decides how it is put together. Symbolic
 * writes strict counterpoint from a rule. Statistical runs a Markov chain and sounds plausible
 * and slightly aimless. Evolutionary mutates one motif for a hundred years. Collective phases
 * the same cell against itself. So a symbolic 1980s and a connectionist 1980s share a timbre and
 * agree on nothing else, which is the argument the whole game is making, in the one medium where
 * you can hear two positions at once.
 *
 * Everything here is pure: composition returns a list of notes and never touches an audio API.
 * That is what lets it be tested, and what lets the offline renderer bounce a bar to a file.
 */

export type Role = 'lead' | 'counter' | 'pad' | 'bass' | 'perc';

export interface Note {
  /** Seconds from the start of the bar. */
  at: number;
  freq: number;
  dur: number;
  /** 0..1, before the era's own mix. */
  gain: number;
  role: Role;
  /** Where the pitch started, for the voices that slide rather than step. */
  glideFrom?: number;
}

export interface EraVoice {
  id: string;
  bpm: number;
  /** Hz of scale degree zero. The century descends: thin and high early, deep and wide late. */
  root: number;
  lead: OscillatorType;
  pad: OscillatorType | null;
  bass: OscillatorType;
  /** Band-limit on everything, standing in for the speaker of the day. */
  tone: number;
  /** Delay time in seconds and its feedback, 0 for the eras that had no such thing. */
  echo: [number, number];
  /** Envelope shape multiplier: staccato early, endless late. */
  sustain: number;
  /** Tape and analogue wobble, in cents. */
  drift: number;
  /** Hiss, relay noise, fan. */
  floor: number;
  /** How loud this era is allowed to be overall. */
  mix: number;
}

/**
 * One entry per era id in src/art/palette.ts. The progression is deliberate: a century of
 * machines getting quieter, wider and less certain that you are listening.
 */
export const ERA_VOICES: Record<string, EraVoice> = {
  teletype: {
    id: 'teletype',
    bpm: 74,
    root: 220,
    lead: 'square',
    pad: null,
    bass: 'square',
    tone: 2400,
    echo: [0, 0],
    sustain: 0.45,
    drift: 4,
    floor: 0.05,
    mix: 0.72,
  },
  phosphor: {
    id: 'phosphor',
    bpm: 62,
    root: 165,
    lead: 'triangle',
    pad: 'sine',
    bass: 'sine',
    tone: 3200,
    echo: [0.31, 0.34],
    sustain: 1.5,
    drift: 9,
    floor: 0.035,
    mix: 0.8,
  },
  cga: {
    id: 'cga',
    bpm: 112,
    root: 131,
    lead: 'square',
    pad: null,
    bass: 'square',
    tone: 5200,
    echo: [0, 0],
    sustain: 0.5,
    drift: 0,
    floor: 0.012,
    mix: 0.78,
  },
  web: {
    id: 'web',
    bpm: 92,
    root: 110,
    lead: 'triangle',
    pad: 'sawtooth',
    bass: 'triangle',
    tone: 4200,
    echo: [0.22, 0.3],
    sustain: 1.0,
    drift: 14,
    floor: 0.02,
    mix: 0.8,
  },
  glass: {
    id: 'glass',
    bpm: 84,
    root: 82,
    lead: 'sine',
    pad: 'sawtooth',
    bass: 'sine',
    tone: 6000,
    echo: [0.38, 0.42],
    sustain: 1.8,
    drift: 5,
    floor: 0.01,
    mix: 0.82,
  },
  ambient: {
    id: 'ambient',
    bpm: 54,
    root: 73,
    lead: 'sine',
    pad: 'sine',
    bass: 'sine',
    tone: 7000,
    echo: [0.52, 0.46],
    sustain: 2.6,
    drift: 3,
    floor: 0.006,
    mix: 0.76,
  },
  lucid: {
    // Barely a piece of music. The act refuses to name a device; the score refuses an instrument.
    id: 'lucid',
    bpm: 42,
    root: 55,
    lead: 'sine',
    pad: 'sine',
    bass: 'sine',
    tone: 9000,
    echo: [0.7, 0.5],
    sustain: 3.4,
    drift: 1,
    floor: 0.003,
    mix: 0.6,
  },
};

/**
 * A mode per school, which is the cheapest way to make eight positions distinguishable in two
 * bars. They are not arbitrary: whole tone has no gravity and no home, which is the right key
 * for a school that believes the substrate decides; pentatonic cannot make a wrong interval,
 * which is the right key for one that interpolates between states.
 */
const MODES: Record<FamilyId, number[]> = {
  symbolic: [0, 2, 4, 5, 7, 9, 11],
  connectionist: [0, 3, 5, 7, 10],
  statistical: [0, 2, 3, 5, 7, 9, 10],
  evolutionary: [0, 2, 4, 5, 7, 9, 10],
  collective: [0, 2, 4, 7, 9],
  cybernetic: [0, 2, 3, 5, 7, 8, 10],
  substrate: [0, 2, 4, 6, 8, 10],
  bridge: [0, 2, 4, 6, 7, 9, 11],
};

export interface ScoreParams {
  era: string;
  school: FamilyId;
  /** Run seed, so two centuries do not sound identical. */
  seed: number;
  /** Which bar of the piece this is; the composers use it as a generation counter. */
  bar: number;
  /** In a funding collapse: voices leave, and they come back slowly. */
  winter: boolean;
  /** 0..1, how far the field's promises have outrun what it delivered. Buys dissonance. */
  strain: number;
  /** 0..1, how much of the field this school actually holds. Thin at 0, full at 1. */
  hold: number;
}

export function barSeconds(voice: EraVoice): number {
  // Eight eighth-notes to the bar, everywhere. The bpm does the rest.
  return (60 / voice.bpm) * 4;
}

export function eraVoice(era: string): EraVoice {
  return ERA_VOICES[era] ?? ERA_VOICES.glass!;
}

/** Semitones for a scale degree, wrapping into octaves. */
function degree(mode: number[], d: number): number {
  const n = mode.length;
  const octave = Math.floor(d / n);
  return mode[((d % n) + n) % n]! + octave * 12;
}

function hz(voice: EraVoice, semitones: number, centsOff = 0): number {
  return voice.root * Math.pow(2, (semitones + centsOff / 100) / 12);
}

/**
 * Compose one bar. Deterministic in (seed, bar, era, school), so the same century replays to the
 * same music and an offline render matches what the player heard.
 */
export function composeBar(p: ScoreParams): Note[] {
  const voice = eraVoice(p.era);
  const mode = MODES[p.school];
  const rc = cursor(hashString(`${p.era}:${p.school}:${p.seed}:${p.bar}`));
  const step = barSeconds(voice) / 8;

  // A winter takes the ornament first and the bass last, and the field comes back thin.
  const density = Math.max(0.25, (p.winter ? 0.4 : 1) * (0.55 + p.hold * 0.45));
  const notes: Note[] = [];

  const push = (n: Note) => {
    if (Number.isFinite(n.freq) && n.freq > 20 && n.freq < 12000 && n.dur > 0) notes.push(n);
  };

  // The bass is the one voice every school keeps, so the century always has a floor.
  const tonic = p.bar % 4 < 2 ? 0 : p.school === 'substrate' ? 2 : -3;
  push({
    at: 0,
    freq: hz(voice, degree(mode, 0) + tonic - 12),
    dur: barSeconds(voice) * (p.winter ? 0.5 : 0.95),
    gain: 0.5 * density,
    role: 'bass',
  });

  COMPOSERS[p.school](push, { p, voice, mode, rc, step, tonic, density });

  // Strain does not change the notes; it detunes what is already there. An overpromised field
  // plays the same piece slightly out of tune with itself, which is the sound of getting away
  // with it for now.
  if (p.strain > 0.05) {
    for (const n of notes) {
      if (n.role === 'bass') continue;
      n.freq *= Math.pow(2, (p.strain * range(rc, -26, 30)) / 1200);
    }
  }
  return notes;
}

interface Ctx {
  p: ScoreParams;
  voice: EraVoice;
  mode: number[];
  rc: RngCursor;
  step: number;
  tonic: number;
  density: number;
}

type Composer = (push: (n: Note) => void, c: Ctx) => void;

/**
 * Eight ways to decide what the next note is — which is, put briefly, the argument.
 */
const COMPOSERS: Record<FamilyId, Composer> = {
  /*
   * Symbolic: species counterpoint. A subject derived from the bar number by rule, and a second
   * voice in strict contrary motion at consonant intervals only. Nothing is sampled from chance
   * except which of the legal moves to take — the constraint does the composing, which is the
   * whole claim.
   */
  symbolic(push, { p, voice, mode, rc, step, tonic, density }) {
    const CONSONANT = [3, 4, 7, 9, 12];
    let d = 0;
    for (let i = 0; i < 8; i++) {
      const dir = (p.bar + i) % 3 === 0 ? 1 : -1;
      d = Math.max(-2, Math.min(9, d + dir * int(rc, 1, 2)));
      const lead = degree(mode, d) + tonic;
      push({ at: i * step, freq: hz(voice, lead), dur: step * 0.92, gain: 0.34 * density, role: 'lead' });
      if (i % 2 === 0) {
        const interval = CONSONANT[int(rc, 0, CONSONANT.length - 1)]!;
        push({
          at: i * step,
          freq: hz(voice, lead - interval),
          dur: step * 1.8,
          gain: 0.2 * density,
          role: 'counter',
        });
      }
    }
  },

  /*
   * Connectionist: no discrete decisions at all. Two long tones glide between anchor states, and
   * everything in between is interpolation — the note is never in one place, and the boundary
   * between two ideas is a smear rather than an edge.
   */
  connectionist(push, { p, voice, mode, rc, step, tonic, density }) {
    const anchors = [0, 2, 4, 3];
    const from = degree(mode, anchors[p.bar % anchors.length]!) + tonic;
    const to = degree(mode, anchors[(p.bar + 1) % anchors.length]!) + tonic + (chance(rc, 0.3) ? 7 : 0);
    push({
      at: 0,
      freq: hz(voice, to),
      glideFrom: hz(voice, from),
      dur: step * 7.6,
      gain: 0.3 * density,
      role: 'lead',
    });
    if (voice.pad) {
      push({
        at: step * 0.5,
        freq: hz(voice, to - 12),
        glideFrom: hz(voice, from - 12),
        dur: step * 7,
        gain: 0.22 * density,
        role: 'pad',
      });
    }
    // A few activations rising through the layer, denser the more of the field it holds.
    for (let i = 0; i < 8; i++) {
      if (!chance(rc, 0.16 + p.hold * 0.3)) continue;
      push({
        at: i * step,
        freq: hz(voice, degree(mode, int(rc, 2, 7)) + tonic + 12, range(rc, -12, 12)),
        dur: step * range(rc, 1.2, 2.6),
        gain: 0.12 * density,
        role: 'counter',
      });
    }
  },

  /*
   * Statistical: a Markov chain over the mode, weighted towards small steps and returns to the
   * tonic. It sounds like it knows the language and has nothing in particular to say, which is
   * both the joke and the honest description.
   */
  statistical(push, { voice, mode, rc, step, tonic, density }) {
    let d = 0;
    for (let i = 0; i < 8; i++) {
      if (chance(rc, 0.18)) continue; // a rest is a legal outcome too
      const roll = next(rc);
      d = roll < 0.42 ? d + (chance(rc, 0.5) ? 1 : -1) : roll < 0.72 ? d + int(rc, -3, 3) : 0;
      d = Math.max(-3, Math.min(10, d));
      push({
        at: i * step,
        freq: hz(voice, degree(mode, d) + tonic),
        dur: step * range(rc, 0.5, 1.6),
        gain: 0.3 * density,
        role: 'lead',
      });
    }
  },

  /*
   * Evolutionary: one motif, mutated once per bar, and the mutation is kept only if it scores
   * better against a fitness function that likes consonance and small leaps. Over a century you
   * hear the same tune the whole way through and never quite the same twice.
   */
  evolutionary(push, { p, voice, mode, step, tonic, density }) {
    const fitness = (g: number[]) =>
      -g.reduce((acc, v, i) => acc + (i ? Math.abs(v - g[i - 1]!) : 0), 0) +
      g.filter((v) => [0, 2, 4].includes(((v % 7) + 7) % 7)).length * 2;

    // Seeded from the run, not the bar, so the lineage is continuous across the century.
    const line = cursor(hashString(`evo:${p.seed}`));
    let genes = [0, 2, 4, 2, 5, 4, 2, 0].map((v) => v + int(line, -1, 1));
    for (let gen = 0; gen < p.bar; gen++) {
      const child = genes.slice();
      child[int(line, 0, 7)] = Math.max(-3, Math.min(9, child[int(line, 0, 7)]! + int(line, -2, 2)));
      if (fitness(child) >= fitness(genes)) genes = child;
    }
    for (let i = 0; i < 8; i++) {
      push({
        at: i * step,
        freq: hz(voice, degree(mode, genes[i]!) + tonic),
        dur: step * (i % 2 === 0 ? 1.4 : 0.7),
        gain: (i % 4 === 0 ? 0.34 : 0.24) * density,
        role: i % 4 === 0 ? 'lead' : 'counter',
      });
    }
  },

  /*
   * Collective: one short cell, played by several voices at slightly different periods, so they
   * drift out of alignment and back over minutes. Nobody is in charge and the pattern is a
   * property of the group — which is exactly what the school claims about cognition.
   */
  collective(push, { p, voice, mode, step, tonic, density }) {
    const cell = [0, 2, 4, 7];
    const periods = [5, 7, 8];
    periods.forEach((period, v) => {
      for (let i = 0; i < 8; i++) {
        const idx = (p.bar * 8 + i) % period;
        if (idx >= cell.length) continue;
        push({
          at: i * step,
          freq: hz(voice, degree(mode, cell[idx]!) + tonic + v * 12 - 12),
          dur: step * 1.1,
          gain: (0.26 - v * 0.05) * density,
          role: v === 0 ? 'lead' : 'counter',
        });
      }
    });
  },

  /*
   * Cybernetic: a feedback loop. Each note is the last note plus a correction towards a target
   * that itself moves, so the line is always converging and never arrives — homeostasis, audibly.
   */
  cybernetic(push, { p, voice, mode, rc, step, tonic, density }) {
    let x = 0;
    const target = (p.bar % 3) + 2;
    for (let i = 0; i < 8; i++) {
      const error = target - x;
      x += error * 0.55 + range(rc, -0.7, 0.7);
      const d = Math.max(-2, Math.min(9, Math.round(x)));
      push({
        at: i * step,
        freq: hz(voice, degree(mode, d) + tonic),
        dur: step * 0.9,
        gain: (0.32 - Math.abs(error) * 0.02) * density,
        role: 'lead',
      });
      if (Math.abs(error) < 0.4 && voice.pad) {
        // Settled, for a moment: the loop rewards itself with a held tone.
        push({ at: i * step, freq: hz(voice, degree(mode, d) - 12 + tonic), dur: step * 3, gain: 0.18 * density, role: 'pad' });
      }
    }
  },

  /*
   * Substrate: almost no events. Two oscillators a few cents apart, beating against each other,
   * wandering. The music is a property of the physics rather than of any decision, which is the
   * position.
   */
  substrate(push, { voice, mode, rc, step, tonic, density }) {
    const d = degree(mode, int(rc, 0, 3)) + tonic;
    const beat = range(rc, 1.5, 7);
    push({ at: 0, freq: hz(voice, d), dur: step * 8, gain: 0.28 * density, role: 'pad' });
    push({ at: 0, freq: hz(voice, d, beat), dur: step * 8, gain: 0.26 * density, role: 'pad' });
    push({ at: 0, freq: hz(voice, d + 7, -beat * 0.6), dur: step * 8, gain: 0.16 * density, role: 'pad' });
    if (chance(rc, 0.5)) {
      push({
        at: step * int(rc, 2, 6),
        freq: hz(voice, d + 12, range(rc, -30, 30)),
        dur: step * 2.5,
        gain: 0.14 * density,
        role: 'lead',
      });
    }
  },

  /*
   * Bridge: the only composer that does not have a method of its own. It takes symbolic's
   * strictness for half a bar and connectionist's smear for the other half, and the seam is
   * audible — which is the honest account of what hybrid work has actually sounded like.
   */
  bridge(push, { p, voice, mode, rc, step, tonic, density }) {
    let d = 2;
    for (let i = 0; i < 4; i++) {
      d = Math.max(0, Math.min(8, d + ((p.bar + i) % 2 === 0 ? 1 : -2)));
      push({
        at: i * step,
        freq: hz(voice, degree(mode, d) + tonic),
        dur: step * 0.9,
        gain: 0.3 * density,
        role: 'lead',
      });
      push({ at: i * step, freq: hz(voice, degree(mode, d) - 5 + tonic), dur: step * 0.9, gain: 0.16 * density, role: 'counter' });
    }
    const from = degree(mode, d) + tonic;
    const to = degree(mode, int(rc, 0, 5)) + tonic;
    push({
      at: step * 4,
      freq: hz(voice, to),
      glideFrom: hz(voice, from),
      dur: step * 3.8,
      gain: 0.28 * density,
      role: 'lead',
    });
    if (voice.pad) {
      push({ at: step * 4, freq: hz(voice, to - 12), glideFrom: hz(voice, from - 12), dur: step * 3.6, gain: 0.2 * density, role: 'pad' });
    }
  },
};

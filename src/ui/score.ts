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
  /**
   * The rhythm section, which is what stops the late acts reading as silence. `pulse` is how
   * much of a beat the era keeps, `arp` how much figuration runs over the top, and `voices` how
   * many detuned oscillators each sustained note is built from — one is a signal generator,
   * three is a synthesiser.
   */
  pulse: number;
  arp: number;
  voices: number;
  /** Cutoff the per-note filter opens to, as a multiple of the note. Movement, not brightness. */
  open: number;
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
    pulse: 0.35,
    arp: 0.1,
    voices: 1,
    open: 3,
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
    pulse: 0.3,
    arp: 0.25,
    voices: 2,
    open: 4,
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
    pulse: 0.85,
    arp: 0.8,
    voices: 1,
    open: 6,
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
    pulse: 0.7,
    arp: 0.5,
    voices: 2,
    open: 5,
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
    pulse: 0.75,
    arp: 0.45,
    voices: 3,
    open: 7,
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
    mix: 0.82,
    pulse: 0.6,
    arp: 0.5,
    voices: 3,
    open: 8,
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
    floor: 0.004,
    mix: 0.78,
    pulse: 0.4,
    arp: 0.35,
    voices: 3,
    open: 9,
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
  /**
   * 0..1, consequence the century has accumulated and not dealt with.
   *
   * Deliberately *not* another kind of dissonance — that is what strain already is, and an
   * anxious sound is the wrong reading of this number. Exposure is what has been allowed to
   * settle: the top of the spectrum goes out of the mix and the figuration loses its upper
   * octave, so a compromised century sounds duller and heavier rather than more agitated. It is
   * the difference between a field that is worried and a field that has stopped noticing.
   */
  exposure: number;
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
/**
 * Where the harmony goes over four bars. One per school, because the shape of a progression is
 * itself a position: symbolic resolves, substrate barely moves, collective refuses to go
 * anywhere and repeats until you notice something else has changed.
 */
const PROGRESSIONS: Record<FamilyId, number[]> = {
  symbolic: [0, 4, -3, 0],
  connectionist: [0, 2, 5, 3],
  statistical: [0, -2, 3, -4],
  evolutionary: [0, 3, 1, 4],
  collective: [0, 0, 4, 4],
  cybernetic: [0, -1, 2, -3],
  substrate: [0, 1, 0, -1],
  bridge: [0, 4, 2, 5],
};

export function composeBar(p: ScoreParams): Note[] {
  const voice = eraVoice(p.era);
  const mode = MODES[p.school];
  const rc = cursor(hashString(`${p.era}:${p.school}:${p.seed}:${p.bar}`));
  const step = barSeconds(voice) / 8;

  /*
   * Phrase structure, which is the whole answer to sounding like a loop.
   *
   * A bar is four beats; four bars are a phrase; four phrases are a section. The harmony moves
   * every bar, the register and density move every phrase, and the mode itself rotates every
   * section, so the earliest a listener can hear the same material twice is sixteen bars — by
   * which point the run has usually moved on and changed the parameters anyway.
   */
  const phrase = Math.floor(p.bar / 4);
  const inPhrase = p.bar % 4;
  const section = Math.floor(phrase / 4);
  const pc = cursor(hashString(`phrase:${p.era}:${p.school}:${p.seed}:${phrase}`));
  const sc = cursor(hashString(`section:${p.school}:${p.seed}:${section}`));

  const register = 12 * int(pc, -1, 1);
  const lift = range(pc, 0.78, 1.22);
  const rotate = int(sc, 0, mode.length - 1);
  const last = inPhrase === 3;

  // A winter takes the ornament first and the bass last, and the field comes back thin.
  const density = Math.max(0.25, (p.winter ? 0.4 : 1) * (0.55 + p.hold * 0.45) * lift);
  const notes: Note[] = [];

  const push = (n: Note) => {
    if (Number.isFinite(n.freq) && n.freq > 20 && n.freq < 12000 && n.dur > 0) notes.push(n);
  };

  // The root walks a progression rather than flipping between two values, which is most of the
  // difference between a piece of music and a test tone with opinions.
  const tonic = degree(mode, PROGRESSIONS[p.school][phrase % 4]! + rotate) + register;

  // The bass is the one voice every school keeps, so the century always has a floor.
  push({
    at: 0,
    freq: hz(voice, degree(mode, 0) + tonic - 12),
    dur: barSeconds(voice) * (p.winter ? 0.5 : 0.95),
    gain: 0.5 * density,
    role: 'bass',
  });

  COMPOSERS[p.school](push, { p, voice, mode, rc, step, tonic, density });
  rhythm(push, { p, voice, mode, rc, step, tonic, density }, last);
  figuration(push, { p, voice, mode, rc, step, tonic, density });

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

/**
 * The beat. Owned by the era rather than the school, because a rhythm section is a property of
 * the machines available to make one: relay chatter in 1954, a hard square kick in 1986, a sub
 * and a shaker by 2030. The last bar of a phrase gets a fill, which is the cheapest way to make
 * four bars sound like a sentence rather than a loop.
 */
function rhythm(push: (n: Note) => void, c: Ctx, last: boolean): void {
  const { p, voice, step, density, rc } = c;
  if (voice.pulse <= 0.02 || p.winter) return;

  const beats = voice.pulse > 0.6 ? [0, 2, 4, 6] : [0, 4];
  // Floored at 48 Hz. The late eras tune low enough that half the root is under what a laptop
  // can reproduce, so the kick vanishes and leaves only the mud it was sitting on.
  const kick = Math.max(48, voice.root * 0.5);
  for (const i of beats) {
    push({
      at: i * step,
      freq: kick,
      dur: step * 0.5,
      gain: 0.42 * voice.pulse * density,
      role: 'perc',
    });
  }
  // Off-beats arrive only once the era can afford them, and thin out when the school is not
  // holding much of the field.
  if (voice.pulse > 0.5) {
    for (let i = 1; i < 8; i += 2) {
      if (!chance(rc, 0.35 + p.hold * 0.4)) continue;
      push({ at: i * step, freq: voice.root * 8, dur: step * 0.22, gain: 0.14 * voice.pulse * density, role: 'perc' });
    }
  }
  if (last) {
    const n = int(rc, 2, 4);
    for (let i = 0; i < n; i++) {
      push({
        at: (8 - n + i) * step,
        freq: voice.root * (0.5 + i * 0.35),
        dur: step * 0.3,
        gain: (0.2 + i * 0.05) * voice.pulse * density,
        role: 'perc',
      });
    }
  }
}

/**
 * Figuration: an arpeggio over whatever the harmony currently is. This is the layer that makes
 * the last two acts audible — they are slow and sparse by design, and a slow sparse piece with
 * nothing moving in it is indistinguishable from the music being broken, which is exactly what
 * it was mistaken for.
 */
function figuration(push: (n: Note) => void, c: Ctx): void {
  const { p, voice, mode, rc, step, tonic, density } = c;
  if (voice.arp <= 0.02 || p.winter) return;

  const shape = [0, 2, 4, 6, 4, 2];
  // The upper octave is the first thing consequence takes: a century carrying a lot of it keeps
  // the figure and loses the sparkle on top of it.
  const octave = voice.arp > 0.6 && p.exposure < 0.5 ? 12 : 0;
  const stride = voice.arp > 0.6 ? 1 : 2;
  for (let i = 0; i < 8; i += stride) {
    /*
     * Density is deliberately *not* reduced here. Thinning the figuration would make a
     * compromised century sound *emptier*, and empty is what a winter already sounds like.
     * Exposure has its own reading: everything is still playing and the top has gone off it.
     */
    if (!chance(rc, voice.arp)) continue;
    const d = shape[(i + p.bar) % shape.length]!;
    push({
      at: i * step,
      freq: hz(voice, degree(mode, d) + tonic + octave, range(rc, -4, 4)),
      dur: step * (voice.arp > 0.6 ? 0.5 : 1.4),
      gain: 0.16 * (0.6 + voice.arp * 0.6) * density,
      role: 'counter',
    });
  }
}

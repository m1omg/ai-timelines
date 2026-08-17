import { leadingFamily } from '../engine/conditions';
import type { FamilyId, GameState } from '../engine/types';
import { musicEnabled, musicContext } from './audio';
import { barSeconds, composeBar, eraVoice, type EraVoice, type ScoreParams } from './score';
import { buildRig, playBar, startFloor, type Rig } from './synth';

/**
 * The live score: a bar-at-a-time scheduler that reads the run and never repeats a century.
 *
 * What it is playing is decided by two things the player is already watching — which act they
 * are in, and which school currently holds the field — plus the two pressures the simulation
 * applies: a funding collapse thins the voices out, and an overpromised field plays slightly
 * out of tune with itself.
 *
 * Scheduling is the standard lookahead: a timer wakes up far more often than notes are due and
 * queues anything falling inside the next window, because setTimeout is not accurate enough to
 * place a note and an AudioParam ramp is.
 */

const LOOKAHEAD_MS = 140;
const WINDOW = 0.9;

interface Playing {
  rig: Rig;
  voice: EraVoice;
  era: string;
  timer: number;
  /** The era's room tone, held so the next act can silence it. */
  floor: AudioBufferSourceNode | null;
  /** Next bar's start time on the audio clock. */
  nextAt: number;
  bar: number;
}

let playing: Playing | null = null;
let master: GainNode | null = null;
/** Everything the score is allowed to know about the run, which is deliberately not much. */
type Reading = Omit<ScoreParams, 'bar'>;

let current: Reading | null = null;

function readState(s: GameState): Reading {
  const school = leadingFamily(s);
  const total = Object.values(s.families).reduce((acc, f) => acc + Math.max(0, f.momentum), 0) || 1;
  return {
    era: eraIdForAct(s.act),
    school,
    seed: s.seed,
    winter: s.inWinter,
    // Promises outstanding against what has actually been delivered, normalised to something a
    // detune can use. The number the top bar shows as "owed".
    strain: Math.max(0, Math.min(1, (s.promises - s.resources.capability * 0.35) / 22)),
    hold: Math.max(0, Math.min(1, Math.max(0, s.families[school].momentum) / total + 0.1)),
  };
}

function eraIdForAct(act: number): string {
  return ['teletype', 'phosphor', 'cga', 'web', 'glass', 'ambient', 'lucid'][Math.max(0, Math.min(6, act - 1))]!;
}

/**
 * Start, or pick up, the music for this run. Safe to call repeatedly — the second call only
 * updates what is being played, so the turn loop can hand it the state every turn without
 * restarting the piece under the player.
 */
export function updateMusic(s: GameState): void {
  const wanted = readState(s);
  const ctx = musicEnabled() ? musicContext() : null;
  if (!ctx) {
    stopMusic();
    return;
  }

  const eraChanged = !playing || playing.era !== wanted.era;
  current = wanted;

  if (!playing || eraChanged) {
    // A new act is a new instrument, so the rig is rebuilt. Everything already scheduled is
    // left to ring out rather than being cut, which covers the act break's own transition.
    const voice = eraVoice(wanted.era);
    if (!master) {
      master = ctx.createGain();
      master.gain.value = 0.17;
      // The same compressor the offline render uses, so a bounce and the live game sound alike
      // — and so a bar with the whole rhythm section in it does not tower over a sparse one.
      const squash = ctx.createDynamicsCompressor();
      squash.threshold.value = -18;
      squash.ratio.value = 3;
      squash.attack.value = 0.01;
      squash.release.value = 0.25;
      master.connect(squash);
      squash.connect(ctx.destination);
    }
    const rig = buildRig(ctx, master, voice);
    const floor = startFloor(rig, voice, ctx.currentTime, 60 * 30);
    if (playing) {
      window.clearInterval(playing.timer);
      stopFloor(playing.floor, ctx);
    }
    playing = {
      rig,
      voice,
      floor,
      era: wanted.era,
      bar: playing?.bar ?? 0,
      nextAt: Math.max(ctx.currentTime + 0.12, playing?.nextAt ?? 0),
      timer: window.setInterval(tick, LOOKAHEAD_MS),
    };
  }
}

function tick(): void {
  const p = playing;
  const state = current;
  const ctx = musicContext();
  if (!p || !state || !ctx) return;
  if (!musicEnabled()) {
    stopMusic();
    return;
  }

  const bar = barSeconds(p.voice);
  while (p.nextAt < ctx.currentTime + WINDOW) {
    if (p.nextAt < ctx.currentTime) p.nextAt = ctx.currentTime + 0.05;
    playBar(p.rig, p.voice, composeBar({ ...state, bar: p.bar }), p.nextAt);
    p.nextAt += bar;
    p.bar += 1;
  }
}

/** Fade a room tone out over a second rather than cutting it, which is audible as a click. */
function stopFloor(floor: AudioBufferSourceNode | null, ctx: AudioContext): void {
  if (!floor) return;
  try {
    floor.stop(ctx.currentTime + 1.2);
  } catch {
    // Already stopped, or the context went away underneath it.
  }
}

export function stopMusic(): void {
  if (!playing) return;
  window.clearInterval(playing.timer);
  const ctx = musicContext();
  if (ctx) stopFloor(playing.floor, ctx);
  // Let whatever is already scheduled decay instead of clipping it off mid-note.
  if (master && ctx) {
    master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.35);
    const dying = master;
    window.setTimeout(() => dying.disconnect(), 2500);
    master = null;
  }
  playing = null;
}

/** What the score is doing right now, for the menu to describe in words. */
export function musicDescription(s: GameState): string {
  const st = readState(s);
  const METHOD: Record<FamilyId, string> = {
    symbolic: 'strict counterpoint, derived from a rule',
    connectionist: 'two states and the glide between them',
    statistical: 'a Markov chain that knows the language',
    evolutionary: 'one motif, mutated once per term',
    collective: 'one cell, phasing against itself',
    cybernetic: 'a feedback loop converging on a moving target',
    substrate: 'oscillators beating against each other',
    bridge: 'half strict, half smeared, and you can hear the seam',
  };
  const method = METHOD[st.school] ?? '';
  return st.winter
    ? `${method} — with most of the voices gone`
    : st.strain > 0.4
      ? `${method}, slightly out of tune with itself`
      : method;
}

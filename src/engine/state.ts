import { ACTORS } from '../content/actors';
import { CHARACTERS } from '../content/characters';
import { PARADIGMS } from '../content/paradigms';
import type { FamilyId, GameState, ParadigmState, PatronId } from './types';
import { FAMILY_IDS, PATRON_IDS } from './types';

export const START_YEAR = 1950;
export const END_YEAR = 2050;
export const YEARS_PER_TURN = 4;
export const TOTAL_TURNS = (END_YEAR - START_YEAR) / YEARS_PER_TURN + 1; // 26

/** Turn ranges per act, inclusive. Act numbers are 1-based throughout the content. */
export const ACT_TURNS: [number, number][] = [
  [0, 3], // I    1950-1962
  [4, 7], // II   1966-1978
  [8, 11], // III  1982-1994
  [12, 15], // IV   1998-2010
  [16, 19], // V    2014-2026
  [20, 23], // VI   2030-2042
  [24, 25], // VII  2046-2050
];

export const ACT_TITLES = [
  'The Summer of Definitions',
  'The Long Retrenchment',
  'The Rule and the Weight',
  'The Quiet Decade',
  'The Scaling Years',
  'The Divergence',
  'The Settlement',
];

export function yearOfTurn(turn: number): number {
  return START_YEAR + turn * YEARS_PER_TURN;
}

export function actOfTurn(turn: number): number {
  for (let i = 0; i < ACT_TURNS.length; i++) {
    const [lo, hi] = ACT_TURNS[i]!;
    if (turn >= lo && turn <= hi) return i + 1;
  }
  return ACT_TURNS.length;
}

/** Historical compute frontier, log10 of the FLOPs available to a single frontier experiment. */
export const START_COMPUTE_LOG = 5;

export function createState(seed: number): GameState {
  const paradigms: Record<string, ParadigmState> = {};
  for (const p of PARADIGMS) {
    paradigms[p.id] = {
      status: 'locked',
      progress: 0,
      maturedYear: null,
      driver: null,
      emphasis: 1,
    };
  }

  const families = {} as GameState['families'];
  for (const f of FAMILY_IDS) {
    families[f] = { insight: 0, talent: 1 / FAMILY_IDS.length, momentum: 0, matured: 0 };
  }

  const patrons = {} as Record<PatronId, number>;
  for (const p of PATRON_IDS) patrons[p] = 0;
  // 1950: the money is military, the prestige is academic, industry is not listening yet.
  patrons.military = 55;
  patrons.academic = 40;
  patrons.corporate = 12;
  patrons.public = 8;

  const actors = {} as GameState['actors'];
  for (const a of ACTORS) {
    actors[a.id] = {
      weight: a.span[0] <= START_YEAR ? a.startWeight : 0,
      stance: 0,
      active: a.span[0] <= START_YEAR && a.span[1] >= START_YEAR,
      focus: null,
    };
  }

  const characters = {} as GameState['characters'];
  for (const c of CHARACTERS) {
    characters[c.id] = { affinity: 0, met: false, active: false };
  }

  return {
    version: 1,
    seed,
    rng: seed | 0,
    year: START_YEAR,
    turn: 0,
    act: 1,
    resources: {
      influence: 14,
      capability: 2,
      understanding: 4,
      attention: 18,
      credibility: 50,
      deployment: 1,
      exposure: 0,
    },
    patrons,
    computeLog: START_COMPUTE_LOG,
    families,
    paradigms,
    actors,
    characters,
    flags: {},
    seenScenes: [],
    log: [],
    winters: [],
    promises: 0,
    gapStreak: 0,
    inWinter: false,
    directivesTaken: [],
    ending: null,
  };
}

/** Deep-enough clone for the playtest harness and for speculative UI previews. */
export function cloneState(s: GameState): GameState {
  return {
    ...s,
    resources: { ...s.resources },
    patrons: { ...s.patrons },
    families: Object.fromEntries(
      Object.entries(s.families).map(([k, v]) => [k, { ...v }]),
    ) as GameState['families'],
    paradigms: Object.fromEntries(Object.entries(s.paradigms).map(([k, v]) => [k, { ...v }])),
    actors: Object.fromEntries(Object.entries(s.actors).map(([k, v]) => [k, { ...v }])),
    characters: Object.fromEntries(Object.entries(s.characters).map(([k, v]) => [k, { ...v }])),
    flags: { ...s.flags },
    seenScenes: s.seenScenes.slice(),
    log: s.log.slice(),
    winters: s.winters.map((w) => ({ ...w })),
    directivesTaken: s.directivesTaken.slice(),
  };
}

export function familyMatured(s: GameState, f: FamilyId): number {
  return s.families[f].matured;
}

/** Total matured nodes, used by endings and the summary screen. */
export function totalMatured(s: GameState): number {
  let n = 0;
  for (const f of FAMILY_IDS) n += s.families[f].matured;
  return n;
}

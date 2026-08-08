import { createState } from './state';
import type { GameState } from './types';

/**
 * Saved centuries.
 *
 * Four slots, because a run is a hundred years long and the interesting thing to do with one is
 * to fork it — play the same seed with a different policy and compare the endings. One slot made
 * that impossible without an export code and a text file.
 *
 * The single-slot key from earlier builds is adopted into slot 1 the first time the slots are
 * read, so nobody loses a century to this change. The adoption is a move rather than a copy: the
 * legacy key is cleared once its contents are safely in slot 1, so it cannot be adopted twice
 * over a slot the player has since written.
 */
const LEGACY_KEY = 'ai-timelines/save/v1';
const SLOT_KEY = (n: number) => `ai-timelines/save/v1/slot${n}`;
const SAVE_VERSION = 1;

export const SLOT_COUNT = 4;
export const SLOT_NUMBERS = [1, 2, 3, 4] as const;

export interface SaveSlot {
  savedAt: number;
  year: number;
  turn: number;
  state: GameState;
}

/** Slot metadata for the menu: what is in each slot, without deserialising the whole century. */
export interface SlotInfo {
  slot: number;
  savedAt: number;
  year: number;
  turn: number;
  seed: number;
}

function readSlot(n: number): SaveSlot | null {
  try {
    const raw = localStorage.getItem(SLOT_KEY(n));
    if (!raw) return null;
    const slot = JSON.parse(raw) as SaveSlot;
    if (!slot?.state || slot.state.version !== SAVE_VERSION) return null;
    return slot;
  } catch {
    return null;
  }
}

/**
 * Move a pre-slots save into slot 1. Safe to call repeatedly: it does nothing once the legacy
 * key is gone, and it never overwrites a slot 1 that already holds something.
 */
function adoptLegacy(): void {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return;
    if (localStorage.getItem(SLOT_KEY(1)) === null) {
      localStorage.setItem(SLOT_KEY(1), raw);
    }
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* storage unavailable; nothing to adopt into */
  }
}

export function listSlots(): (SlotInfo | null)[] {
  adoptLegacy();
  return SLOT_NUMBERS.map((n) => {
    const slot = readSlot(n);
    if (!slot) return null;
    return {
      slot: n,
      savedAt: slot.savedAt,
      year: slot.year,
      turn: slot.turn,
      seed: slot.state.seed,
    };
  });
}

export function saveGame(s: GameState, slot = 1): void {
  adoptLegacy();
  const payload: SaveSlot = { savedAt: Date.now(), year: s.year, turn: s.turn, state: s };
  try {
    localStorage.setItem(SLOT_KEY(slot), JSON.stringify(payload));
  } catch {
    // Private browsing, quota, or no localStorage at all. The game is still playable; it
    // simply will not persist, and there is nothing useful to tell the player mid-scene.
  }
}

export function loadGame(slot = 1): GameState | null {
  adoptLegacy();
  const found = readSlot(slot);
  return found ? migrate(found.state) : null;
}

/** The slot last written, which is what Continue on the title screen should resume. */
export function mostRecentSlot(): number | null {
  const slots = listSlots().filter((x): x is SlotInfo => x !== null);
  if (slots.length === 0) return null;
  return slots.reduce((a, b) => (b.savedAt > a.savedAt ? b : a)).slot;
}

export function hasSave(): boolean {
  return mostRecentSlot() !== null;
}

export function clearSave(slot?: number): void {
  adoptLegacy();
  try {
    if (slot === undefined) {
      for (const n of SLOT_NUMBERS) localStorage.removeItem(SLOT_KEY(n));
    } else {
      localStorage.removeItem(SLOT_KEY(slot));
    }
  } catch {
    /* nothing to do */
  }
}

/**
 * Fill in anything a newer build expects that an older save lacks — new paradigms, new
 * characters, new actors. Adding content must never invalidate someone's century.
 */
function migrate(s: GameState): GameState {
  const fresh = createState(s.seed);
  for (const id of Object.keys(fresh.paradigms)) {
    if (!s.paradigms[id]) s.paradigms[id] = fresh.paradigms[id]!;
  }
  for (const id of Object.keys(fresh.characters)) {
    if (!s.characters[id]) s.characters[id] = fresh.characters[id]!;
  }
  for (const id of Object.keys(fresh.actors)) {
    if (!s.actors[id]) s.actors[id] = fresh.actors[id]!;
  }
  if (typeof s.promises !== 'number') s.promises = 0;
  /*
   * The balance chart and the decision tree arrived after people had already started centuries.
   * Backfilling empty rather than bumping SAVE_VERSION keeps those saves loadable: an older run
   * simply has no record before the point it was upgraded, which the charts say plainly.
   */
  if (!Array.isArray(s.history)) s.history = [];
  if (!Array.isArray(s.decisions)) s.decisions = [];
  return s;
}

// --- Export / import as a copyable string -----------------------------------

export function exportSave(s: GameState): string {
  const json = JSON.stringify(s);
  return btoa(unescape(encodeURIComponent(json)));
}

/** Export whatever is in a slot, so a century can be shared without loading it first. */
export function exportSlot(slot: number): string | null {
  const found = readSlot(slot);
  return found ? exportSave(found.state) : null;
}

export function importSave(code: string): GameState | null {
  try {
    const json = decodeURIComponent(escape(atob(code.trim())));
    const s = JSON.parse(json) as GameState;
    if (!s || typeof s.year !== 'number' || s.version !== SAVE_VERSION) return null;
    return migrate(s);
  } catch {
    return null;
  }
}

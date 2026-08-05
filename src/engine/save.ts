import { createState } from './state';
import type { GameState } from './types';

const KEY = 'ai-timelines/save/v1';
const SAVE_VERSION = 1;

export interface SaveSlot {
  savedAt: number;
  year: number;
  turn: number;
  state: GameState;
}

export function saveGame(s: GameState): void {
  const slot: SaveSlot = { savedAt: Date.now(), year: s.year, turn: s.turn, state: s };
  try {
    localStorage.setItem(KEY, JSON.stringify(slot));
  } catch {
    // Private browsing, quota, or no localStorage at all. The game is still playable; it
    // simply will not persist, and there is nothing useful to tell the player mid-scene.
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const slot = JSON.parse(raw) as SaveSlot;
    if (!slot?.state || slot.state.version !== SAVE_VERSION) return null;
    return migrate(slot.state);
  } catch {
    return null;
  }
}

export function hasSave(): boolean {
  try {
    return localStorage.getItem(KEY) !== null;
  } catch {
    return false;
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(KEY);
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
  return s;
}

// --- Export / import as a copyable string -----------------------------------

export function exportSave(s: GameState): string {
  const json = JSON.stringify(s);
  return btoa(unescape(encodeURIComponent(json)));
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

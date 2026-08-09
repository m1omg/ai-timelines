import { beforeEach, describe, expect, it } from 'vitest';

import { clearSave, exportSave, hasSave, importSave, loadGame, saveGame } from '../../src/engine/save';
import { advanceTurn } from '../../src/engine/sim';
import { createState, takeTermStart } from '../../src/engine/state';

/** Minimal localStorage so the save module can be exercised outside a browser. */
class MemoryStorage {
  private map = new Map<string, string>();
  getItem(k: string): string | null {
    return this.map.has(k) ? this.map.get(k)! : null;
  }
  setItem(k: string, v: string): void {
    this.map.set(k, v);
  }
  removeItem(k: string): void {
    this.map.delete(k);
  }
}

beforeEach(() => {
  (globalThis as { localStorage?: unknown }).localStorage = new MemoryStorage();
});

describe('save and load', () => {
  it('round-trips a run in progress', () => {
    const s = createState(1234);
    for (let i = 0; i < 8; i++) advanceTurn(s);
    saveGame(s);
    expect(hasSave()).toBe(true);

    const loaded = loadGame()!;
    expect(loaded).not.toBeNull();
    expect(loaded.year).toBe(s.year);
    expect(loaded.turn).toBe(s.turn);
    expect(loaded.seed).toBe(s.seed);
    expect(loaded.resources).toEqual(s.resources);
    expect(loaded.computeLog).toBe(s.computeLog);
  });

  it('resumes to an identical future from a saved position', () => {
    const s = createState(555);
    for (let i = 0; i < 5; i++) advanceTurn(s);
    saveGame(s);
    const resumed = loadGame()!;

    for (let i = 0; i < 6; i++) advanceTurn(s);
    for (let i = 0; i < 6; i++) advanceTurn(resumed);

    expect(resumed.resources).toEqual(s.resources);
    expect(resumed.computeLog).toBe(s.computeLog);
  });

  it('reports no save before anything is written', () => {
    expect(hasSave()).toBe(false);
    expect(loadGame()).toBeNull();
  });

  it('clears cleanly', () => {
    saveGame(createState(1));
    clearSave();
    expect(hasSave()).toBe(false);
  });
});

describe('export codes', () => {
  it('round-trips through a copyable string', () => {
    const s = createState(4321);
    for (let i = 0; i < 4; i++) advanceTurn(s);
    const code = exportSave(s);
    const back = importSave(code)!;
    expect(back).not.toBeNull();
    expect(back.turn).toBe(s.turn);
    expect(back.resources).toEqual(s.resources);
  });

  it('tolerates surrounding whitespace', () => {
    const code = exportSave(createState(9));
    expect(importSave(`\n  ${code}  \n`)).not.toBeNull();
  });

  it('returns null on rubbish rather than throwing', () => {
    expect(importSave('not a save code')).toBeNull();
    expect(importSave('')).toBeNull();
  });
});

/*
 * The undo point for directives already taken this term.
 *
 * Both saves land mid-term — the autosave fires after the selection is applied but before the
 * four years pass — so without this in the save, a loaded century arrived with the term's cards
 * spent and no way to change your mind about any of them.
 */
describe('the term-start snapshot', () => {
  it('survives a save and load, so a loaded term can still be taken back', () => {
    const s = createState(21);
    for (let i = 0; i < 5; i++) advanceTurn(s);
    s.termStart = takeTermStart(s);
    s.resources.influence = 3;

    saveGame(s);
    const loaded = loadGame()!;
    expect(loaded.termStart).toBeDefined();
    expect(loaded.termStart!.turn).toBe(s.turn);
    // The snapshot holds the term as it opened, not the state that was saved over it.
    expect(loaded.termStart!.state.resources.influence).not.toBe(3);
  });

  it('never nests, so a save holds one century and not a chain of them', () => {
    const s = createState(22);
    s.termStart = takeTermStart(s);
    advanceTurn(s);
    s.termStart = takeTermStart(s);
    expect(s.termStart.state.termStart).toBeUndefined();
  });

  it('drops a snapshot belonging to a turn already ticked past', () => {
    const s = createState(23);
    s.termStart = takeTermStart(s);
    advanceTurn(s);
    saveGame(s);
    // Loading must not offer to undo into a term the century has already left.
    expect(loadGame()!.termStart).toBeUndefined();
  });

  it('drops a snapshot that is not a state rather than crashing the board', () => {
    const s = createState(24);
    (s as { termStart?: unknown }).termStart = { turn: s.turn, state: { nonsense: true } };
    saveGame(s);
    expect(loadGame()!.termStart).toBeUndefined();
  });

  it('loads a century written before the snapshot existed', () => {
    const s = createState(25);
    for (let i = 0; i < 3; i++) advanceTurn(s);
    delete s.termStart;
    saveGame(s);
    const loaded = loadGame()!;
    expect(loaded).not.toBeNull();
    expect(loaded.turn).toBe(s.turn);
    expect(loaded.termStart).toBeUndefined();
  });
});

describe('migration', () => {
  it('backfills content added since the save was written', () => {
    const s = createState(7);
    // Simulate an older save that predates some paradigms and characters.
    delete (s.paradigms as Record<string, unknown>)['grand-synthesis'];
    delete (s.characters as Record<string, unknown>)['archivist'];
    saveGame(s);

    const loaded = loadGame()!;
    expect(loaded.paradigms['grand-synthesis']).toBeDefined();
    expect(loaded.paradigms['grand-synthesis']!.status).toBe('locked');
    expect(loaded.characters['archivist']).toBeDefined();
  });
});

import type { WinterRecord } from '../engine/types';

/**
 * The shape of a TickReport as the UI needs it. Declared separately so that ui/ does not have
 * to import from engine/sim.ts, which pulls in the whole simulation.
 */
export interface TickReportLike {
  year: number;
  matured: string[];
  unlocked: string[];
  dormant: string[];
  winterStarted: WinterRecord | null;
  winterEnded: boolean;
  notes: string[];
}

export type { GameState } from '../engine/types';

import type { Scene } from '../engine/types';
import { ACT1 } from './acts/act1';
import { ACT2 } from './acts/act2';
import { ACT3 } from './acts/act3';
import { ACT4 } from './acts/act4';
import { ACT5 } from './acts/act5';
import { ACT6 } from './acts/act6';
import { ACT7 } from './acts/act7';
import { OPENING } from './acts/opening';

/**
 * Act 0 scenes (the opening chain) are excluded from SCENES so the scheduler never picks them;
 * main.ts plays them explicitly. They are still in SCENE_BY_ID so chain following works.
 */
export const SCENES: Scene[] = [...ACT1, ...ACT2, ...ACT3, ...ACT4, ...ACT5, ...ACT6, ...ACT7];

export const ALL_SCENES: Scene[] = [...OPENING, ...SCENES];

export const SCENE_BY_ID: Record<string, Scene> = Object.fromEntries(
  ALL_SCENES.map((s) => [s.id, s]),
);

export function scenesForAct(act: number): Scene[] {
  return SCENES.filter((s) => s.act === act);
}

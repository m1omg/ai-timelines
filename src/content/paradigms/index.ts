import type { FamilyId, Paradigm } from '../../engine/types';
import { BRIDGE } from './bridge';
import { COLLECTIVE } from './collective';
import { CONNECTIONIST } from './connectionist';
import { CYBERNETIC } from './cybernetic';
import { EVOLUTIONARY } from './evolutionary';
import { STATISTICAL } from './statistical';
import { SUBSTRATE } from './substrate';
import { SYMBOLIC } from './symbolic';

export { FAMILIES, FAMILY_LIST } from './families';

export const PARADIGMS: Paradigm[] = [
  ...SYMBOLIC,
  ...CONNECTIONIST,
  ...STATISTICAL,
  ...EVOLUTIONARY,
  ...COLLECTIVE,
  ...CYBERNETIC,
  ...SUBSTRATE,
  ...BRIDGE,
];

export const PARADIGM_BY_ID: Record<string, Paradigm> = Object.fromEntries(
  PARADIGMS.map((p) => [p.id, p]),
);

export function paradigmsOf(family: FamilyId): Paradigm[] {
  return PARADIGMS.filter((p) => p.family === family);
}

export function paradigm(id: string): Paradigm {
  const p = PARADIGM_BY_ID[id];
  if (!p) throw new Error(`unknown paradigm: ${id}`);
  return p;
}

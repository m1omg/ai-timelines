import type { FamilyDef, FamilyId } from '../../engine/types';

/**
 * The eight schools. `creed` is written in each school's own voice, because the game's
 * central argument is that these are not techniques but competing theories of what a mind is.
 *
 * Rivalries are asymmetric on purpose: connectionism drains the symbolic school harder than
 * the reverse, which is roughly what happened.
 */
export const FAMILIES: Record<FamilyId, FamilyDef> = {
  symbolic: {
    id: 'symbolic',
    name: 'Symbolic',
    creed: 'Thought is the manipulation of symbols according to rules. Write the rules down.',
    hue: 42,
    rivals: ['connectionist', 'cybernetic'],
  },
  connectionist: {
    id: 'connectionist',
    name: 'Connectionist',
    creed: 'Thought is what a sufficiently large network of simple units does. Do not write anything down.',
    hue: 198,
    rivals: ['symbolic'],
  },
  statistical: {
    id: 'statistical',
    name: 'Statistical & Bayesian',
    creed: 'Thought is inference under uncertainty. Everything else is a special case, badly done.',
    hue: 268,
    rivals: ['connectionist'],
  },
  evolutionary: {
    id: 'evolutionary',
    name: 'Evolutionary',
    creed: 'Nobody designed us. Set up the selection pressure and get out of the way.',
    hue: 108,
    rivals: ['symbolic'],
  },
  collective: {
    id: 'collective',
    name: 'Collective & Swarm',
    creed: 'Intelligence is not in the agent. It is in the traffic between agents.',
    hue: 32,
    rivals: [],
  },
  cybernetic: {
    id: 'cybernetic',
    name: 'Cybernetic & Embodied',
    creed: 'A mind is a body keeping itself alive in a world. Take away the world and you have nothing.',
    hue: 348,
    rivals: ['symbolic'],
  },
  substrate: {
    id: 'substrate',
    name: 'Substrate',
    creed: 'The algorithm is downstream of the physics. Change the physics.',
    hue: 168,
    rivals: [],
  },
  bridge: {
    id: 'bridge',
    name: 'Bridge & Hybrid',
    creed: 'The schools are each right about a different half. Someone has to do the joinery.',
    hue: 300,
    rivals: [],
  },
};

export const FAMILY_LIST: FamilyDef[] = Object.values(FAMILIES);

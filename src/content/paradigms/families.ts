import type { FamilyDef, FamilyId } from '../../engine/types';

/**
 * The eight schools. `creed` is written in each school's own voice, because the game's
 * central argument is that these are not techniques but competing theories of what a mind is.
 *
 * Rivalries are asymmetric on purpose: connectionism drains the symbolic school harder than
 * the reverse, which is roughly what happened.
 *
 * `allies` is a separate graph and not the inverse of `rivals` — a pair can be both, and the
 * most important pair in the game is. Connectionism and the statistical school fought over
 * hiring lines for two decades while sharing their whole mathematical basis; rivalry moves
 * momentum, which is fashion, and alliance moves insight, which is not. `bridge` is allied
 * with symbolic, connectionist and statistical at once, which is why backing several schools
 * at the same time is the only way that column ever gets anywhere.
 *
 * `computeAppetite` is how much of the available hardware a school assembles in one place when
 * it holds the field. A frontier training run and a theorem prover are not the same customer.
 */
export const FAMILIES: Record<FamilyId, FamilyDef> = {
  symbolic: {
    id: 'symbolic',
    name: 'Symbolic',
    creed: 'Thought is the manipulation of symbols according to rules. Write the rules down.',
    hue: 42,
    rivals: ['connectionist', 'cybernetic'],
    allies: ['bridge', 'collective'],
    computeAppetite: 0.5,
  },
  connectionist: {
    id: 'connectionist',
    name: 'Connectionist',
    creed: 'Thought is what a sufficiently large network of simple units does. Do not write anything down.',
    hue: 198,
    rivals: ['symbolic'],
    allies: ['statistical', 'substrate', 'bridge'],
    computeAppetite: 1.7,
  },
  statistical: {
    id: 'statistical',
    name: 'Statistical & Bayesian',
    creed: 'Thought is inference under uncertainty. Everything else is a special case, badly done.',
    hue: 268,
    rivals: ['connectionist'],
    allies: ['connectionist', 'cybernetic', 'bridge'],
    computeAppetite: 0.9,
  },
  evolutionary: {
    id: 'evolutionary',
    name: 'Evolutionary',
    creed: 'Nobody designed us. Set up the selection pressure and get out of the way.',
    hue: 108,
    rivals: ['symbolic'],
    allies: ['substrate', 'collective'],
    computeAppetite: 1.2,
  },
  collective: {
    id: 'collective',
    name: 'Collective & Swarm',
    creed: 'Intelligence is not in the agent. It is in the traffic between agents.',
    hue: 32,
    rivals: [],
    allies: ['symbolic', 'cybernetic', 'evolutionary'],
    computeAppetite: 0.8,
  },
  cybernetic: {
    id: 'cybernetic',
    name: 'Cybernetic & Embodied',
    creed: 'A mind is a body keeping itself alive in a world. Take away the world and you have nothing.',
    hue: 348,
    rivals: ['symbolic'],
    allies: ['statistical', 'collective'],
    computeAppetite: 0.6,
  },
  substrate: {
    id: 'substrate',
    name: 'Substrate',
    creed: 'The algorithm is downstream of the physics. Change the physics.',
    hue: 168,
    rivals: [],
    allies: ['connectionist', 'evolutionary'],
    computeAppetite: 1.1,
  },
  bridge: {
    id: 'bridge',
    name: 'Bridge & Hybrid',
    creed: 'The schools are each right about a different half. Someone has to do the joinery.',
    hue: 300,
    rivals: [],
    allies: ['symbolic', 'connectionist', 'statistical'],
    computeAppetite: 0.9,
  },
};

export const FAMILY_LIST: FamilyDef[] = Object.values(FAMILIES);

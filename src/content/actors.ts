import type { ActorDef } from '../engine/types';

/**
 * Actors are institutions rather than individuals, which keeps the depiction honest: an agency
 * has a documented funding record, a person does not have documented opinions about everything.
 * Each spends its weight every turn on whatever available paradigm best matches its taste,
 * whether or not the player is paying attention.
 *
 * Post-2026 actors are invented, and named so that it is obvious they are.
 */
export const ACTORS: ActorDef[] = [
  {
    id: 'defense-agency',
    name: 'The Defence Research Agency',
    short: 'DEF',
    span: [1950, 2050],
    taste: { symbolic: 0.8, cybernetic: 0.7, connectionist: 0.4, substrate: 0.5, collective: 0.3 },
    startWeight: 0.34,
    blurb:
      'Pays for anything that might translate, at some remove, into command, control or targeting. Patient for a decade at a time and then abruptly not.',
  },
  {
    id: 'university-labs',
    name: 'The University Laboratories',
    short: 'UNI',
    span: [1950, 2050],
    taste: { symbolic: 0.7, statistical: 0.6, cybernetic: 0.4, bridge: 0.5, evolutionary: 0.4 },
    startWeight: 0.26,
    blurb:
      'The great American and European AI departments. Follows prestige, produces the students everyone else hires, and changes its mind exactly one generation at a time.',
  },
  {
    id: 'naval-research',
    name: 'The Naval Research Office',
    short: 'NRO',
    span: [1950, 1974],
    taste: { connectionist: 0.9, cybernetic: 0.5, substrate: 0.4 },
    startWeight: 0.12,
    blurb:
      'Backed pattern-recognition hardware when the rest of the field considered it a curiosity. Its money is the reason the first learning machines were built at all.',
  },
  {
    id: 'industrial-labs',
    name: 'The Industrial Research Laboratories',
    short: 'IND',
    span: [1950, 2050],
    taste: { statistical: 0.8, substrate: 0.7, connectionist: 0.4, collective: 0.3 },
    startWeight: 0.18,
    blurb:
      'Telephone and computing companies with research arms and no obligation to call anything artificial intelligence. Publishes late, patents early, and quietly deploys.',
  },
  {
    id: 'british-programme',
    name: 'The British Research Council',
    short: 'BRC',
    span: [1950, 2050],
    taste: { symbolic: 0.7, cybernetic: 0.6, statistical: 0.5 },
    startWeight: 0.1,
    blurb:
      'A small, distinguished, chronically underfunded establishment with a habit of commissioning reviews and then acting on them decisively.',
  },
  {
    id: 'eastern-cybernetics',
    name: 'The Eastern Cybernetics Institutes',
    short: 'ECI',
    span: [1955, 1992],
    taste: { cybernetic: 0.9, collective: 0.6, evolutionary: 0.4, symbolic: 0.3 },
    startWeight: 0.1,
    blurb:
      'Denounced cybernetics as bourgeois pseudoscience, then reversed and made it state policy for planning the economy. Strong theory, chronically starved of hardware.',
  },
  {
    id: 'continental-groups',
    name: 'The Continental Research Groups',
    short: 'CNT',
    span: [1960, 2050],
    taste: { evolutionary: 0.8, symbolic: 0.6, bridge: 0.5, statistical: 0.4 },
    startWeight: 0.08,
    blurb:
      'German optimisation engineers, French logicians, Italian swarm theorists. Rarely sets the agenda; disproportionately often turns out to have been right.',
  },
  {
    id: 'pacific-industry',
    name: 'The Pacific Industrial Programme',
    short: 'PAC',
    span: [1978, 2050],
    taste: { bridge: 0.9, symbolic: 0.6, substrate: 0.7, collective: 0.4 },
    startWeight: 0.14,
    blurb:
      'A national bet placed by a ministry rather than a market: logic machines, fuzzy controllers and the fabrication capacity to build both. Ships product while everyone else writes papers.',
  },
  {
    id: 'expert-vendors',
    name: 'The Knowledge-Systems Vendors',
    short: 'VND',
    span: [1980, 1994],
    taste: { symbolic: 1.0 },
    startWeight: 0.12,
    blurb:
      'An industry that appeared in three years around workstations and rule engines, sold hard to every large corporation, and vanished slightly faster than it arrived.',
  },
  {
    id: 'platform-firms',
    name: 'The Platform Companies',
    short: 'PLT',
    span: [1998, 2050],
    taste: { statistical: 0.8, connectionist: 0.9, collective: 0.5, substrate: 0.6 },
    startWeight: 0.2,
    blurb:
      'Owns the data because it owns the surface the data is generated on. Discovered that a modest accuracy gain on a billion queries is worth more than any theorem.',
  },
  {
    id: 'frontier-labs',
    name: 'The Frontier Laboratories',
    short: 'FRN',
    span: [2012, 2050],
    taste: { connectionist: 1.0, cybernetic: 0.5, bridge: 0.3, substrate: 0.6 },
    startWeight: 0.24,
    blurb:
      'Small headcount, enormous capital, a stated mission and an unstated race. Publishes its results and withholds its weights, or the reverse, depending on the year.',
  },
  {
    id: 'safety-institutes',
    name: 'The Assurance Institutes',
    short: 'ASI',
    span: [2016, 2050],
    taste: { bridge: 0.8, statistical: 0.8, symbolic: 0.5, collective: 0.4 },
    startWeight: 0.08,
    blurb:
      'Underfunded relative to what it is asked to certify, and the only body in the room whose incentive is to find the problem rather than ship past it.',
  },
  {
    id: 'sovereign-programmes',
    name: 'The Sovereign Compute Programmes',
    short: 'SOV',
    span: [2026, 2050],
    taste: { connectionist: 0.8, substrate: 0.9, collective: 0.5, cybernetic: 0.5 },
    startWeight: 0.18,
    blurb:
      'States that concluded a frontier model is infrastructure, not a product, and began building fabrication and power capacity accordingly.',
  },
  {
    id: 'distributed-commons',
    name: 'The Distributed Commons',
    short: 'CMN',
    span: [2030, 2050],
    taste: { collective: 0.9, evolutionary: 0.6, substrate: 0.5, bridge: 0.5 },
    startWeight: 0.12,
    blurb:
      'What is left of the open ecosystem after the capital costs rose past any single contributor: federated training, pooled hardware, and a governance argument that never ends.',
  },
];

export const ACTOR_BY_ID: Record<string, ActorDef> = Object.fromEntries(ACTORS.map((a) => [a.id, a]));

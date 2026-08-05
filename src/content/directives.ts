import { after, all, before, flagSet, not, resource } from '../engine/conditions';
import type { Directive } from '../engine/types';

/**
 * Hand-written directives. Everything the player can do that is not simply "back this idea"
 * or "court that patron" lives here, because these are the moves with a position behind them.
 */
export const AUTHORED_DIRECTIVES: Directive[] = [
  {
    id: 'amplify',
    name: 'Talk the field up',
    blurb:
      'Press conferences, round numbers, a date by which it will be solved. Money follows attention, and attention is a loan.',
    cost: 3,
    category: 'field',
    effects: [
      { kind: 'resource', key: 'attention', op: 'add', value: 16 },
      { kind: 'resource', key: 'credibility', op: 'add', value: 3 },
      { kind: 'patron', patron: 'public', op: 'add', value: 6 },
      { kind: 'log', text: 'The field is promised to the newspapers again.', logKind: 'choice' },
    ],
  },
  {
    id: 'temper',
    name: 'Temper the claims',
    blurb:
      'Correct the record before someone else does. Costs you the room; buys you the decade.',
    cost: 3,
    category: 'field',
    effects: [
      { kind: 'resource', key: 'attention', op: 'add', value: -13 },
      { kind: 'resource', key: 'credibility', op: 'add', value: 6 },
      { kind: 'resource', key: 'understanding', op: 'add', value: 3 },
      { kind: 'log', text: 'Someone at the podium says "we do not know yet" and means it.', logKind: 'choice' },
    ],
  },
  {
    id: 'broker',
    name: 'Broker a collaboration',
    blurb:
      'Put two schools in a room and refuse to let either leave. Nothing is proved; a vocabulary is shared.',
    cost: 6,
    category: 'field',
    effects: [
      { kind: 'family', family: 'bridge', field: 'insight', op: 'add', value: 9 },
      { kind: 'family', family: 'bridge', field: 'momentum', op: 'add', value: 8 },
      { kind: 'resource', key: 'understanding', op: 'add', value: 5 },
      { kind: 'log', text: 'A joint workshop. Two-thirds of the attendees consider it a waste.', logKind: 'choice' },
    ],
  },
  {
    id: 'substrate-push',
    name: 'Fund the machines themselves',
    blurb:
      'Not an idea — a fabrication line. Every school gets faster, and the ones waiting on hardware get to exist.',
    cost: 7,
    category: 'world',
    effects: [
      { kind: 'compute', op: 'add', value: 0.34 },
      { kind: 'family', family: 'substrate', field: 'insight', op: 'add', value: 7 },
      { kind: 'patron', patron: 'corporate', op: 'add', value: 5 },
    ],
  },
  {
    id: 'open-publication',
    name: 'Insist on open publication',
    blurb:
      'Methods, weights, failures. The whole field moves; so does everyone you were ahead of.',
    cost: 4,
    category: 'world',
    when: after(1970),
    effects: [
      { kind: 'resource', key: 'understanding', op: 'add', value: 9 },
      { kind: 'resource', key: 'deployment', op: 'add', value: 4 },
      { kind: 'patron', patron: 'academic', op: 'add', value: 7 },
      { kind: 'flag', flag: 'openness', op: 'add', value: 1 },
    ],
  },
  {
    id: 'restrict-diffusion',
    name: 'Hold the results back',
    blurb:
      'Classified, embargoed, or simply not written up. Fewer hands on it; fewer eyes on it too.',
    cost: 4,
    category: 'world',
    when: after(1970),
    effects: [
      { kind: 'resource', key: 'deployment', op: 'add', value: -7 },
      { kind: 'resource', key: 'exposure', op: 'add', value: -6 },
      { kind: 'resource', key: 'understanding', op: 'add', value: -3 },
      { kind: 'patron', patron: 'military', op: 'add', value: 8 },
      { kind: 'flag', flag: 'openness', op: 'add', value: -1 },
    ],
  },
  {
    id: 'assurance',
    name: 'Fund the people who look for the failure',
    blurb:
      'Red teams, audits, interpretability. Produces nothing shippable and is the only reason anyone will sign for it later.',
    cost: 5,
    category: 'world',
    when: after(1978),
    effects: [
      { kind: 'resource', key: 'understanding', op: 'add', value: 11 },
      { kind: 'resource', key: 'exposure', op: 'add', value: -11 },
      { kind: 'resource', key: 'attention', op: 'add', value: -3 },
      { kind: 'actor', id: 'safety-institutes', field: 'weight', op: 'add', value: 0.03 },
      { kind: 'flag', flag: 'assuranceBacked', op: 'add', value: 1 },
    ],
  },
  {
    id: 'defend-unfashionable',
    name: 'Defend an unfashionable school',
    blurb:
      'Keep three people employed doing something the field agrees is finished. It has worked before.',
    cost: 4,
    category: 'people',
    when: after(1966),
    effects: [
      { kind: 'resource', key: 'credibility', op: 'add', value: -3 },
      { kind: 'resource', key: 'understanding', op: 'add', value: 4 },
      { kind: 'flag', flag: 'keptFaith', op: 'add', value: 1 },
      { kind: 'log', text: 'A small grant renewed against the advice of every reviewer.', logKind: 'choice' },
    ],
  },
  {
    id: 'industrial-application',
    name: 'Find the boring application that pays',
    blurb:
      'Not a demonstration — a product, in a sector nobody writes about. It is how a paradigm survives a decade of contempt.',
    cost: 5,
    category: 'world',
    when: after(1958),
    effects: [
      { kind: 'resource', key: 'deployment', op: 'add', value: 9 },
      { kind: 'patron', patron: 'corporate', op: 'add', value: 11 },
      { kind: 'resource', key: 'credibility', op: 'add', value: 5 },
      { kind: 'resource', key: 'attention', op: 'add', value: -2 },
    ],
  },
  {
    id: 'emergency-appeal',
    name: 'Make the case for survival',
    blurb:
      'Testify. Beg, if it comes to that. Nothing advances; some of it does not die.',
    cost: 4,
    category: 'field',
    when: { kind: 'inWinter', is: true },
    effects: [
      { kind: 'resource', key: 'credibility', op: 'add', value: 9 },
      { kind: 'patron', patron: 'academic', op: 'add', value: 9 },
      { kind: 'patron', patron: 'military', op: 'add', value: 5 },
      { kind: 'log', text: 'A committee is persuaded to keep the lights on.', logKind: 'choice' },
    ],
  },
  {
    id: 'governance-scaffold',
    name: 'Build the institutions before you need them',
    blurb:
      'Standards, liability, an inspectorate with subpoena power. Deeply unglamorous. Load-bearing.',
    cost: 7,
    category: 'world',
    when: all(after(1994), resource('deployment', '>', 25)),
    effects: [
      { kind: 'resource', key: 'exposure', op: 'add', value: -16 },
      { kind: 'resource', key: 'deployment', op: 'add', value: -4 },
      { kind: 'patron', patron: 'public', op: 'add', value: 9 },
      { kind: 'flag', flag: 'institutions', op: 'add', value: 1 },
    ],
  },
  {
    id: 'compute-consolidation',
    name: 'Let the compute consolidate',
    blurb:
      'Stop resisting it. Three organisations can afford the frontier; make sure they move fast.',
    cost: 6,
    category: 'world',
    when: all(after(2010), { kind: 'compute', op: '>', value: 17 }),
    effects: [
      { kind: 'compute', op: 'add', value: 0.28 },
      { kind: 'patron', patron: 'corporate', op: 'add', value: 12 },
      { kind: 'resource', key: 'exposure', op: 'add', value: 7 },
      { kind: 'flag', flag: 'concentration', op: 'add', value: 1 },
    ],
  },
  {
    id: 'distribute-capability',
    name: 'Push capability outward',
    blurb:
      'Smaller models, cheaper silicon, published methods. Nobody in front; nobody able to stop it either.',
    cost: 6,
    category: 'world',
    when: all(after(2010), { kind: 'compute', op: '>', value: 17 }),
    effects: [
      { kind: 'resource', key: 'deployment', op: 'add', value: 12 },
      { kind: 'family', family: 'collective', field: 'momentum', op: 'add', value: 8 },
      { kind: 'patron', patron: 'public', op: 'add', value: 6 },
      { kind: 'flag', flag: 'concentration', op: 'add', value: -1 },
    ],
  },
  {
    id: 'listen',
    name: 'Say nothing this term',
    blurb:
      'Watch. Some centuries you learn more by not touching it. Returns your unspent influence with interest.',
    cost: 0,
    category: 'field',
    effects: [
      { kind: 'resource', key: 'influence', op: 'add', value: 4 },
      { kind: 'resource', key: 'understanding', op: 'add', value: 2 },
    ],
  },
  {
    id: 'the-question',
    name: 'Ask the interface what it is',
    blurb: 'It has been offering. You have not taken it up.',
    cost: 0,
    category: 'field',
    when: all(after(1990), not(flagSet('askedInterface')), before(2050)),
    effects: [
      { kind: 'flag', flag: 'askedInterface', op: 'set', value: true },
      { kind: 'log', text: 'You put the question to the console. The console does not answer immediately.', logKind: 'system' },
    ],
  },
];

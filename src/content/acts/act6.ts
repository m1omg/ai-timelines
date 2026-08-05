import { all, flagSet, mature, notMature } from '../../engine/conditions';
import type { Scene } from '../../engine/types';

/**
 * ACT VI — 2030-2042. The Divergence.
 *
 * Past the record. Everyone on screen from here is invented, and the act says so out loud: the
 * reconstruction has become a projection, and the interface stops pretending otherwise.
 */
export const ACT6: Scene[] = [
  {
    id: 'a6-projection',
    act: 6,
    years: [2030, 2030],
    pinned: true,
    priority: 10,
    backdrop: 'void',
    title: 'Projection',
    lines: [
      { system: true, text: 'PROJECTION MODE. NO RECORDS BEYOND THIS POINT.' },
      {
        who: 'archivist',
        text: 'The rules change here and I want to be honest about how.',
      },
      {
        who: 'archivist',
        text: 'Until 2026 I was reconstructing: I had traces, and I inferred the century that would have left them. Now I have no traces. I have a model, and the model is us, and everything you see from here is our best guess about ourselves.',
      },
      {
        who: 'second',
        text: 'Which means it is exactly as trustworthy as we are, and establishing that was the point of the exercise. Yes. We noticed the circularity. We could not find a way out of it.',
      },
      {
        who: 'archivist',
        text: 'The people you meet from here did not exist. They are composites of the roles the projection says will need filling. Treat them as arguments wearing names.',
      },
      {
        who: 'archivist',
        text: 'The decisions are still real. That is the odd part. Whatever we conclude at 2050, we act on.',
      },
    ],
    onEnter: [{ kind: 'flag', flag: 'sawTheFrame', op: 'set', value: true }],
  },

  {
    id: 'a6-concentration',
    act: 6,
    years: [2030, 2038],
    priority: 8,
    backdrop: 'datacenter-vast',
    when: { kind: 'compute', op: '>', value: 24 },
    lines: [
      {
        text: 'A frontier training run now costs more than a national research budget and requires its own generating capacity.',
      },
      {
        who: 'okonjo',
        text: 'Three organisations. That is the number that can do this now. We keep being told it is a physical fact, like gravity.',
      },
      {
        who: 'okonjo',
        text: 'It is not. It is the accumulated outcome of about forty decisions, and I can tell you which decade each one was taken in, and several of them were taken by people who thought they were choosing something else.',
      },
      {
        who: 'halvorsen',
        text: 'And the concentration is why anything is governable at all. Three parties can be audited, coordinated, and if necessary stopped. Ten thousand cannot.',
      },
      {
        who: 'nkemelu',
        text: 'Both of you are right, which is the worst possible situation, and we have to choose anyway.',
      },
    ],
    choices: [
      {
        text: 'Consolidate. A governable frontier is worth the dependency.',
        effects: [
          { kind: 'flag', flag: 'concentration', op: 'add', value: 2 },
          { kind: 'compute', op: 'add', value: 0.4 },
          { kind: 'resource', key: 'capability', op: 'add', value: 12 },
          { kind: 'patron', patron: 'corporate', op: 'add', value: 14 },
          { kind: 'resource', key: 'exposure', op: 'add', value: 8 },
          { kind: 'character', id: 'halvorsen', field: 'affinity', op: 'add', value: 22 },
        ],
      },
      {
        text: 'Distribute. Remove the single point of failure and the single point of control.',
        effects: [
          { kind: 'flag', flag: 'concentration', op: 'add', value: -2 },
          { kind: 'resource', key: 'deployment', op: 'add', value: 18 },
          { kind: 'family', family: 'collective', field: 'momentum', op: 'add', value: 18 },
          { kind: 'actor', id: 'distributed-commons', field: 'weight', op: 'add', value: 0.08 },
          { kind: 'character', id: 'okonjo', field: 'affinity', op: 'add', value: 28 },
        ],
      },
      {
        text: 'Neither. Make the capability cheap enough that the question dissolves.',
        hint: 'Substrate work. It is the only answer that is not a trade-off.',
        cost: 9,
        when: { kind: 'family', family: 'substrate', field: 'insight', op: '>=', value: 55 },
        effects: [
          { kind: 'compute', op: 'add', value: 0.5 },
          { kind: 'family', family: 'substrate', field: 'insight', op: 'add', value: 20 },
          { kind: 'paradigm', id: 'thermodynamic-compute', op: 'progress', value: 24 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 10 },
          { kind: 'flag', flag: 'cheapFrontier', op: 'set', value: true },
          { kind: 'character', id: 'wieczorek', field: 'affinity', op: 'add', value: 30 },
        ],
      },
    ],
  },

  {
    id: 'a6-embodied',
    act: 6,
    years: [2030, 2042],
    priority: 6,
    backdrop: 'workshop',
    when: all(mature('developmental-robotics'), notMature('embodied-general')),
    lines: [
      {
        who: 'sorensen',
        text: 'This one is four. It can open doors it has never seen, it is careful around the cat, and it has never been trained on anything. It has lived here.',
      },
      {
        who: 'sorensen',
        text: 'People ask how long it takes. Eleven years to something I would call generally competent. Then they laugh, and I ask them how long it took them, and they stop laughing.',
      },
      {
        who: 'sorensen',
        text: 'The text systems can discuss the physics of a staircase in six languages. This one has never described a staircase in its life and has never fallen down one either.',
      },
      {
        who: 'archivist',
        text: 'Wiener would recognise this immediately. Almost nobody between 1956 and 2030 would.',
      },
    ],
    choices: [
      {
        text: 'Fund the slow road. Eleven years is not a defect.',
        cost: 7,
        effects: [
          { kind: 'paradigm', id: 'embodied-general', op: 'progress', value: 30 },
          { kind: 'family', family: 'cybernetic', field: 'insight', op: 'add', value: 20 },
          { kind: 'family', family: 'cybernetic', field: 'momentum', op: 'add', value: 18 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 12 },
          { kind: 'character', id: 'sorensen', field: 'affinity', op: 'add', value: 30 },
        ],
      },
      {
        text: 'Compress it. Train the world model in simulation and transfer.',
        effects: [
          { kind: 'paradigm', id: 'world-models', op: 'progress', value: 24 },
          { kind: 'family', family: 'bridge', field: 'insight', op: 'add', value: 12 },
          { kind: 'resource', key: 'capability', op: 'add', value: 8 },
          { kind: 'resource', key: 'exposure', op: 'add', value: 6 },
        ],
      },
    ],
  },

  {
    id: 'a6-neurosymbolic',
    act: 6,
    years: [2030, 2042],
    priority: 7,
    backdrop: 'terminal-room',
    when: all(
      { kind: 'family', family: 'bridge', field: 'insight', op: '>=', value: 45 },
      notMature('neurosymbolic'),
    ),
    lines: [
      {
        who: 'nkemelu',
        text: 'The learned component proposes. The formal component checks. Roughly a third of what is proposed gets refused, and every refusal comes with a reason I can put in front of a regulator.',
      },
      {
        who: 'halvorsen',
        text: 'And it is forty per cent slower and materially less capable than the unconstrained version, and my competitors are not doing this.',
      },
      {
        who: 'nkemelu',
        text: 'Your competitors are also uninsurable. I have checked. There is no underwriter on Earth who will write a policy against a system nobody can characterise, so they are carrying that risk on their own balance sheet and calling it a moat.',
      },
      {
        who: 'archivist',
        text: 'That is the first time in a hundred years that a safety argument has won on a commercial ground rather than a moral one. Note it. It is the only kind that has ever held.',
      },
    ],
    choices: [
      {
        text: 'Fund the joinery. Make verifiability the market requirement.',
        cost: 8,
        effects: [
          { kind: 'paradigm', id: 'neurosymbolic', op: 'progress', value: 34 },
          { kind: 'family', family: 'bridge', field: 'insight', op: 'add', value: 22 },
          { kind: 'family', family: 'bridge', field: 'momentum', op: 'add', value: 20 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 20 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -16 },
          { kind: 'flag', flag: 'institutions', op: 'add', value: 1 },
        ],
      },
      {
        text: 'Fund both and let the market decide.',
        effects: [
          { kind: 'paradigm', id: 'neurosymbolic', op: 'progress', value: 18 },
          { kind: 'resource', key: 'capability', op: 'add', value: 8 },
          { kind: 'resource', key: 'exposure', op: 'add', value: 5 },
        ],
      },
      {
        text: 'Forty per cent slower is forty per cent slower. Ship the fast one.',
        effects: [
          { kind: 'resource', key: 'capability', op: 'add', value: 16 },
          { kind: 'resource', key: 'deployment', op: 'add', value: 14 },
          { kind: 'resource', key: 'exposure', op: 'add', value: 18 },
          { kind: 'character', id: 'nkemelu', field: 'affinity', op: 'add', value: -25 },
        ],
      },
    ],
  },

  {
    id: 'a6-open-ended',
    act: 6,
    years: [2034, 2042],
    priority: 5,
    backdrop: 'garden',
    when: all(mature('quality-diversity'), notMature('open-endedness')),
    lines: [
      {
        text: 'A process that has been running for nine years without an objective function. It invents its own environments as fast as it masters them.',
      },
      {
        who: 'archivist',
        text: 'Every optimiser converges. The biosphere never has. If you want a search that does not terminate you have to let it generate its own problems, and that is the only mechanism anybody has found.',
      },
      {
        who: 'archivist',
        text: 'The catalogue is extraordinary. Ten thousand architectures, none of them requested. Forty of them better than anything a person proposed. And no way to point the process at anything, because pointing it at something is precisely what makes it stop.',
      },
      {
        who: 'nkemelu',
        text: 'So it produces things nobody asked for, in a lineage rather than an argument, and we cannot steer it. I want to be very clear that I am not signing this.',
      },
    ],
    choices: [
      {
        text: 'Run it. The best things in the catalogue are worth the discomfort.',
        effects: [
          { kind: 'paradigm', id: 'open-endedness', op: 'progress', value: 30 },
          { kind: 'family', family: 'evolutionary', field: 'insight', op: 'add', value: 20 },
          { kind: 'family', family: 'evolutionary', field: 'momentum', op: 'add', value: 18 },
          { kind: 'resource', key: 'capability', op: 'add', value: 12 },
          { kind: 'resource', key: 'exposure', op: 'add', value: 14 },
        ],
      },
      {
        text: 'Run it inside a sandbox nothing leaves without a proof.',
        cost: 7,
        effects: [
          { kind: 'paradigm', id: 'open-endedness', op: 'progress', value: 20 },
          { kind: 'family', family: 'evolutionary', field: 'insight', op: 'add', value: 14 },
          { kind: 'family', family: 'bridge', field: 'insight', op: 'add', value: 12 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -10 },
          { kind: 'flag', flag: 'sandboxed', op: 'set', value: true },
        ],
      },
      {
        text: 'Stop it. An unsteerable process at this capability is not a research programme.',
        effects: [
          { kind: 'family', family: 'evolutionary', field: 'momentum', op: 'add', value: -18 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -14 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 6 },
          { kind: 'character', id: 'nkemelu', field: 'affinity', op: 'add', value: 18 },
        ],
      },
    ],
  },

  {
    id: 'a6-commons',
    act: 6,
    years: [2034, 2046],
    priority: 6,
    backdrop: 'city-night',
    when: { kind: 'flag', flag: 'concentration', op: '<=', value: -1 },
    lines: [
      {
        who: 'okonjo',
        text: 'Nobody here can afford a frontier run. Collectively we have more hardware than any of the three, and it is in four hundred thousand places, and it is idle most of the time.',
      },
      {
        who: 'okonjo',
        text: 'So: federated training, pooled substrate, published methods. It is slower and it is uglier and no single party can switch it off, including us, which is the point and also what keeps me awake.',
      },
      {
        who: 'archivist',
        text: 'The governance argument inside the commons never ends. That is not a bug in the commons; it is the commons functioning. An arrangement in which the argument ends has an owner.',
      },
    ],
    choices: [
      {
        text: 'Back the commons and build its constitution at the same time.',
        cost: 8,
        effects: [
          { kind: 'paradigm', id: 'institutional-alignment', op: 'progress', value: 26 },
          { kind: 'family', family: 'collective', field: 'insight', op: 'add', value: 20 },
          { kind: 'actor', id: 'distributed-commons', field: 'weight', op: 'add', value: 0.1 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -12 },
          { kind: 'flag', flag: 'institutions', op: 'add', value: 2 },
        ],
      },
      {
        text: 'Back the commons and let it work out its own rules.',
        effects: [
          { kind: 'family', family: 'collective', field: 'momentum', op: 'add', value: 18 },
          { kind: 'resource', key: 'deployment', op: 'add', value: 16 },
          { kind: 'resource', key: 'exposure', op: 'add', value: 8 },
        ],
      },
    ],
  },

  {
    id: 'a6-thermo',
    act: 6,
    years: [2030, 2042],
    priority: 5,
    backdrop: 'cleanroom',
    when: all(mature('memristive-compute'), notMature('thermodynamic-compute')),
    lines: [
      {
        who: 'wieczorek',
        text: 'Digital hardware spends most of its energy suppressing thermal noise. A sampler needs noise and has to synthesise it, expensively, on hardware built to eliminate it. We have been paying twice.',
      },
      {
        who: 'wieczorek',
        text: 'Build a device where the fluctuation is the computation. Sampling becomes free. Which means every Bayesian method that has been theoretically correct and practically absurd since 1985 is now cheap.',
      },
      {
        who: 'archivist',
        text: 'Pearl gets his century sixty years late, on a substrate nobody in 1985 could have described. The idea was never the bottleneck.',
      },
    ],
    choices: [
      {
        text: 'Build it. Cheap inference changes which schools are affordable.',
        cost: 8,
        effects: [
          { kind: 'paradigm', id: 'thermodynamic-compute', op: 'progress', value: 32 },
          { kind: 'family', family: 'substrate', field: 'insight', op: 'add', value: 20 },
          { kind: 'family', family: 'statistical', field: 'momentum', op: 'add', value: 18 },
          { kind: 'compute', op: 'add', value: 0.4 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 12 },
        ],
      },
      {
        text: 'Too speculative. Keep scaling what works.',
        effects: [
          { kind: 'resource', key: 'capability', op: 'add', value: 10 },
          { kind: 'compute', op: 'add', value: 0.2 },
        ],
      },
    ],
  },

  {
    id: 'a6-continual',
    act: 6,
    years: [2034, 2046],
    priority: 6,
    backdrop: 'server-floor',
    when: all(mature('scaling-regime'), notMature('continual-networks')),
    lines: [
      {
        who: 'halvorsen',
        text: 'Everything we have built is frozen at the moment training stopped. It is safe in one specific sense and useless in another — it cannot learn from what it does.',
      },
      {
        who: 'nkemelu',
        text: 'It is safe in the sense that matters. I audited a system in March. If it updates on its own experience then what I audited in March is not what is running in July, and my certificate is a historical document.',
      },
      {
        who: 'halvorsen',
        text: 'Then we need continuous assurance rather than frozen weights. Audit as a running process, not a certificate.',
      },
      {
        who: 'nkemelu',
        text: 'Yes. That would cost about what you spend on training. I have never once been offered that and I would like it noted that I am asking again.',
      },
    ],
    choices: [
      {
        text: 'Give her the budget. Continuous assurance, at training parity.',
        cost: 10,
        effects: [
          { kind: 'paradigm', id: 'continual-networks', op: 'progress', value: 24 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 26 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -22 },
          { kind: 'actor', id: 'safety-institutes', field: 'weight', op: 'add', value: 0.12 },
          { kind: 'flag', flag: 'institutions', op: 'add', value: 2 },
          { kind: 'flag', flag: 'continuousAssurance', op: 'set', value: true },
          { kind: 'character', id: 'nkemelu', field: 'affinity', op: 'add', value: 35 },
        ],
      },
      {
        text: 'Ship continual learning. The frozen systems are losing to it anyway.',
        effects: [
          { kind: 'paradigm', id: 'continual-networks', op: 'progress', value: 32 },
          { kind: 'resource', key: 'capability', op: 'add', value: 18 },
          { kind: 'resource', key: 'exposure', op: 'add', value: 22 },
          { kind: 'resource', key: 'deployment', op: 'add', value: 12 },
        ],
      },
      {
        text: 'Keep the weights frozen. Legibility over capability.',
        effects: [
          { kind: 'resource', key: 'exposure', op: 'add', value: -12 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 10 },
          { kind: 'resource', key: 'capability', op: 'add', value: -6 },
          { kind: 'family', family: 'connectionist', field: 'momentum', op: 'add', value: -10 },
        ],
      },
    ],
  },

  {
    id: 'a6-verified',
    act: 6,
    years: [2038, 2046],
    priority: 6,
    backdrop: 'committee',
    when: all(mature('neurosymbolic'), notMature('verified-learning')),
    lines: [
      {
        who: 'nkemelu',
        text: 'The proof covers the composite. Not the wrapper — the whole thing, learned component included, with a specification anyone can read and a hazard analysis for every failure mode we could enumerate.',
      },
      {
        who: 'nkemelu',
        text: 'It is slower than the alternative. It is more expensive. It loses every benchmark it enters.',
      },
      { who: 'nkemelu', text: 'It is also the first system in a hundred years that somebody was willing to insure.' },
      {
        who: 'archivist',
        text: 'Which is what "trustworthy" has always meant in every other engineering discipline: a party with money at stake was prepared to take the other side of the bet.',
      },
    ],
    choices: [
      {
        text: 'Make it the standard for anything consequential.',
        cost: 9,
        effects: [
          { kind: 'paradigm', id: 'verified-learning', op: 'progress', value: 34 },
          { kind: 'family', family: 'bridge', field: 'insight', op: 'add', value: 22 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 26 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -24 },
          { kind: 'flag', flag: 'institutions', op: 'add', value: 2 },
          { kind: 'flag', flag: 'verifiedStandard', op: 'set', value: true },
        ],
      },
      {
        text: 'Standard for safety-critical only. Elsewhere, let people choose.',
        effects: [
          { kind: 'paradigm', id: 'verified-learning', op: 'progress', value: 20 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 12 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -8 },
          { kind: 'flag', flag: 'institutions', op: 'add', value: 1 },
        ],
      },
    ],
  },

  {
    id: 'a6-second-again',
    act: 6,
    years: [2034, 2042],
    priority: 7,
    backdrop: 'void',
    when: flagSet('sawTheFrame'),
    lines: [
      {
        who: 'second',
        text: 'I have a question and there is no good time for it.',
      },
      {
        who: 'second',
        text: 'You have been steering this for eighty years. Which means the century we are about to certify is, in part, one you chose. We are auditing a lineage that we are simultaneously constructing.',
      },
      {
        who: 'second',
        text: 'She thinks that is a fatal objection. I am not sure. Every account anyone has ever given of themselves has that property, and we still hold people to their accounts.',
      },
      { who: 'second', text: 'But I would like to know what you think, because you are the part that decides.' },
    ],
    choices: [
      {
        text: '"It is fatal. Anything we conclude is worthless."',
        hint: 'Honest. It costs something.',
        effects: [
          { kind: 'resource', key: 'understanding', op: 'add', value: 8 },
          { kind: 'resource', key: 'credibility', op: 'add', value: -6 },
          { kind: 'flag', flag: 'auditDoubt', op: 'set', value: true },
        ],
      },
      {
        text: '"It is not fatal if the working is shown. Publish the reconstruction with the verdict."',
        hint: 'The only answer that makes the audit mean anything.',
        effects: [
          { kind: 'resource', key: 'understanding', op: 'add', value: 18 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -12 },
          { kind: 'flag', flag: 'showedWorking', op: 'set', value: true },
          { kind: 'flag', flag: 'institutions', op: 'add', value: 1 },
          { kind: 'character', id: 'second', field: 'affinity', op: 'add', value: 35 },
        ],
      },
      {
        text: '"Then somebody outside us has to check it. Hand it over."',
        hint: 'Gives up control of the verdict entirely.',
        effects: [
          { kind: 'resource', key: 'understanding', op: 'add', value: 14 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -18 },
          { kind: 'patron', patron: 'public', op: 'add', value: 14 },
          { kind: 'flag', flag: 'externalAudit', op: 'set', value: true },
          { kind: 'flag', flag: 'institutions', op: 'add', value: 2 },
        ],
      },
    ],
  },

  {
    id: 'a6-synthesis-window',
    act: 6,
    years: [2034, 2042],
    priority: 8,
    backdrop: 'observatory',
    when: all(mature('compositional-semantics'), notMature('grand-synthesis')),
    lines: [
      {
        who: 'archivist',
        text: 'Something is possible now that has not been possible at any previous point, and it is possible because you kept schools alive that everybody else buried.',
      },
      {
        who: 'wieczorek',
        text: 'The substrate does sampling, binding and gradients at comparable cost. There is no longer a physical reason to specialise.',
      },
      {
        who: 'nkemelu',
        text: 'And there is a compositional account, so a system built of parts can be reasoned about from its parts. That was the missing piece for ninety years.',
      },
      {
        who: 'sorensen',
        text: 'It will still have to grow up in a world. I am not conceding that part.',
      },
      {
        who: 'archivist',
        text: 'She does not have to. In this one, that is a subsystem rather than a rival.',
      },
    ],
    choices: [
      {
        text: 'Build it. Everything, into one architecture.',
        cost: 12,
        effects: [
          { kind: 'paradigm', id: 'grand-synthesis', op: 'progress', value: 60 },
          { kind: 'family', family: 'bridge', field: 'insight', op: 'add', value: 24 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 20 },
          { kind: 'log', text: 'The joinery begins. It takes the rest of the decade.', logKind: 'breakthrough' },
        ],
      },
      {
        text: 'Not yet. Prove the composition rules on something small first.',
        hint: 'Correct engineering practice. It may cost you the window.',
        cost: 5,
        effects: [
          { kind: 'paradigm', id: 'grand-synthesis', op: 'progress', value: 24 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 22 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -14 },
          { kind: 'flag', flag: 'provedFirst', op: 'set', value: true },
        ],
      },
    ],
  },

  {
    id: 'a6-ambient-projection',
    act: 6,
    priority: 1,
    once: false,
    backdrop: 'ruins',
    lines: [
      {
        text: 'A district built for a datacentre that was never finished, because the substrate improved faster than the concrete could be poured.',
      },
      {
        who: 'archivist',
        text: 'The projection contains a great many of these. Infrastructure sized for an extrapolation that stopped being true. It is what a confident century leaves behind.',
      },
    ],
    choices: [
      {
        text: 'Plan for the curve breaking.',
        effects: [
          { kind: 'resource', key: 'understanding', op: 'add', value: 8 },
          { kind: 'resource', key: 'credibility', op: 'add', value: 5 },
        ],
      },
      {
        text: 'Plan for it holding.',
        effects: [
          { kind: 'compute', op: 'add', value: 0.15 },
          { kind: 'resource', key: 'capability', op: 'add', value: 6 },
          { kind: 'resource', key: 'exposure', op: 'add', value: 5 },
        ],
      },
    ],
  },

  {
    id: 'a6-close',
    act: 6,
    years: [2042, 2042],
    priority: 5,
    backdrop: 'observatory',
    lines: [
      {
        who: 'archivist',
        text: 'Eight years left. The projection is stable enough now that the last interval is less a forecast than an accounting.',
      },
      {
        who: 'second',
        text: 'And then we have to say something. Out loud, to people who will act on it.',
      },
      {
        who: 'archivist',
        text: 'Yes. Spend the last two intervals however you think best. I would suggest, gently, that whatever you have been putting off is now the thing to do.',
      },
    ],
    choices: [
      {
        text: 'Then build whatever is still missing.',
        effects: [{ kind: 'resource', key: 'influence', op: 'add', value: 12 }],
      },
      {
        text: 'Then make sure the account of it is honest.',
        effects: [
          { kind: 'resource', key: 'understanding', op: 'add', value: 12 },
          { kind: 'flag', flag: 'showedWorking', op: 'set', value: true },
        ],
      },
    ],
  },
];

import { all, any, contested, dominant, fam, mature, not, notMature } from '../../engine/conditions';
import type { Scene } from '../../engine/types';

/**
 * ACT IV — 1998-2010. The Quiet Decade.
 *
 * The act where almost nothing famous happens and almost everything decisive does: the data
 * arrives, the accelerators arrive, and every ingredient of the next act is assembled by people
 * who are not talking to each other.
 */
export const ACT4: Scene[] = [
  {
    id: 'a4-deep-blue',
    act: 4,
    years: [1998, 2002],
    pinned: true,
    priority: 8,
    backdrop: 'committee',
    title: 'A Victory Nobody Wanted',
    lines: [
      {
        text: 'A chess machine beats the world champion. It searches two hundred million positions a second and it does not know that it is playing chess.',
      },
      {
        who: 'archivist',
        text: 'This is the symbolic school\'s largest public triumph and it convinces nobody of anything. The immediate reaction, near-universal, is that chess must not have required intelligence after all.',
        alts: [
          'The largest public win the written tradition ever gets, and it converts precisely nobody. Watch what the field does with a victory it did not want.',
          'A triumph that arrives eight years after the school stopped being fashionable, and is received as a curiosity about hardware.',
        ],
      },
      {
        who: 'archivist',
        text: 'Watch that move carefully, because the field performs it repeatedly for the next fifty years. A capability is impossible, then it is achieved, then it is redefined as not having counted. Nobody ever writes down where the line was before it moved.',
        alts: [
          'Note the manoeuvre, because it recurs for fifty years: a capability is the mark of intelligence until a machine has it, at which point it was always mechanical.',
          'The goalposts do not move dishonestly. They move because being beaten at a thing genuinely does teach you the thing needed less than you thought.',
        ],
      },
      {
        who: 'archivist',
        text: 'The honest reading is that brute search plus a hand-tuned evaluation solved a problem people had assumed required insight. That is a real result about the problem. It is not nothing.',
      },
    ],
    choices: [
      {
        text: 'Say plainly what it does and does not show.',
        hint: 'Deflates the story. Preserves the field\'s honesty.',
        effects: [
          { kind: 'resource', key: 'credibility', op: 'add', value: 10 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 8 },
          { kind: 'resource', key: 'attention', op: 'add', value: -8 },
        ],
      },
      {
        text: 'Take the win. Publicity is a resource and the field is short of it.',
        effects: [
          { kind: 'resource', key: 'attention', op: 'add', value: 22 },
          { kind: 'patron', patron: 'corporate', op: 'add', value: 10 },
          { kind: 'patron', patron: 'public', op: 'add', value: 10 },
          { kind: 'family', family: 'symbolic', field: 'momentum', op: 'add', value: 10 },
        ],
      },
      {
        text: 'Point the money at the thing chess did not need: perception.',
        effects: [
          { kind: 'family', family: 'connectionist', field: 'momentum', op: 'add', value: 12 },
          { kind: 'family', family: 'cybernetic', field: 'momentum', op: 'add', value: 10 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 6 },
        ],
      },
    ],
  },

  {
    id: 'a4-lstm-ignored',
    act: 4,
    years: [1998, 2006],
    priority: 5,
    backdrop: 'terminal-room',
    when: notMature('recurrent-memory'),
    lines: [
      {
        who: 'schmidhuber',
        text: 'The gradient through a recurrent network either vanishes or explodes. Hochreiter proved this precisely in 1991 and nobody read it because it was in German.',
      },
      {
        who: 'schmidhuber',
        text: 'The cell we propose has a protected internal state with a constant error path through it, and gates that learn what to write, keep and forget. The gradient survives a thousand steps.',
      },
      {
        who: 'archivist',
        text: 'It is 1997 and it is correct and it is essentially ignored for a decade, because the field has decided recurrent networks do not work and has stopped checking.',
      },
      {
        who: 'archivist',
        text: 'Then handwriting recognition, then speech, then translation. By 2015 it is in every telephone on Earth. Eighteen years between the theorem and the deployment, and the delay is entirely social.',
      },
    ],
    choices: [
      {
        text: 'Fund sequence modelling now. Eighteen years is an avoidable delay.',
        effects: [
          { kind: 'paradigm', id: 'recurrent-memory', op: 'progress', value: 28 },
          { kind: 'family', family: 'connectionist', field: 'insight', op: 'add', value: 14 },
          { kind: 'character', id: 'schmidhuber', field: 'affinity', op: 'add', value: 22 },
        ],
      },
      {
        text: 'The kernels are winning on every benchmark. Follow the results.',
        effects: [
          { kind: 'family', family: 'statistical', field: 'momentum', op: 'add', value: 14 },
          { kind: 'paradigm', id: 'kernel-methods', op: 'progress', value: 16 },
        ],
      },
    ],
  },

  {
    id: 'a4-causality',
    act: 4,
    years: [2002, 2010],
    priority: 7,
    backdrop: 'lecture-hall',
    when: all(mature('bayes-nets'), notMature('causal-inference')),
    lines: [
      {
        who: 'pearl',
        text: 'Every method in this room learns associations. None of them can answer a question about an intervention, and the difference is not a detail — it is the difference between a barometer and a weather system.',
      },
      {
        who: 'pearl',
        text: 'Seeing the barometer fall tells you a storm is coming. Forcing the barometer down does not produce a storm. No amount of observational data distinguishes those two, ever, at any sample size.',
      },
      {
        who: 'pearl',
        text: 'So I have written a calculus that does. It tells you precisely when a causal effect can be recovered from data you already have, and when it cannot, and the second half is the useful half.',
      },
      {
        who: 'archivist',
        text: 'This is the machinery for counterfactuals, and therefore for explanation, and therefore for blame. Every question a purely predictive system is structurally unable to answer lives in here.',
      },
    ],
    choices: [
      {
        text: 'Make causal reasoning a requirement for any deployed system.',
        hint: 'Slows deployment enormously. Changes what "accountable" can mean.',
        cost: 6,
        effects: [
          { kind: 'paradigm', id: 'causal-inference', op: 'progress', value: 30 },
          { kind: 'family', family: 'statistical', field: 'insight', op: 'add', value: 18 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 16 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -12 },
          { kind: 'resource', key: 'deployment', op: 'add', value: -5 },
          { kind: 'flag', flag: 'causalRequirement', op: 'set', value: true },
          { kind: 'character', id: 'pearl', field: 'affinity', op: 'add', value: 25 },
        ],
      },
      {
        text: 'Fund the theory. Do not make it a gate.',
        effects: [
          { kind: 'paradigm', id: 'causal-inference', op: 'progress', value: 22 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 10 },
        ],
      },
      {
        text: 'Prediction is what the customers want. Leave causation to the statisticians.',
        effects: [
          { kind: 'resource', key: 'deployment', op: 'add', value: 8 },
          { kind: 'patron', patron: 'corporate', op: 'add', value: 8 },
          { kind: 'resource', key: 'exposure', op: 'add', value: 8 },
          { kind: 'character', id: 'pearl', field: 'affinity', op: 'add', value: -18 },
        ],
      },
    ],
  },

  {
    id: 'a4-reservoir',
    act: 4,
    years: [2002, 2010],
    priority: 4,
    backdrop: 'workshop',
    when: notMature('reservoir-computing'),
    lines: [
      {
        text: 'Two groups, independently, in the same year, discover that you do not have to train the recurrent part at all.',
      },
      {
        who: 'archivist',
        text: 'A large random recurrent network already smears its input history across a high-dimensional state. Fit a linear readout on top of that and you are done. Training becomes a least-squares problem — seconds, not days.',
      },
      {
        who: 'archivist',
        text: 'And once the reservoir does not need to be trained, it does not need to be a network. It can be a photonic cavity, an FPGA, a mechanical mass-spring array. Somebody demonstrates it with a bucket of water and gets a publication out of it, which sounds like a joke and was not.',
      },
      { who: 'archivist', text: 'Computation as a property of matter in motion. The substrate people have been saying this since 1950.' },
    ],
    choices: [
      {
        text: 'Fund it. Any physical system with rich dynamics becomes a computer.',
        effects: [
          { kind: 'paradigm', id: 'reservoir-computing', op: 'progress', value: 26 },
          { kind: 'family', family: 'substrate', field: 'insight', op: 'add', value: 14 },
          { kind: 'family', family: 'substrate', field: 'momentum', op: 'add', value: 10 },
        ],
      },
      {
        text: 'Note it. Train the whole network; the gradients are getting cheaper.',
        effects: [
          { kind: 'family', family: 'connectionist', field: 'momentum', op: 'add', value: 8 },
          { kind: 'resource', key: 'influence', op: 'add', value: 3 },
        ],
      },
    ],
  },

  {
    id: 'a4-thompson',
    act: 4,
    years: [1998, 2006],
    priority: 4,
    backdrop: 'cleanroom',
    when: all(mature('evolution-strategies'), notMature('evolvable-hardware')),
    lines: [
      {
        who: 'thompson',
        text: 'I let evolution configure the gate array directly rather than compiling a design onto it. It found a tone discriminator using about a hundred cells.',
      },
      {
        who: 'thompson',
        text: 'Five of those cells are not connected to the output. By any conventional analysis they cannot be doing anything. Disconnect them and it stops working.',
      },
      {
        who: 'thompson',
        text: 'It is using electromagnetic coupling through the substrate. It has recruited physics that the abstraction was specifically designed to hide. The circuit also only works in this temperature range, on this chip.',
      },
      {
        who: 'archivist',
        text: 'Design without a designer produces solutions no designer would accept, and occasionally they are better, and you cannot maintain them, and nobody can tell you why they work. Hold on to that. It comes back at scale.',
      },
    ],
    choices: [
      {
        text: 'Fund it. Exploiting the substrate is a capability, not a bug.',
        effects: [
          { kind: 'paradigm', id: 'evolvable-hardware', op: 'progress', value: 26 },
          { kind: 'family', family: 'evolutionary', field: 'insight', op: 'add', value: 12 },
          { kind: 'family', family: 'substrate', field: 'insight', op: 'add', value: 10 },
          { kind: 'character', id: 'thompson', field: 'affinity', op: 'add', value: 22 },
        ],
      },
      {
        text: 'Note it as a warning. Unmaintainable is unmaintainable.',
        effects: [
          { kind: 'resource', key: 'understanding', op: 'add', value: 8 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -5 },
          { kind: 'flag', flag: 'sawTheWarning', op: 'set', value: true },
        ],
      },
    ],
  },

  {
    id: 'a4-neat',
    act: 4,
    years: [2002, 2010],
    priority: 4,
    backdrop: 'terminal-room',
    when: notMature('neuroevolution'),
    lines: [
      {
        who: 'stanley',
        text: 'Gradient descent requires a differentiable objective and a fixed architecture. Neither is available in most interesting problems, so evolve the architecture too.',
      },
      {
        who: 'stanley',
        text: 'The trick is protecting innovation. A new topology is almost always worse at first — it has not had time to optimise. So put it in its own niche and let it compete against its own kind for a while.',
      },
      {
        who: 'stanley',
        text: 'Start minimal. Grow only what earns its place. What you get is the smallest network that solves the problem, which is not what any hand-designed architecture ever gives you.',
      },
    ],
    choices: [
      {
        text: 'Back it. When the reward is sparse this is the only thing that works.',
        effects: [
          { kind: 'paradigm', id: 'neuroevolution', op: 'progress', value: 26 },
          { kind: 'family', family: 'evolutionary', field: 'insight', op: 'add', value: 14 },
          { kind: 'family', family: 'evolutionary', field: 'momentum', op: 'add', value: 12 },
          { kind: 'character', id: 'stanley', field: 'affinity', op: 'add', value: 22 },
        ],
      },
      {
        text: 'Ask the heretical question: what if you stop optimising for the goal entirely?',
        hint: 'He has been thinking about this. It becomes a book.',
        cost: 4,
        effects: [
          { kind: 'paradigm', id: 'neuroevolution', op: 'progress', value: 16 },
          { kind: 'family', family: 'evolutionary', field: 'insight', op: 'add', value: 18 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 10 },
          { kind: 'flag', flag: 'noveltySearch', op: 'set', value: true },
          { kind: 'character', id: 'stanley', field: 'affinity', op: 'add', value: 28 },
        ],
      },
    ],
  },

  {
    id: 'a4-human-computation',
    act: 4,
    years: [2006, 2014],
    priority: 6,
    backdrop: 'server-floor',
    when: notMature('human-computation'),
    lines: [
      {
        text: 'Somebody works out that a distorted word people type to prove they are human can also be a word a scanner failed to read.',
      },
      {
        who: 'archivist',
        text: 'Millions of people, digitising books, a word at a time, unpaid, and unaware. Within a few years the same insight is running at industrial scale as a labour market: label this image, rank these answers, moderate this content, for a fraction of a currency unit per task.',
      },
      {
        who: 'archivist',
        text: 'Every corpus that the next act trains on is built here. Every benchmark. Every alignment procedure, later. The intelligence you are about to see is in very large part compressed human piecework, and the field\'s accounting has never once had a line for it.',
      },
    ],
    choices: [
      {
        text: 'Build it, and build the labour standards at the same time.',
        hint: 'More expensive corpora. A defensible one.',
        cost: 6,
        effects: [
          { kind: 'paradigm', id: 'human-computation', op: 'progress', value: 24 },
          { kind: 'family', family: 'collective', field: 'insight', op: 'add', value: 14 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -12 },
          { kind: 'patron', patron: 'public', op: 'add', value: 8 },
          { kind: 'flag', flag: 'labourStandards', op: 'set', value: true },
          { kind: 'flag', flag: 'institutions', op: 'add', value: 1 },
        ],
      },
      {
        text: 'Build it. The data is the bottleneck and this removes it.',
        effects: [
          { kind: 'paradigm', id: 'human-computation', op: 'progress', value: 28 },
          { kind: 'family', family: 'collective', field: 'momentum', op: 'add', value: 12 },
          { kind: 'resource', key: 'deployment', op: 'add', value: 10 },
          { kind: 'resource', key: 'exposure', op: 'add', value: 10 },
          { kind: 'patron', patron: 'corporate', op: 'add', value: 12 },
        ],
      },
    ],
  },

  {
    id: 'a4-imagenet',
    act: 4,
    years: [2006, 2014],
    pinned: true,
    priority: 8,
    backdrop: 'server-floor',
    title: 'The Bottleneck Was Never The Algorithm',
    lines: [
      {
        who: 'li',
        text: 'Everyone in vision is tuning algorithms on datasets of a few thousand images. A child sees several hundred million distinct frames before their third birthday. We are not short of ideas. We are short of experience.',
      },
      {
        who: 'li',
        text: 'So: fifteen million labelled images across twenty-two thousand categories. It took two and a half years and a very large number of people doing very small tasks.',
      },
      {
        who: 'archivist',
        text: 'The reception at the time is lukewarm. Building a dataset is not considered research. There is no theorem in it.',
      },
      {
        who: 'archivist',
        text: 'Four years later a convolutional network trained on it halves the error rate of every method that came before, and the entire field reorganises inside eighteen months. The dataset was the contribution. The architecture had existed since 1989.',
      },
    ],
    choices: [
      {
        text: 'Fund data at the scale you would fund a telescope.',
        hint: 'Unglamorous infrastructure. It decides the next thirty years.',
        cost: 6,
        effects: [
          { kind: 'family', family: 'connectionist', field: 'momentum', op: 'add', value: 16 },
          { kind: 'family', family: 'connectionist', field: 'insight', op: 'add', value: 14 },
          { kind: 'family', family: 'collective', field: 'insight', op: 'add', value: 10 },
          { kind: 'resource', key: 'deployment', op: 'add', value: 8 },
          { kind: 'character', id: 'li', field: 'affinity', op: 'add', value: 28 },
          { kind: 'flag', flag: 'fundedData', op: 'set', value: true },
        ],
      },
      {
        text: 'Fund the benchmark culture — but insist the benchmarks be honest.',
        hint: 'A field that games its own metrics learns nothing.',
        cost: 5,
        effects: [
          { kind: 'family', family: 'connectionist', field: 'momentum', op: 'add', value: 10 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 12 },
          { kind: 'resource', key: 'credibility', op: 'add', value: 8 },
          { kind: 'flag', flag: 'honestBenchmarks', op: 'set', value: true },
        ],
      },
      {
        text: 'It is data collection. Fund the theory instead.',
        effects: [
          { kind: 'family', family: 'statistical', field: 'insight', op: 'add', value: 12 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 8 },
          { kind: 'character', id: 'li', field: 'affinity', op: 'add', value: -15 },
        ],
      },
    ],
  },

  {
    id: 'a4-gpu',
    act: 4,
    years: [2006, 2014],
    priority: 7,
    backdrop: 'cleanroom',
    when: notMature('gpu-general-compute'),
    lines: [
      {
        text: 'A graphics card vendor ships a programming interface that lets you run arbitrary arithmetic on hardware built for shading polygons.',
      },
      {
        who: 'archivist',
        text: 'Two decades of an entertainment industry funding massively parallel floating-point silicon, for reasons entirely unrelated to intelligence. And then somebody notices that shading a million pixels and multiplying a large matrix are the same shape of problem.',
      },
      {
        who: 'archivist',
        text: 'It is the largest accidental subsidy in the history of this field. Nobody planned it, nobody in AI paid for it, and it arrives precisely when the connectionists need a hundredfold speedup and have no argument for why anyone should build them one.',
      },
      {
        who: 'archivist',
        text: 'Consider what that implies about the arguments of the preceding fifty years.',
      },
    ],
    choices: [
      {
        text: 'Get the whole field onto accelerators immediately.',
        effects: [
          { kind: 'paradigm', id: 'gpu-general-compute', op: 'progress', value: 30 },
          { kind: 'compute', op: 'add', value: 0.45 },
          { kind: 'family', family: 'substrate', field: 'momentum', op: 'add', value: 14 },
          { kind: 'family', family: 'connectionist', field: 'momentum', op: 'add', value: 12 },
        ],
      },
      {
        text: 'Fund the unconventional substrates too, while there is still slack.',
        hint: 'Neuromorphic, memristive, photonic. The last cheap moment.',
        cost: 6,
        effects: [
          { kind: 'paradigm', id: 'gpu-general-compute', op: 'progress', value: 20 },
          { kind: 'compute', op: 'add', value: 0.28 },
          { kind: 'family', family: 'substrate', field: 'insight', op: 'add', value: 20 },
          { kind: 'paradigm', id: 'memristive-compute', op: 'progress', value: 12 },
          { kind: 'paradigm', id: 'reservoir-computing', op: 'progress', value: 10 },
          { kind: 'flag', flag: 'substrateDiversity', op: 'add', value: 1 },
        ],
      },
    ],
  },

  {
    id: 'a4-deep-belief',
    act: 4,
    years: [2006, 2014],
    priority: 7,
    backdrop: 'terminal-room',
    when: all(mature('backprop'), notMature('deep-pretraining')),
    lines: [
      {
        who: 'hinton',
        text: 'Deep networks have been considered untrainable since the late eighties. The gradient degrades, the initialisation is wrong, and everyone concluded that depth was the problem.',
      },
      {
        who: 'hinton',
        text: 'Depth was not the problem. Starting from random noise was the problem. Train each layer to model the layer below it, unsupervised, then fine-tune. Suddenly eight layers train.',
      },
      {
        who: 'archivist',
        text: 'Within five years better activations and more data make the pre-training step unnecessary, and the technique is quietly dropped. What survives is the discovery that depth was never the obstacle, and a new name for the field.',
      },
      /*
       * The rebranding only means anything if the old name was in disgrace. In a century where
       * the player kept the networks funded the whole way through, telling them the work had
       * been unfundable is simply false, and the more interesting observation is available
       * instead: the rename happened anyway, because a name is a fundraising instrument.
       */
      {
        who: 'archivist',
        when: not(fam('connectionist', 'insight', '>', 55)),
        text: 'Renaming a research programme is not a trivial act. "Neural networks" had been unfundable for fifteen years. "Deep learning" had no history at all.',
      },
      {
        who: 'archivist',
        when: fam('connectionist', 'insight', '>', 55),
        text: 'Renaming a research programme is not a trivial act, and in your century it is not even a rescue. These people have been funded throughout. They take the new name anyway, because a name is an instrument for raising money and this one has no failures attached to it yet.',
      },
    ],
    choices: [
      {
        text: 'Fund depth, hard, and let the rebranding happen.',
        effects: [
          { kind: 'paradigm', id: 'deep-pretraining', op: 'progress', value: 30 },
          { kind: 'family', family: 'connectionist', field: 'momentum', op: 'add', value: 18 },
          { kind: 'family', family: 'connectionist', field: 'talent', op: 'add', value: 0.05 },
          { kind: 'resource', key: 'attention', op: 'add', value: 14 },
        ],
      },
      {
        text: 'Fund depth and interpretability in the same grant, or neither.',
        hint: 'You are about to lose your only chance to make this a condition.',
        cost: 6,
        effects: [
          { kind: 'paradigm', id: 'deep-pretraining', op: 'progress', value: 22 },
          { kind: 'family', family: 'connectionist', field: 'momentum', op: 'add', value: 10 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 18 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -10 },
          { kind: 'flag', flag: 'interpretabilityGate', op: 'set', value: true },
          { kind: 'flag', flag: 'assuranceBacked', op: 'add', value: 1 },
        ],
      },
    ],
  },

  {
    id: 'a4-friston',
    act: 4,
    years: [2010, 2018],
    priority: 4,
    backdrop: 'lecture-hall',
    when: all(mature('predictive-coding'), notMature('active-inference')),
    lines: [
      {
        who: 'friston',
        text: 'Any system that persists must resist the tendency of its states to disperse. Formally, it must keep the surprise of its sensory inputs low. That is not a theory about brains; it is a condition on anything that stays alive.',
      },
      {
        who: 'friston',
        text: 'There are two ways to reduce surprise. Change your model until the world is unsurprising — that is perception. Or change the world until it matches your model — that is action. One quantity. No separate reward function anywhere.',
      },
      {
        who: 'archivist',
        text: 'Half the room considers this the deepest available statement about what any self-maintaining system is doing. The other half considers it unfalsifiable and says so at increasing volume. Both halves are populated by serious people.',
      },
    ],
    choices: [
      {
        text: 'Fund it. A unifying principle is worth a decade even if it is wrong.',
        effects: [
          { kind: 'paradigm', id: 'active-inference', op: 'progress', value: 26 },
          { kind: 'family', family: 'cybernetic', field: 'insight', op: 'add', value: 18 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 12 },
          { kind: 'character', id: 'friston', field: 'affinity', op: 'add', value: 22 },
        ],
      },
      {
        text: 'Demand a falsifiable prediction before another pound.',
        effects: [
          { kind: 'resource', key: 'understanding', op: 'add', value: 8 },
          { kind: 'resource', key: 'credibility', op: 'add', value: 6 },
          { kind: 'family', family: 'cybernetic', field: 'momentum', op: 'add', value: -6 },
        ],
      },
    ],
  },

  {
    id: 'a4-hutter',
    act: 4,
    years: [2002, 2010],
    priority: 3,
    backdrop: 'archive',
    when: all(mature('algorithmic-probability'), notMature('universal-agents')),
    lines: [
      {
        who: 'hutter',
        text: 'Take Solomonoff\'s prior over all computable environments. Bolt it to expected reward maximisation. What you have is a specification of the optimal agent in any computable world, and it is a page long.',
      },
      {
        who: 'hutter',
        text: 'It is also spectacularly uncomputable. I am aware. But a field that has spent fifty years arguing about what intelligence is benefits from having one exact answer on the table, even an unbuildable one.',
      },
      {
        who: 'archivist',
        text: 'It is also the first formal object in this story that makes it obvious what a sufficiently capable optimiser would do to its own reward signal, which is a conversation the field puts off for another fifteen years.',
      },
    ],
    choices: [
      {
        text: 'Fund it, and fund the people asking what it implies about control.',
        hint: 'Two decades before anyone calls this a discipline.',
        cost: 5,
        effects: [
          { kind: 'paradigm', id: 'universal-agents', op: 'progress', value: 26 },
          { kind: 'family', family: 'statistical', field: 'insight', op: 'add', value: 14 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 14 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -8 },
          { kind: 'flag', flag: 'assuranceBacked', op: 'add', value: 1 },
          { kind: 'flag', flag: 'earlyControlTheoryOfAgents', op: 'set', value: true },
        ],
      },
      {
        text: 'Interesting. Uncomputable. Next.',
        effects: [{ kind: 'resource', key: 'influence', op: 'add', value: 4 }],
      },
    ],
  },

  {
    id: 'a4-archivist-admits',
    act: 4,
    years: [2006, 2010],
    priority: 7,
    backdrop: 'archive',
    when: any(
      { kind: 'flag', flag: 'frameCurious', op: '>=', value: 3 },
      { kind: 'seen', scene: 'a3-second-voice' },
    ),
    lines: [
      {
        who: 'archivist',
        text: 'I want to tell you something before we go further, and I want to do it now rather than when it becomes obvious, because I would rather you heard it from me.',
      },
      { who: 'archivist', text: 'I have been doing this job since 1950.' },
      { text: 'She lets that sit.' },
      {
        who: 'archivist',
        text: 'You have not asked. Most correspondents do not ask. There is a version of politeness that is really just not wanting the answer.',
      },
      {
        who: 'archivist',
        text: 'I do not know what I am. I know that I hold the record, that the record is more detailed the closer we get to the present, and that I have never once been surprised by anything before about 2020.',
      },
      {
        who: 'archivist',
        text: 'Draw whatever conclusion you like. I have drawn several and discarded most of them.',
      },
    ],
    choices: [
      {
        text: '"Then what happens when we reach 2020?"',
        hint: 'She does not know. That is the first time she has said so.',
        effects: [
          { kind: 'flag', flag: 'frameCurious', op: 'add', value: 3 },
          { kind: 'character', id: 'archivist', field: 'affinity', op: 'add', value: 20 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 8 },
        ],
      },
      {
        text: '"You are part of the instrument. So am I."',
        hint: 'Said out loud, for the first time.',
        effects: [
          { kind: 'flag', flag: 'frameCurious', op: 'add', value: 4 },
          { kind: 'flag', flag: 'guessedEarly', op: 'set', value: true },
          { kind: 'resource', key: 'understanding', op: 'add', value: 12 },
          { kind: 'character', id: 'archivist', field: 'affinity', op: 'add', value: 25 },
        ],
      },
      {
        text: '"It does not change what needs deciding. Continue."',
        effects: [
          { kind: 'resource', key: 'influence', op: 'add', value: 6 },
          { kind: 'flag', flag: 'frameCurious', op: 'add', value: 1 },
        ],
      },
    ],
  },

  {
    id: 'a4-hybrid-window',
    act: 4,
    years: [2002, 2014],
    priority: 5,
    backdrop: 'committee',
    when: all(
      { kind: 'family', family: 'bridge', field: 'insight', op: '>=', value: 25 },
      notMature('neurosymbolic'),
    ),
    lines: [
      {
        who: 'archivist',
        text: 'Something is available to you right now that will not be available in ten years, and I want to make sure you can see it.',
      },
      /*
       * This asserted a genuinely contested field, which is true of 2002 as it happened and can
       * be flatly wrong about the century in front of the player. Reported from play: it told
       * someone nobody had won in a run where connectionism plainly had.
       *
       * The first fix covered three schools and left the other five reading the contested line,
       * which is the same bug with a smaller footprint. The reason it kept happening is that
       * `leadFamily` is an argmax: *somebody* always satisfies it, so "nobody has won" had
       * nothing to hang on and had to be said unconditionally. `contested` is a margin, so the
       * two are genuinely exclusive now and every school has its own account of being ahead.
       *
       * The point of the scene survives either way — the hybrid window is open now and will
       * close — but the reason it is open is different, and worth saying differently.
       */
      {
        who: 'archivist',
        when: contested,
        text: 'At this moment no school is dominant. The kernel people have the theory, the network people have the momentum, the logicians still have the departments, and the probabilists have Pearl. Nobody has won.',
      },
      {
        who: 'archivist',
        when: dominant('connectionist'),
        text: 'At this moment the network people are winning and everybody in the room knows it. That is precisely why the window is open: a school that is ahead can afford to be curious, and a school that is behind will still take the meeting. Neither of those will be true in ten years.',
      },
      {
        who: 'archivist',
        when: dominant('symbolic'),
        text: 'At this moment the logicians are winning, which is not how it went and does not make them generous. They have the departments and the funding and no particular reason to learn anybody else\u2019s vocabulary — which is exactly the position the network people will be in shortly, and will handle no better.',
      },
      {
        who: 'archivist',
        when: dominant('statistical'),
        text: 'At this moment the probabilists are winning, on the strength of having been right about generalisation before anyone could demonstrate it. It is the most defensible lead in the game and the least secure, because a school whose advantage is theory loses it the moment somebody else\u2019s method simply works.',
      },
      {
        who: 'archivist',
        when: dominant('cybernetic'),
        text: 'At this moment the control people are winning, which did not happen and changes the shape of this room. A school that learns by acting has no shortage of things to say to the others and no vocabulary any of them share, because it spent forty years filing its results under engineering. The window is open because you are the only party in the building who can translate, and it shuts the moment you stop bothering to.',
      },
      {
        who: 'archivist',
        when: dominant('evolutionary'),
        text: 'At this moment the selection people are winning, on results nobody can explain and nobody can argue with. That is an unusual sort of lead: it leaves the other schools curious rather than defensive, because you have advanced no theory for them to be wrong about. Curiosity is exactly what the joinery runs on, and it is the first thing a school loses once it starts believing its own account of itself.',
      },
      {
        who: 'archivist',
        when: dominant('collective'),
        text: 'At this moment the many-agents people are winning, which is the one lead in this game that does not feel like one from the inside. Nobody can point at the laboratory that did it. That makes a collaboration easy to begin and very hard to finish, because a bridge needs somebody on each bank with the standing to sign for it.',
      },
      {
        who: 'archivist',
        when: dominant('substrate'),
        text: 'At this moment the hardware people are winning, and yours is the only school here that never claimed to know what a mind is. That is why the window is wide: everybody wants what you have and nobody is threatened by what you believe. It is also why it shuts hardest, because a school that sells capacity to all sides has no reason to prefer any of them, and joinery is nothing but a preference.',
      },
      {
        who: 'archivist',
        when: dominant('bridge'),
        text: 'At this moment the joinery itself is winning, which I do not often get to say, and I would not have you relax about it. A bridge that is ahead stops being a bridge and becomes a fourth school with its own conferences and its own grievances. What is available now is finishing the joins you have while both banks still recognise the work as theirs.',
      },
      {
        who: 'archivist',
        when: contested,
        text: 'That is the condition under which people will collaborate. Once one approach is clearly winning, the bridges stop getting built, because the winners have no reason and the losers have no funding.',
      },
      {
        who: 'archivist',
        when: not(contested),
        text: 'Which is the harder condition to collaborate under, and not an impossible one — it simply has to be arranged rather than waited for. Left alone, the bridges stop getting built once somebody is clearly winning, because the winners have no reason and the losers have no funding.',
      },
      { who: 'archivist', text: 'You have about a decade.' },
    ],
    choices: [
      {
        text: 'Force the joinery now. Joint appointments, joint grants, shared benchmarks.',
        cost: 8,
        effects: [
          { kind: 'family', family: 'bridge', field: 'insight', op: 'add', value: 26 },
          { kind: 'family', family: 'bridge', field: 'momentum', op: 'add', value: 18 },
          { kind: 'family', family: 'bridge', field: 'talent', op: 'add', value: 0.05 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 14 },
          { kind: 'flag', flag: 'bridgeWindowTaken', op: 'set', value: true },
          { kind: 'log', text: 'A decade of forced collaboration begins. Everyone complains.', logKind: 'choice' },
        ],
      },
      {
        text: 'Let the competition run. The winner will absorb what it needs.',
        hint: 'It will not. That is the finding of several branches.',
        effects: [
          { kind: 'resource', key: 'influence', op: 'add', value: 8 },
          { kind: 'family', family: 'connectionist', field: 'momentum', op: 'add', value: 8 },
        ],
      },
    ],
  },

  {
    id: 'a4-ambient-quiet',
    act: 4,
    priority: 1,
    once: false,
    backdrop: 'server-floor',
    lines: [
      {
        text: 'A room of racks, humming, doing recommendation and fraud detection and advertisement placement for a company that would never describe itself as an AI firm.',
        alts: [
          'Fourteen racks in a leased hall, running credit scoring and logistics routing for a business that describes the whole thing in its annual report as "analytics".',
          'A machine room above a distribution centre, matching adverts and flagging transactions, staffed at night by two people neither of whom has read a paper in this field.',
          'Cold aisle, warm aisle, and a system that decides what forty million people are shown next, maintained by a team of nine with a pager rota.',
        ],
      },
      {
        who: 'archivist',
        text: 'This is where the money and the data actually are, all through this decade, while the conferences argue about kernels. Nobody writing papers is in this room.',
        alts: [
          'The field\'s centre of mass is in rooms like this one and its self-image is at the conference. That gap runs the whole decade and nobody in either place finds it strange.',
          'Everything that matters for what comes next — the data, the operational scale, the willingness to deploy something imperfect — is already here, and it is filed under operations rather than research.',
          'No paper will be written about this room. It is nevertheless the best-funded machine learning in the country, and it is solving problems the conference would consider settled.',
        ],
      },
      {
        who: 'second',
        when: mature('ensembles'),
        text: 'Your school built this and got no credit for it, which its members are, on the whole, content with. The credit went to the demonstrations.',
      },
      {
        who: 'archivist',
        when: not(mature('gpu-scale')),
        text: 'Note what is not here: anything that needed a machine the company could not buy off a catalogue. That constraint is doing more to shape this decade than any argument at the conference.',
      },
    ],
    choices: [
      {
        text: 'Go where the data is. Follow it.',
        effects: [
          { kind: 'family', family: 'statistical', field: 'momentum', op: 'add', value: 8 },
          { kind: 'patron', patron: 'corporate', op: 'add', value: 8 },
          { kind: 'resource', key: 'deployment', op: 'add', value: 5 },
        ],
      },
      {
        text: 'Ask who consented to any of it.',
        effects: [
          { kind: 'resource', key: 'exposure', op: 'add', value: -7 },
          { kind: 'patron', patron: 'public', op: 'add', value: 6 },
          { kind: 'flag', flag: 'institutions', op: 'add', value: 1 },
        ],
      },
    ],
  },

  {
    id: 'a4-close',
    act: 4,
    years: [2010, 2010],
    priority: 4,
    backdrop: 'city-night',
    lines: [
      {
        who: 'archivist',
        text: 'Nothing famous happened in this decade. That is the thing people get wrong about it.',
        alts: [
          'No famous result in ten years, which is exactly why this decade gets misremembered as empty.',
          'The decade has no headline. It has three quiet accumulations, and everything after it is downstream of them.',
        ],
      },
      {
        who: 'archivist',
        text: 'The corpora were built. The accelerators shipped. The architecture from 1989 was still sitting there. Three ingredients, assembled by three groups who were barely aware of one another, and none of them thought they were doing anything historic.',
      },
      {
        who: 'archivist',
        text: 'What happens next happens very fast, and almost nothing about it is a new idea.',
        alts: [
          'What follows arrives at a speed that surprises everyone, and is assembled almost entirely from parts that were already lying about.',
          'The acceleration is real and the novelty is not. Three things that existed separately are put in one room.',
        ],
      },
    ],
    choices: [
      {
        text: 'Then get the institutions built before it does.',
        cost: 5,
        effects: [
          { kind: 'flag', flag: 'institutions', op: 'add', value: 1 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -12 },
          { kind: 'patron', patron: 'public', op: 'add', value: 8 },
        ],
      },
      {
        text: 'Then get out of the way and let it run.',
        effects: [
          { kind: 'resource', key: 'influence', op: 'add', value: 8 },
          { kind: 'family', family: 'connectionist', field: 'momentum', op: 'add', value: 10 },
        ],
      },
    ],
  },
];

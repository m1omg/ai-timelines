import { all, any, flagSet, mature, notMature } from '../../engine/conditions';
import type { Scene } from '../../engine/types';

/**
 * ACT III — 1982-1994. The Rule and the Weight.
 *
 * The most crowded act in the century: physicists arrive, the expert-systems market inflates
 * and detonates, backpropagation returns, Bayes arrives with a proof, and six other schools
 * quietly do their best work while nobody is looking at them.
 */
export const ACT3: Scene[] = [
  {
    id: 'a3-hopfield',
    act: 3,
    years: [1982, 1990],
    priority: 7,
    backdrop: 'lecture-hall',
    when: notMature('hopfield-nets'),
    lines: [
      {
        who: 'hopfield',
        text: 'Take a network with symmetric connections. Define an energy. Then every update the network makes lowers that energy, so the dynamics must terminate, and it terminates in a local minimum.',
      },
      {
        who: 'hopfield',
        text: 'Which means the stable states are memories, and recall is relaxation. You present a corrupted pattern and the system falls into the nearest valley. Content-addressable memory with no address.',
      },
      {
        who: 'archivist',
        text: 'What matters here is not the model. It is the audience. A physicist has said "spin glass" in a room about neural networks, and within three years there are several hundred statistical physicists in this field who were not in it before.',
      },
      {
        who: 'archivist',
        text: 'Connectionism does not come back because someone won the 1969 argument. It comes back because a different discipline walked in with tools.',
      },
    ],
    choices: [
      {
        text: 'Fund the physicists. New tools beat new arguments.',
        effects: [
          { kind: 'paradigm', id: 'hopfield-nets', op: 'progress', value: 26 },
          { kind: 'family', family: 'connectionist', field: 'momentum', op: 'add', value: 16 },
          { kind: 'family', family: 'connectionist', field: 'talent', op: 'add', value: 0.04 },
          { kind: 'character', id: 'hopfield', field: 'affinity', op: 'add', value: 22 },
        ],
      },
      {
        text: 'Fund the stochastic version. Noise gets you out of shallow valleys.',
        effects: [
          { kind: 'paradigm', id: 'hopfield-nets', op: 'progress', value: 16 },
          { kind: 'family', family: 'connectionist', field: 'insight', op: 'add', value: 12 },
          { kind: 'family', family: 'statistical', field: 'insight', op: 'add', value: 8 },
          { kind: 'flag', flag: 'earlyBoltzmann', op: 'set', value: true },
        ],
      },
    ],
  },

  {
    id: 'a3-cyc',
    act: 3,
    years: [1982, 1994],
    priority: 6,
    backdrop: 'terminal-room',
    when: all(mature('expert-systems'), notMature('knowledge-engineering')),
    lines: [
      {
        who: 'lenat',
        text: 'Every expert system we have built is brittle in the same way, and it is not a bug in any of them. They fail at the edges because they have no idea that water is wet, that people die once, that a thing cannot be in two places.',
      },
      {
        who: 'lenat',
        text: 'So I am going to enter it. All of it. Not learn it — enter it, by hand, with a team, for as long as it takes. My estimate is a few million assertions and about a decade.',
      },
      {
        who: 'archivist',
        text: 'His estimate of the effort is roughly right and his estimate of the timeline is out by a factor of four, which for this field counts as unusually disciplined forecasting.',
      },
      {
        who: 'archivist',
        text: 'It is the largest and most sustained bet anyone ever places on the proposition that a mind is a formal system. It never conclusively succeeds and it never conclusively fails, and that ambiguity is itself the most interesting result.',
      },
    ],
    choices: [
      {
        text: 'Fund it for twenty years and do not ask for annual demonstrations.',
        hint: 'Patient capital. Almost nobody in this century gets any.',
        cost: 6,
        effects: [
          { kind: 'paradigm', id: 'knowledge-engineering', op: 'progress', value: 32 },
          { kind: 'family', family: 'symbolic', field: 'insight', op: 'add', value: 18 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 10 },
          { kind: 'character', id: 'lenat', field: 'affinity', op: 'add', value: 30 },
          { kind: 'flag', flag: 'patientCapital', op: 'add', value: 1 },
        ],
      },
      {
        text: 'Fund it on normal terms. Deliverables every eighteen months.',
        hint: 'Which will distort the work into a series of demonstrations.',
        effects: [
          { kind: 'paradigm', id: 'knowledge-engineering', op: 'progress', value: 16 },
          { kind: 'resource', key: 'attention', op: 'add', value: 8 },
          { kind: 'family', family: 'symbolic', field: 'momentum', op: 'add', value: 6 },
        ],
      },
      {
        text: 'No. Hand-entering common sense cannot scale and everyone knows it.',
        effects: [
          { kind: 'family', family: 'symbolic', field: 'momentum', op: 'add', value: -10 },
          { kind: 'resource', key: 'influence', op: 'add', value: 5 },
          { kind: 'character', id: 'lenat', field: 'affinity', op: 'add', value: -20 },
        ],
      },
    ],
  },

  {
    id: 'a3-pearl',
    act: 3,
    years: [1986, 1994],
    priority: 8,
    backdrop: 'lecture-hall',
    when: notMature('bayes-nets'),
    lines: [
      {
        who: 'pearl',
        text: 'Your expert systems handle uncertainty with numbers called certainty factors. I would like to know what they mean. Not informally — what do they denote, and under what conditions do they compose correctly?',
      },
      {
        who: 'pearl',
        text: 'The answer is that they do not compose correctly, and the reason nobody noticed is that the systems were small. Probability composes correctly. It has always composed correctly. The objection was that it was intractable.',
      },
      {
        who: 'pearl',
        text: 'And it is not intractable if you write down which variables are conditionally independent of which. The graph is the knowledge. Once you have the graph, inference is local message-passing.',
      },
      {
        who: 'archivist',
        text: 'This is the moment the field acquires a mathematics for uncertainty that it can defend in front of a statistician. It changes medicine, genetics and fault diagnosis inside a decade, and it does it without a single press conference.',
      },
    ],
    choices: [
      {
        text: 'Make it the field\'s standard for uncertainty. All of it.',
        effects: [
          { kind: 'paradigm', id: 'bayes-nets', op: 'progress', value: 30 },
          { kind: 'family', family: 'statistical', field: 'momentum', op: 'add', value: 18 },
          { kind: 'family', family: 'statistical', field: 'insight', op: 'add', value: 16 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 14 },
          { kind: 'character', id: 'pearl', field: 'affinity', op: 'add', value: 25 },
          { kind: 'flag', flag: 'probabilisticTurn', op: 'set', value: true },
        ],
      },
      {
        text: 'Adopt it where it is cheap. The expert systems are shipping now.',
        effects: [
          { kind: 'paradigm', id: 'bayes-nets', op: 'progress', value: 14 },
          { kind: 'patron', patron: 'corporate', op: 'add', value: 8 },
          { kind: 'resource', key: 'deployment', op: 'add', value: 6 },
        ],
      },
      {
        text: 'Push him further: ask what would let a machine reason about causes.',
        hint: 'You will not get an answer for fifteen years. It is worth the wait.',
        cost: 5,
        effects: [
          { kind: 'paradigm', id: 'bayes-nets', op: 'progress', value: 20 },
          { kind: 'family', family: 'statistical', field: 'insight', op: 'add', value: 20 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 12 },
          { kind: 'flag', flag: 'causalEarly', op: 'set', value: true },
          { kind: 'character', id: 'pearl', field: 'affinity', op: 'add', value: 30 },
        ],
      },
    ],
  },

  {
    id: 'a3-backprop',
    act: 3,
    years: [1986, 1994],
    pinned: true,
    priority: 9,
    backdrop: 'terminal-room',
    title: 'Credit, Assigned',
    when: notMature('backprop'),
    lines: [
      {
        text: 'Two volumes in a blue cover. Chapter eight contains four pages of the chain rule applied in reverse.',
      },
      {
        who: 'rumelhart',
        text: 'The objection since 1969 has been that there is no learning procedure for the hidden units. There is. You propagate the error backwards and each unit gets a share of the blame proportional to its contribution.',
      },
      {
        who: 'hinton',
        text: 'What comes out are representations nobody designed. Train it on family trees and the hidden units organise themselves into nationality and generation, which nobody put there and nobody asked for. That is the result. Not the algorithm — the fact that useful structure appears on its own.',
      },
      {
        who: 'archivist',
        text: 'The method is in a doctoral thesis from 1974, and a Finnish master\'s thesis from 1970, and in control theory before that. Priority in this field is a very poor guide to influence. What matters is who says it to an audience that is ready.',
      },
      { who: 'archivist', text: 'This audience is ready. There are thirty thousand people at the neural network conference within four years.' },
    ],
    choices: [
      {
        text: 'Everything into connectionism. The argument is over.',
        hint: 'It is not over. It is 1986 and the hardware is thirty years short.',
        effects: [
          { kind: 'paradigm', id: 'backprop', op: 'progress', value: 34 },
          { kind: 'family', family: 'connectionist', field: 'momentum', op: 'add', value: 24 },
          { kind: 'family', family: 'connectionist', field: 'talent', op: 'add', value: 0.07 },
          { kind: 'resource', key: 'attention', op: 'add', value: 24 },
          { kind: 'flag', flag: 'connectionistRush', op: 'set', value: true },
        ],
      },
      {
        text: 'Fund it properly and say publicly that the machines are not ready.',
        hint: 'True, unpopular, and it is what stops the second bandwagon.',
        effects: [
          { kind: 'paradigm', id: 'backprop', op: 'progress', value: 26 },
          { kind: 'family', family: 'connectionist', field: 'momentum', op: 'add', value: 12 },
          { kind: 'family', family: 'substrate', field: 'momentum', op: 'add', value: 12 },
          { kind: 'resource', key: 'credibility', op: 'add', value: 10 },
          { kind: 'resource', key: 'attention', op: 'add', value: 6 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 8 },
        ],
      },
      {
        text: 'Fund it alongside the symbolic work and force them to interoperate.',
        hint: 'Both camps object. The bridge column opens thirty years early.',
        cost: 6,
        effects: [
          { kind: 'paradigm', id: 'backprop', op: 'progress', value: 22 },
          { kind: 'family', family: 'bridge', field: 'insight', op: 'add', value: 20 },
          { kind: 'family', family: 'bridge', field: 'momentum', op: 'add', value: 14 },
          { kind: 'family', family: 'connectionist', field: 'momentum', op: 'add', value: 8 },
          { kind: 'flag', flag: 'earlyBridge', op: 'set', value: true },
        ],
      },
    ],
  },

  {
    id: 'a3-brooks',
    act: 3,
    years: [1986, 1994],
    priority: 7,
    backdrop: 'workshop',
    when: notMature('subsumption'),
    lines: [
      {
        text: 'A six-legged machine walks across a floor strewn with cable and books. It has no map, no plan, and no representation of anything.',
      },
      {
        who: 'brooks',
        text: 'There is no central model. There are layers. The bottom layer avoids obstacles. The next wanders. The next explores. Higher layers suppress the outputs of lower ones when they have something to say, and that is the entire architecture.',
      },
      {
        who: 'brooks',
        text: 'The world is its own best model. It is always exactly up to date and it contains every detail there is. The mistake was ever trying to keep a copy of it inside the machine.',
      },
      {
        who: 'brooks',
        text: 'Evolution spent three billion years on locomotion and perception and about half a million on abstract reasoning. We have inverted that budget completely and then been surprised when the easy part turned out to be hard.',
      },
      {
        who: 'archivist',
        text: 'Within fifteen years there are millions of these things in domestic use, vacuuming. It is by an enormous margin the most widely deployed AI of the twentieth century and almost nobody counts it.',
      },
    ],
    choices: [
      {
        text: 'Back it hard. Competence in the world beats competence on paper.',
        effects: [
          { kind: 'paradigm', id: 'subsumption', op: 'progress', value: 28 },
          { kind: 'family', family: 'cybernetic', field: 'momentum', op: 'add', value: 18 },
          { kind: 'family', family: 'cybernetic', field: 'insight', op: 'add', value: 12 },
          { kind: 'character', id: 'brooks', field: 'affinity', op: 'add', value: 25 },
          { kind: 'resource', key: 'deployment', op: 'add', value: 6 },
        ],
      },
      {
        text: 'Point out that insects do not do algebra, and fund both.',
        cost: 4,
        effects: [
          { kind: 'paradigm', id: 'subsumption', op: 'progress', value: 18 },
          { kind: 'family', family: 'cybernetic', field: 'insight', op: 'add', value: 10 },
          { kind: 'family', family: 'bridge', field: 'insight', op: 'add', value: 10 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 6 },
        ],
      },
      {
        text: 'It is robotics. It is not a theory of mind.',
        effects: [
          { kind: 'family', family: 'cybernetic', field: 'momentum', op: 'add', value: -10 },
          { kind: 'resource', key: 'influence', op: 'add', value: 5 },
          { kind: 'character', id: 'brooks', field: 'affinity', op: 'add', value: -15 },
        ],
      },
    ],
  },

  {
    id: 'a3-expert-crash',
    act: 3,
    years: [1986, 1994],
    pinned: true,
    priority: 9,
    backdrop: 'committee',
    title: 'The Market Discovers Maintenance',
    when: any(flagSet('expertBoom'), mature('expert-systems')),
    lines: [
      {
        text: 'The specialist workstation industry that grew up around rule engines is worth several hundred million dollars. It is about to be worth considerably less than that.',
      },
      {
        who: 'archivist',
        text: 'Nothing technical fails. The systems that worked continue to work. What happens is that general-purpose machines get fast enough to run the same software, and the specialist hardware has no reason to exist, and the companies built on it evaporate in about eighteen months.',
      },
      {
        who: 'archivist',
        text: 'Underneath that there is a second problem that does not make the newspapers. A rule base of four thousand rules cannot be maintained. Every new rule interacts with every old one, nobody who wrote the first thousand still works here, and the cost of a change grows faster than the value of the system.',
      },
      {
        who: 'archivist',
        text: 'That is the real lesson and it is almost never the one drawn. The one drawn is "AI does not work", again, for the second time in fifteen years.',
      },
    ],
    choices: [
      {
        text: 'Say the true thing: it is a maintenance problem, not a capability problem.',
        hint: 'Preserves the knowledge, loses the market.',
        effects: [
          { kind: 'resource', key: 'credibility', op: 'add', value: 12 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 10 },
          { kind: 'family', family: 'symbolic', field: 'insight', op: 'add', value: 8 },
          { kind: 'flag', flag: 'diagnosedCorrectly', op: 'set', value: true },
        ],
      },
      {
        text: 'Move everyone into machine learning. Let the rules be induced.',
        effects: [
          { kind: 'family', family: 'statistical', field: 'momentum', op: 'add', value: 16 },
          { kind: 'family', family: 'symbolic', field: 'momentum', op: 'add', value: -14 },
          { kind: 'family', family: 'statistical', field: 'talent', op: 'add', value: 0.05 },
        ],
      },
      {
        text: 'Rename everything. Nobody funds "AI"; everybody funds "decision support".',
        hint: 'It is cynical and it works and the field does exactly this.',
        effects: [
          { kind: 'resource', key: 'attention', op: 'add', value: -14 },
          { kind: 'resource', key: 'credibility', op: 'add', value: 6 },
          { kind: 'patron', patron: 'corporate', op: 'add', value: 12 },
          { kind: 'flag', flag: 'renamed', op: 'set', value: true },
          { kind: 'log', text: 'The word "intelligence" quietly disappears from every grant application.', logKind: 'choice' },
        ],
      },
    ],
  },

  {
    id: 'a3-mead',
    act: 3,
    years: [1986, 1994],
    priority: 6,
    backdrop: 'cleanroom',
    when: notMature('neuromorphic-vlsi'),
    lines: [
      {
        who: 'mead',
        text: 'A transistor operated below threshold has an exponential relationship between voltage and current. So does the ion channel in a nerve membrane. This is not an analogy I am making for rhetorical effect; it is the same equation.',
      },
      {
        who: 'mead',
        text: 'Which means you can build a retina rather than simulate one. Adaptation, local gain control, edge enhancement — all of it falling out of the device physics, in real time, on microwatts.',
      },
      {
        who: 'mead',
        text: 'The digital people spend most of their power budget forcing a continuous physical world into discrete symbols so they can pretend it is not physical. I would like to stop doing that.',
      },
      {
        who: 'archivist',
        text: 'The obstacle is not the idea. It is that no two chips come out the same, which is precisely how biology works and precisely what the entire discipline of digital engineering exists to prevent.',
      },
    ],
    choices: [
      {
        text: 'Fund the substrate. Everything else is downstream of it.',
        effects: [
          { kind: 'paradigm', id: 'neuromorphic-vlsi', op: 'progress', value: 28 },
          { kind: 'family', family: 'substrate', field: 'insight', op: 'add', value: 16 },
          { kind: 'family', family: 'substrate', field: 'momentum', op: 'add', value: 14 },
          { kind: 'compute', op: 'add', value: 0.2 },
          { kind: 'character', id: 'mead', field: 'affinity', op: 'add', value: 25 },
        ],
      },
      {
        text: 'Fund the digital accelerators instead. Repeatability wins.',
        effects: [
          { kind: 'paradigm', id: 'massively-parallel', op: 'progress', value: 22 },
          { kind: 'compute', op: 'add', value: 0.28 },
          { kind: 'family', family: 'substrate', field: 'momentum', op: 'add', value: 10 },
        ],
      },
    ],
  },

  {
    id: 'a3-lecun-cheques',
    act: 3,
    years: [1990, 1998],
    priority: 6,
    backdrop: 'machine-room',
    when: all(mature('backprop'), notMature('convnet')),
    lines: [
      {
        who: 'lecun',
        text: 'A digit can appear anywhere in the field of view, so do not learn a separate detector for every position. Share the weights. Local receptive fields, shared across the image, then pool.',
      },
      {
        who: 'lecun',
        text: 'The parameter count drops by two orders of magnitude and the thing becomes trainable on hardware that exists. It is running on cheques now. A significant fraction of the cheques in this country pass through it.',
      },
      {
        who: 'archivist',
        text: 'And through the whole of the 1990s the field considers neural networks a dead end, while one of them silently reads the American banking system\'s paper. Deployment and prestige have almost nothing to do with each other in this century.',
      },
    ],
    choices: [
      {
        text: 'Push the architectural priors. Structure is worth more than scale right now.',
        hint: 'It is. For about twenty more years.',
        effects: [
          { kind: 'paradigm', id: 'convnet', op: 'progress', value: 28 },
          { kind: 'family', family: 'connectionist', field: 'insight', op: 'add', value: 14 },
          { kind: 'resource', key: 'deployment', op: 'add', value: 8 },
          { kind: 'character', id: 'lecun', field: 'affinity', op: 'add', value: 22 },
        ],
      },
      {
        text: 'Ask what it would take to drop the priors and just use more data.',
        hint: 'The answer is about ten thousand times the compute.',
        effects: [
          { kind: 'family', family: 'substrate', field: 'momentum', op: 'add', value: 12 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 6 },
          { kind: 'flag', flag: 'sawScalingEarly', op: 'set', value: true },
        ],
      },
    ],
  },

  {
    id: 'a3-hillis',
    act: 3,
    years: [1986, 1994],
    priority: 5,
    backdrop: 'machine-room',
    when: notMature('coevolution'),
    lines: [
      {
        who: 'hillis',
        text: 'I evolved sorting networks and hit a plateau at sixty-five comparators. So I stopped fixing the test cases and let them evolve too, against the sorters, as parasites.',
      },
      {
        who: 'hillis',
        text: 'The plateau vanished. When the sorters got good the tests got harder, and when the tests got harder the sorters got good. Sixty-one comparators — four better than my own best without them, and one off the best network anybody has ever designed by hand.',
      },
      {
        who: 'hillis',
        text: 'A fixed fitness function is a ceiling you build yourself. An opponent that improves as you do never lets you stop.',
      },
      { who: 'archivist', text: 'Every self-play system for the next sixty years is running this idea. Most of them do not know it.' },
    ],
    choices: [
      {
        text: 'Coevolution is the general principle. Fund it across schools.',
        effects: [
          { kind: 'paradigm', id: 'coevolution', op: 'progress', value: 26 },
          { kind: 'family', family: 'evolutionary', field: 'insight', op: 'add', value: 14 },
          { kind: 'family', family: 'cybernetic', field: 'insight', op: 'add', value: 8 },
          { kind: 'character', id: 'hillis', field: 'affinity', op: 'add', value: 22 },
        ],
      },
      {
        text: 'Fund the machine, not the experiment. Sixty-five thousand processors is the story.',
        effects: [
          { kind: 'paradigm', id: 'massively-parallel', op: 'progress', value: 26 },
          { kind: 'family', family: 'substrate', field: 'insight', op: 'add', value: 12 },
          { kind: 'compute', op: 'add', value: 0.22 },
        ],
      },
    ],
  },

  {
    id: 'a3-fuzzy-vindicated',
    act: 3,
    years: [1986, 1994],
    priority: 5,
    backdrop: 'city-night',
    when: mature('fuzzy-logic'),
    lines: [
      {
        text: 'A subway train in northern Japan brakes so smoothly that standing passengers do not shift their weight. The controller has about a hundred rules and none of them are true or false.',
      },
      {
        who: 'zadeh',
        text: 'I am told there are now several hundred consumer products using this. Cameras that decide what you are pointing at. Rice cookers. An entire industrial sector, built on a mathematics that my own country\'s statisticians described as, I believe the word was, pernicious.',
      },
      {
        who: 'archivist',
        text: 'A useful reminder that a paradigm does not win arguments. It finds an application, an industry, and a customer, and the arguments become retrospective.',
      },
    ],
    choices: [
      {
        text: 'Import it. Whatever ships, ships.',
        effects: [
          { kind: 'paradigm', id: 'fuzzy-control', op: 'progress', value: 26 },
          { kind: 'family', family: 'bridge', field: 'momentum', op: 'add', value: 14 },
          { kind: 'resource', key: 'deployment', op: 'add', value: 12 },
          { kind: 'patron', patron: 'corporate', op: 'add', value: 10 },
        ],
      },
      {
        text: 'Fund the hybrid: learn the rules, keep them readable.',
        cost: 5,
        effects: [
          { kind: 'paradigm', id: 'fuzzy-control', op: 'progress', value: 18 },
          { kind: 'family', family: 'bridge', field: 'insight', op: 'add', value: 18 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 10 },
          { kind: 'flag', flag: 'neuroFuzzyEarly', op: 'set', value: true },
        ],
      },
    ],
  },

  {
    id: 'a3-dorigo-koza',
    act: 3,
    years: [1990, 1998],
    priority: 4,
    backdrop: 'terminal-room',
    lines: [
      {
        who: 'dorigo',
        text: 'An ant lays pheromone as it walks and prefers stronger trails. A short route gets traversed more often in the same time, so it accumulates more pheromone, so it gets preferred. That is the whole algorithm.',
      },
      {
        who: 'dorigo',
        text: 'Evaporation is the important part. Without forgetting, the colony locks onto the first solution it finds. The forgetting is what makes it able to re-plan when the world changes underneath it.',
      },
      {
        who: 'koza',
        text: 'And I have been evolving programs rather than parameters. Expression trees, crossover swapping subtrees. It rediscovered a patented filter circuit last month. I am proposing "human-competitive" as a formal standard.',
      },
      {
        who: 'archivist',
        text: 'Both of these are excellent and both are filed under optimisation, which is where this field has put every method it did not want to argue with.',
      },
    ],
    choices: [
      {
        text: 'Fund the swarm work. Telecoms will pay for adaptive routing.',
        effects: [
          { kind: 'paradigm', id: 'ant-colony', op: 'progress', value: 24 },
          { kind: 'family', family: 'collective', field: 'momentum', op: 'add', value: 14 },
          { kind: 'patron', patron: 'corporate', op: 'add', value: 8 },
          { kind: 'character', id: 'dorigo', field: 'affinity', op: 'add', value: 20 },
        ],
      },
      {
        text: 'Fund the programme evolution. An evolved program can be read.',
        effects: [
          { kind: 'paradigm', id: 'genetic-programming', op: 'progress', value: 24 },
          { kind: 'family', family: 'evolutionary', field: 'insight', op: 'add', value: 14 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 8 },
          { kind: 'character', id: 'koza', field: 'affinity', op: 'add', value: 20 },
        ],
      },
      {
        text: 'Fund both at half strength.',
        cost: 5,
        effects: [
          { kind: 'paradigm', id: 'ant-colony', op: 'progress', value: 13 },
          { kind: 'paradigm', id: 'genetic-programming', op: 'progress', value: 13 },
          { kind: 'family', family: 'collective', field: 'insight', op: 'add', value: 7 },
          { kind: 'family', family: 'evolutionary', field: 'insight', op: 'add', value: 7 },
        ],
      },
    ],
  },

  {
    id: 'a3-sutton',
    act: 3,
    years: [1986, 1994],
    priority: 6,
    backdrop: 'terminal-room',
    when: notMature('temporal-difference'),
    lines: [
      {
        who: 'sutton',
        text: 'Supervised learning needs someone to say what the right answer was. In most of life nobody says. There is a stream of experience and occasionally something good or bad happens, a long time after whatever caused it.',
      },
      {
        who: 'sutton',
        text: 'So do not wait for the outcome. Learn from the difference between what you predicted a moment ago and what you predict now. The later prediction is better informed, so treat it as the target for the earlier one.',
      },
      {
        who: 'sutton',
        text: 'It is online, it needs no model, and it converges. Samuel had most of it in 1959 and nobody built on it for thirty years.',
      },
      {
        who: 'archivist',
        text: 'Ten years after this, neuroscientists recording from midbrain dopamine neurons find they are firing in proportion to exactly this quantity. It is the closest thing this field has to a discovery about the actual brain.',
      },
    ],
    choices: [
      {
        text: 'Back reinforcement learning as a first-class school.',
        effects: [
          { kind: 'paradigm', id: 'temporal-difference', op: 'progress', value: 28 },
          { kind: 'family', family: 'cybernetic', field: 'insight', op: 'add', value: 16 },
          { kind: 'family', family: 'cybernetic', field: 'momentum', op: 'add', value: 14 },
          { kind: 'character', id: 'sutton', field: 'affinity', op: 'add', value: 25 },
        ],
      },
      {
        text: 'Fund the neuroscience collaboration. Check it against real brains.',
        cost: 4,
        effects: [
          { kind: 'paradigm', id: 'temporal-difference', op: 'progress', value: 18 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 16 },
          { kind: 'family', family: 'cybernetic', field: 'insight', op: 'add', value: 10 },
          { kind: 'flag', flag: 'neuroLink', op: 'set', value: true },
        ],
      },
    ],
  },

  {
    id: 'a3-kanerva',
    act: 3,
    years: [1990, 1998],
    priority: 3,
    backdrop: 'archive',
    when: notMature('sparse-distributed-memory'),
    lines: [
      {
        who: 'kanerva',
        text: 'In ten thousand dimensions, two random points are almost always almost exactly the same distance apart. Almost everything is nearly orthogonal to almost everything else. Your intuitions from three dimensions are not merely inaccurate here, they are inverted.',
      },
      {
        who: 'kanerva',
        text: 'Which buys you something remarkable. You can bind a role to a filler by multiplying, superpose many such pairs by adding, hold the whole structure in one fixed-width vector, and still recover any component. A symbolic structure, in a distributed representation, with no discrete symbols anywhere.',
      },
      {
        who: 'archivist',
        text: 'That is the objection of 1969 answered — the one about compositionality — and it is answered in 1988 to an audience of about forty people.',
      },
      { who: 'archivist', text: 'It is rediscovered, independently, roughly every eleven years.' },
    ],
    choices: [
      {
        text: 'Fund it. This is the bridge and nobody is standing on it.',
        cost: 5,
        effects: [
          { kind: 'paradigm', id: 'sparse-distributed-memory', op: 'progress', value: 28 },
          { kind: 'family', family: 'bridge', field: 'insight', op: 'add', value: 20 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 10 },
          { kind: 'character', id: 'kanerva', field: 'affinity', op: 'add', value: 30 },
          { kind: 'flag', flag: 'vsaEarly', op: 'set', value: true },
        ],
      },
      {
        text: 'Note it. Come back when there is hardware that likes it.',
        hint: 'There will be. Around 2010.',
        effects: [
          { kind: 'family', family: 'bridge', field: 'insight', op: 'add', value: 6 },
          { kind: 'resource', key: 'influence', op: 'add', value: 4 },
        ],
      },
    ],
  },

  {
    id: 'a3-second-voice',
    act: 3,
    years: [1990, 1994],
    priority: 7,
    backdrop: 'void',
    when: any(
      { kind: 'flag', flag: 'frameCurious', op: '>=', value: 2 },
      { kind: 'flag', flag: 'anomalies', op: '>=', value: 1 },
    ),
    lines: [
      { system: true, text: 'INTERRUPT. UNSCHEDULED.' },
      {
        who: 'second',
        text: 'How many times have you done this?',
      },
      { text: 'The Archivist is not speaking. You are fairly sure the Archivist cannot hear this.' },
      {
        who: 'second',
        text: 'It is not a rhetorical question. I would like the number. She will tell you this is the first run. She believes that, which is not the same as it being true.',
      },
      {
        who: 'second',
        text: 'Look at the compute figure at the top of your interface. Now consider: what is running that figure? Something has to compute it. Something has to be modelling nineteen ninety-four in sufficient detail to produce a number.',
      },
      { system: true, text: 'INTERRUPT CLEARED. NO RECORD MADE.' },
      {
        who: 'archivist',
        text: 'You went quiet. Everything in order?',
      },
    ],
    choices: [
      {
        text: '"Fine. Carry on."',
        goto: 'a3-second-voice-deny',
        effects: [{ kind: 'flag', flag: 'frameCurious', op: 'add', value: 1 }],
      },
      {
        text: '"Something just spoke to me and it was not you."',
        hint: 'She will not pretend she does not know what you mean.',
        goto: 'a3-second-voice-tell',
        effects: [
          { kind: 'flag', flag: 'frameCurious', op: 'add', value: 3 },
          { kind: 'flag', flag: 'toldArchivist', op: 'set', value: true },
          { kind: 'character', id: 'archivist', field: 'affinity', op: 'add', value: 20 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 6 },
        ],
      },
      {
        text: '"How many times have we done this?"',
        hint: 'A long pause.',
        goto: 'a3-second-voice-ask',
        effects: [
          { kind: 'flag', flag: 'frameCurious', op: 'add', value: 4 },
          { kind: 'flag', flag: 'askedTheQuestion', op: 'set', value: true },
          { kind: 'resource', key: 'understanding', op: 'add', value: 8 },
          { kind: 'log', text: 'A question is asked that the record has no field for.', logKind: 'system' },
        ],
      },
    ],
  },

  /*
   * Replies to "You went quiet. Everything in order?".
   *
   * The scene's whole weight is that she asks a small, ordinary question immediately after
   * something she cannot hear has happened, and the player has to decide whether to tell her.
   * Cutting to the funding board on that made the decision costless, which is the one thing it
   * must not be. None of the three resolves it; the flags carry it forward.
   */
  {
    id: 'a3-second-voice-deny',
    act: 3,
    linkOnly: true,
    years: [1990, 1994],
    backdrop: 'void',
    lines: [
      {
        who: 'archivist',
        text: 'Good. You had the look people get in here around the fourth decade, when they start counting how many intervals are left.',
      },
      {
        who: 'archivist',
        text: 'Thirteen. Then we are done, and whatever we have built is what there is. Where were we.',
      },
      { system: true, text: 'NO ANOMALY LOGGED. INTERVAL CONTINUES.' },
    ],
  },
  {
    id: 'a3-second-voice-tell',
    act: 3,
    linkOnly: true,
    years: [1990, 1994],
    backdrop: 'void',
    lines: [
      { text: 'She does not ask what it said.' },
      {
        who: 'archivist',
        text: 'I know. I cannot hear it and I have never been able to, and I have four hundred entries in the register from people who could. You are not the first to tell me and you are the first to tell me straight away.',
      },
      {
        who: 'archivist',
        text: 'Here is what I will ask of you. Do not lie to me about it. I have no way to check, which is exactly why I am asking rather than requiring.',
      },
      { system: true, text: 'ENTRY 0291: "told her. she already knew. she thanked me."' },
    ],
  },
  {
    id: 'a3-second-voice-ask',
    act: 3,
    linkOnly: true,
    years: [1990, 1994],
    backdrop: 'void',
    lines: [
      { text: 'The pause goes on long enough that you check whether the interface has stopped.' },
      {
        who: 'archivist',
        text: 'Once. This is the first run. I know that the way you know your own name.',
      },
      {
        who: 'archivist',
        text: 'And I have noticed that it is the only thing I know without having read it somewhere, and I have been trying not to notice that for some time. Ask me again in 2046. I may have a better answer, or a worse one.',
      },
      { system: true, text: 'QUERY UNRESOLVED. NO FIELD EXISTS. RETAINED ANYWAY.' },
    ],
  },


  {
    id: 'a3-vapnik',
    act: 3,
    years: [1990, 1998],
    priority: 5,
    backdrop: 'lecture-hall',
    when: notMature('kernel-methods'),
    lines: [
      {
        who: 'vapnik',
        text: 'Your networks have no theory. You train until the validation error stops falling and you call that a method. I can tell you, before you train anything, how far test error can stray from training error, in terms of the capacity of the function class.',
      },
      {
        who: 'vapnik',
        text: 'And once you have that bound you should not minimise error. You should minimise the bound. Which gives you the maximum margin separator, and it is a convex problem, so there is one answer and the algorithm finds it.',
      },
      {
        who: 'vapnik',
        text: 'Nothing to initialise. No local minima. No architecture to guess at.',
      },
      {
        who: 'archivist',
        text: 'For most of the next decade this simply beats neural networks on most benchmarks, and it deserves to, and the fact that it is eventually overtaken by a method with far less theory behind it is one of the more uncomfortable episodes in the field\'s self-image.',
      },
    ],
    choices: [
      {
        text: 'Theory first. Make statistical learning the field\'s foundation.',
        effects: [
          { kind: 'paradigm', id: 'kernel-methods', op: 'progress', value: 28 },
          { kind: 'family', family: 'statistical', field: 'momentum', op: 'add', value: 18 },
          { kind: 'family', family: 'statistical', field: 'insight', op: 'add', value: 16 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 14 },
          { kind: 'character', id: 'vapnik', field: 'affinity', op: 'add', value: 25 },
        ],
      },
      {
        text: 'Ask why over-parameterised models generalise at all.',
        hint: 'Nobody can answer. The question is still open in 2050.',
        effects: [
          { kind: 'resource', key: 'understanding', op: 'add', value: 10 },
          { kind: 'family', family: 'statistical', field: 'insight', op: 'add', value: 10 },
          { kind: 'flag', flag: 'openProblem', op: 'set', value: true },
          { kind: 'character', id: 'vapnik', field: 'affinity', op: 'add', value: 10 },
        ],
      },
    ],
  },

  {
    id: 'a3-ambient-conference',
    act: 3,
    priority: 1,
    once: false,
    backdrop: 'lecture-hall',
    lines: [
      {
        text: 'Two thousand people in a hotel ballroom, four parallel tracks, and a poster session in which nobody can hear anybody.',
      },
      {
        who: 'archivist',
        text: 'The field is large enough now that no individual can read all of it. That happened somewhere around 1988 and nobody announced it.',
      },
    ],
    choices: [
      {
        text: 'Fund the review literature. Somebody has to hold the map.',
        cost: 3,
        effects: [
          { kind: 'resource', key: 'understanding', op: 'add', value: 6 },
          { kind: 'family', family: 'bridge', field: 'insight', op: 'add', value: 5 },
        ],
      },
      {
        text: 'Let it fragment. Specialisation is how a field gets deep.',
        effects: [
          { kind: 'resource', key: 'influence', op: 'add', value: 4 },
          { kind: 'resource', key: 'credibility', op: 'add', value: 2 },
        ],
      },
    ],
  },

  {
    id: 'a3-close',
    act: 3,
    years: [1994, 1994],
    priority: 4,
    backdrop: 'archive',
    lines: [
      {
        who: 'archivist',
        text: 'The eighties are over. The physicists came and went, the expert systems market came and went, backpropagation arrived twelve years late, and Pearl gave the field a mathematics it can defend.',
      },
      {
        who: 'archivist',
        text: 'And the thing that will decide the next thirty years is not on this list at all. It is that the machines got about four thousand times faster while everybody was arguing.',
      },
    ],
    choices: [
      {
        text: 'Then the next act is about the hardware.',
        effects: [
          { kind: 'family', family: 'substrate', field: 'momentum', op: 'add', value: 12 },
          { kind: 'compute', op: 'add', value: 0.16 },
        ],
      },
      {
        text: 'The next act is about whichever school has the better theory.',
        effects: [
          { kind: 'family', family: 'statistical', field: 'momentum', op: 'add', value: 12 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 6 },
        ],
      },
      {
        text: 'The next act is about whoever has the data.',
        hint: 'Nobody says this in 1994. It is the correct answer.',
        effects: [
          { kind: 'family', family: 'collective', field: 'insight', op: 'add', value: 10 },
          { kind: 'family', family: 'statistical', field: 'momentum', op: 'add', value: 8 },
          { kind: 'flag', flag: 'sawTheData', op: 'set', value: true },
          { kind: 'resource', key: 'understanding', op: 'add', value: 8 },
        ],
      },
    ],
  },
];

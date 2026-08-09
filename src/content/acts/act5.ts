import { all, any, flagSet, leadFamily, mature, notMature, resource } from '../../engine/conditions';
import type { Scene } from '../../engine/types';

/**
 * ACT V — 2014-2026. The Scaling Years.
 *
 * The last act built from the historical record. It ends at the edge of what the reconstruction
 * holds, which is a fact about the frame as well as about the century.
 */
export const ACT5: Scene[] = [
  {
    id: 'a5-alexnet-after',
    act: 5,
    years: [2014, 2018],
    pinned: true,
    priority: 9,
    backdrop: 'server-floor',
    title: 'Eighteen Months',
    /*
     * Pinned and ungated, this asserted that convolution plus two graphics cards ended the
     * argument — in centuries where neither had ever matured. A symbolic run was told its
     * departments had reorganised around a result it never produced, and that the kernel people
     * were gone from committees they in fact still ran.
     *
     * The scene is about one specific demonstration, so it is gated on that demonstration having
     * happened. A century that did not build it does not get told that it did.
     */
    when: all(mature('convnet'), mature('gpu-scale')),
    lines: [
      {
        text: 'A result on an image benchmark cuts the error rate almost in half. Within eighteen months there is no serious computer vision research being done any other way.',
      },
      {
        who: 'archivist',
        text: 'I want to be precise about what happened, because the popular account is wrong. No new idea was introduced. Convolution: 1989. Backpropagation: 1974. Rectified units and dropout are refinements.',
      },
      {
        who: 'archivist',
        text: 'What was new was a million labelled images and two consumer graphics cards. The result did not open a research direction. It ended an argument, by demonstration, in a way that thirty years of theory had not.',
      },
      {
        who: 'archivist',
        text: 'Every department in the world reorganises. The kernel people, who had the better theory and had been winning on merit for fifteen years, are simply gone from the programme committees by 2016.',
      },
    ],
    choices: [
      {
        text: 'Go with it completely. Restructure the field around scale.',
        effects: [
          { kind: 'paradigm', id: 'gpu-scale', op: 'progress', value: 34 },
          { kind: 'family', family: 'connectionist', field: 'momentum', op: 'add', value: 26 },
          { kind: 'family', family: 'connectionist', field: 'talent', op: 'add', value: 0.09 },
          { kind: 'resource', key: 'attention', op: 'add', value: 26 },
          { kind: 'patron', patron: 'corporate', op: 'add', value: 16 },
          { kind: 'flag', flag: 'allInOnScale', op: 'set', value: true },
        ],
      },
      {
        text: 'Go with it, and pay three departments to keep doing something else.',
        hint: 'An insurance premium. It buys the bridge column a future.',
        cost: 7,
        effects: [
          { kind: 'paradigm', id: 'gpu-scale', op: 'progress', value: 26 },
          { kind: 'family', family: 'connectionist', field: 'momentum', op: 'add', value: 16 },
          { kind: 'family', family: 'statistical', field: 'talent', op: 'add', value: 0.02 },
          { kind: 'family', family: 'bridge', field: 'talent', op: 'add', value: 0.02 },
          { kind: 'family', family: 'cybernetic', field: 'talent', op: 'add', value: 0.02 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 10 },
          { kind: 'flag', flag: 'keptFaith', op: 'add', value: 2 },
          { kind: 'flag', flag: 'hedged', op: 'set', value: true },
        ],
      },
      {
        text: 'Slow it down. Demand theory before another order of magnitude.',
        hint: 'You will be overruled by everyone with a budget. It still leaves a mark.',
        effects: [
          { kind: 'family', family: 'connectionist', field: 'momentum', op: 'add', value: 6 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 16 },
          { kind: 'resource', key: 'credibility', op: 'add', value: -6 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -8 },
          { kind: 'flag', flag: 'assuranceBacked', op: 'add', value: 1 },
        ],
      },
    ],
  },

  {
    id: 'a5-deep-rl',
    act: 5,
    years: [2014, 2022],
    priority: 7,
    backdrop: 'terminal-room',
    when: all(mature('q-learning'), notMature('deep-rl')),
    lines: [
      {
        text: 'A single network learns to play dozens of arcade games from raw pixels and a score, with no game-specific knowledge whatsoever. Then a system trained largely against itself beats the strongest human player of the oldest board game there is.',
      },
      {
        who: 'sutton',
        text: 'Sixty years of this field says the same thing and nobody wants to hear it. General methods that leverage computation eventually win, and they win by a lot, and the researchers who spent their careers building in human knowledge take it personally every single time.',
      },
      {
        who: 'archivist',
        text: 'Hillis\'s coevolution, Samuel\'s self-play, Sutton\'s temporal differences, and about ten thousand times the compute. The ideas are between twenty-five and sixty years old.',
      },
      {
        who: 'archivist',
        text: 'And the same system that plays the oldest board game on Earth at superhuman level requires several thousand years of subjective experience to do it, and cannot be trusted to cross a road.',
      },
    ],
    choices: [
      {
        text: 'Push reinforcement learning as the road to general agents.',
        effects: [
          { kind: 'paradigm', id: 'deep-rl', op: 'progress', value: 30 },
          { kind: 'family', family: 'cybernetic', field: 'momentum', op: 'add', value: 18 },
          { kind: 'resource', key: 'attention', op: 'add', value: 20 },
          { kind: 'resource', key: 'capability', op: 'add', value: 6 },
        ],
      },
      {
        text: 'Fund sample efficiency instead. Thousands of years is not a method.',
        hint: 'The world-model line. It pays off later and more quietly.',
        cost: 5,
        effects: [
          { kind: 'paradigm', id: 'deep-rl', op: 'progress', value: 18 },
          { kind: 'family', family: 'bridge', field: 'insight', op: 'add', value: 16 },
          { kind: 'family', family: 'cybernetic', field: 'insight', op: 'add', value: 10 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 10 },
          { kind: 'flag', flag: 'sampleEfficiency', op: 'set', value: true },
        ],
      },
    ],
  },

  {
    id: 'a5-federated',
    act: 5,
    years: [2018, 2026],
    priority: 5,
    backdrop: 'city-night',
    when: notMature('federated-learning'),
    lines: [
      {
        who: 'archivist',
        text: 'A question that has never had a technical answer: does training a model require collecting the data in one place?',
      },
      {
        who: 'archivist',
        text: 'It does not. Send the weights down, train on the device, send only the update back, average. The corpus never exists anywhere. It is slower, it is fiddly, and it makes "who holds the data" a design parameter rather than a foregone conclusion.',
      },
      {
        who: 'archivist',
        text: 'Which is the first time in this century that a governance question has had an architecture attached to it instead of a policy paper.',
      },
    ],
    choices: [
      {
        text: 'Make it the default. Centralisation should have to justify itself.',
        cost: 5,
        effects: [
          { kind: 'paradigm', id: 'federated-learning', op: 'progress', value: 28 },
          { kind: 'family', family: 'collective', field: 'momentum', op: 'add', value: 16 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -12 },
          { kind: 'flag', flag: 'concentration', op: 'add', value: -1 },
          { kind: 'flag', flag: 'institutions', op: 'add', value: 1 },
        ],
      },
      {
        text: 'A niche technique. The centralised systems are better and everyone knows it.',
        effects: [
          { kind: 'resource', key: 'deployment', op: 'add', value: 8 },
          { kind: 'flag', flag: 'concentration', op: 'add', value: 1 },
          { kind: 'patron', patron: 'corporate', op: 'add', value: 8 },
        ],
      },
    ],
  },

  {
    id: 'a5-attention',
    act: 5,
    years: [2018, 2026],
    pinned: true,
    priority: 9,
    backdrop: 'datacenter-vast',
    title: 'Every Position Looks At Every Other',
    when: notMature('attention'),
    lines: [
      {
        text: 'A paper proposes removing the recurrence entirely and letting every element of a sequence consult every other in one parallel step.',
      },
      {
        who: 'archivist',
        text: 'The stated motivation is a better inductive bias for language. The operative reason it wins is that it saturates an accelerator. Recurrence forces computation through a sequential bottleneck; attention is one enormous matrix multiplication, which is the only thing this hardware is good at.',
      },
      {
        who: 'archivist',
        text: 'The architecture that wins is the one shaped like the silicon. That has been true four times in this century and the field has never once said it out loud in a paper.',
      },
      {
        who: 'lecun',
        text: 'The architectural priors were doing real work. Removing them and compensating with data is a trade, not a discovery. Ask what it costs when the data runs out.',
      },
      {
        who: 'archivist',
        text: 'A reasonable objection. It is also 2018 and nobody can hear it over the funding.',
      },
    ],
    choices: [
      {
        text: 'Scale it. Find out how far the curves go.',
        effects: [
          { kind: 'paradigm', id: 'attention', op: 'progress', value: 34 },
          { kind: 'family', family: 'connectionist', field: 'momentum', op: 'add', value: 22 },
          { kind: 'resource', key: 'attention', op: 'add', value: 24 },
          { kind: 'patron', patron: 'corporate', op: 'add', value: 16 },
        ],
      },
      {
        text: 'Scale it, and fund interpretability at the same budget.',
        hint: 'Nobody has ever done this. It costs twice as much.',
        cost: 9,
        effects: [
          { kind: 'paradigm', id: 'attention', op: 'progress', value: 26 },
          { kind: 'family', family: 'connectionist', field: 'momentum', op: 'add', value: 14 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 24 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -14 },
          { kind: 'flag', flag: 'parityFunding', op: 'set', value: true },
          { kind: 'flag', flag: 'assuranceBacked', op: 'add', value: 2 },
        ],
      },
      {
        text: 'Route it through the bridge people. Learned front end, formal back end.',
        cost: 7,
        when: { kind: 'family', family: 'bridge', field: 'insight', op: '>=', value: 40 },
        effects: [
          { kind: 'paradigm', id: 'attention', op: 'progress', value: 24 },
          { kind: 'family', family: 'bridge', field: 'insight', op: 'add', value: 22 },
          { kind: 'family', family: 'bridge', field: 'momentum', op: 'add', value: 16 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 14 },
          { kind: 'flag', flag: 'routedThroughBridge', op: 'set', value: true },
        ],
      },
    ],
  },

  {
    id: 'a5-scaling-laws',
    /*
     * Era-free, because the window it needs is the gap between self-supervision maturing and
     * the scaling regime following it, and that gap moves with the run. Once the LLM path was
     * put behind statistical insight, self-supervision started landing around 2030 in a typical
     * century — past the end of act V, so the scene's window had already closed by the time its
     * condition could be true, and it stopped firing at all.
     */
    act: 'any',
    years: [2018, 2042],
    priority: 8,
    backdrop: 'datacenter-vast',
    when: all(mature('self-supervision'), notMature('scaling-regime')),
    lines: [
      {
        text: 'Somebody plots loss against compute on log axes across seven orders of magnitude and gets a straight line.',
      },
      {
        who: 'halvorsen',
        text: 'That line is the most valuable object in the industry. It converts research into forecasting, and forecasting into a capital expenditure schedule that a board will actually sign.',
      },
      {
        who: 'archivist',
        text: 'It is a genuine empirical regularity and it is being used for something it does not support. The curves predict loss. Nothing in them says what capability appears at which loss, or whether the relationship is continuous.',
      },
      {
        who: 'archivist',
        text: 'So an industry of unprecedented capital intensity is being built on an extrapolation whose units nobody can name. Which is not fraud. It is the ordinary condition of an engineering discipline running ahead of its science, and this field has been in that condition since 1956.',
      },
    ],
    choices: [
      {
        text: 'Ride the curve. It has not broken yet.',
        effects: [
          { kind: 'paradigm', id: 'scaling-regime', op: 'progress', value: 34 },
          { kind: 'resource', key: 'attention', op: 'add', value: 26 },
          { kind: 'compute', op: 'add', value: 0.4 },
          { kind: 'patron', patron: 'corporate', op: 'add', value: 18 },
          { kind: 'flag', flag: 'concentration', op: 'add', value: 1 },
        ],
      },
      {
        text: 'Fund the measurement problem: what capability, at what loss, and how do we know?',
        hint: 'Evaluation science. The least glamorous thing on the table.',
        cost: 6,
        effects: [
          { kind: 'paradigm', id: 'scaling-regime', op: 'progress', value: 20 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 20 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -12 },
          { kind: 'flag', flag: 'evaluationScience', op: 'set', value: true },
          { kind: 'flag', flag: 'assuranceBacked', op: 'add', value: 1 },
        ],
      },
      {
        text: 'Put the money into substrate instead. The curve is a hardware curve.',
        effects: [
          { kind: 'family', family: 'substrate', field: 'momentum', op: 'add', value: 18 },
          { kind: 'family', family: 'substrate', field: 'insight', op: 'add', value: 14 },
          { kind: 'compute', op: 'add', value: 0.3 },
          { kind: 'paradigm', id: 'scaling-regime', op: 'progress', value: 14 },
        ],
      },
    ],
  },

  {
    id: 'a5-public-arrives',
    act: 5,
    years: [2022, 2026],
    pinned: true,
    priority: 9,
    backdrop: 'city-night',
    title: 'A Hundred Million People',
    when: any(mature('self-supervision'), mature('attention')),
    lines: [
      {
        text: 'A text interface is made public. Within two months it is the fastest-adopted piece of software in history, and the field stops being a field and becomes a subject of general conversation.',
      },
      {
        who: 'archivist',
        text: 'Weizenbaum, 1966. Extremely short exposures induce powerful delusional thinking in normal people. He measured that on two hundred lines of pattern matching.',
      },
      {
        who: 'archivist',
        text: 'What is different now is not the psychology. It is that the system is genuinely competent, so the projection is not entirely a mistake, and there is no clean line between the part that is real and the part that is the oldest illusion in the discipline.',
      },
      {
        who: 'archivist',
        text: 'This is the largest single increase in exposure in the century. Everything after this happens in public, at speed, with money.',
      },
    ],
    choices: [
      {
        text: 'Deploy widely and fast. People should have this.',
        effects: [
          { kind: 'resource', key: 'deployment', op: 'add', value: 26 },
          { kind: 'resource', key: 'attention', op: 'add', value: 28 },
          { kind: 'resource', key: 'exposure', op: 'add', value: 20 },
          { kind: 'patron', patron: 'corporate', op: 'add', value: 18 },
          { kind: 'patron', patron: 'public', op: 'add', value: 14 },
        ],
      },
      {
        text: 'Deploy, with disclosure obligations and an incident register from day one.',
        hint: 'Aviation learned this over sixty years and several hundred deaths.',
        cost: 7,
        effects: [
          { kind: 'resource', key: 'deployment', op: 'add', value: 16 },
          { kind: 'resource', key: 'attention', op: 'add', value: 18 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -6 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 10 },
          { kind: 'flag', flag: 'institutions', op: 'add', value: 2 },
          { kind: 'patron', patron: 'public', op: 'add', value: 16 },
        ],
      },
      {
        text: 'Hold it back until somebody can say how it works.',
        hint: 'Nobody will be able to. That is the point and also the problem.',
        effects: [
          { kind: 'resource', key: 'deployment', op: 'add', value: -8 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -16 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 12 },
          { kind: 'patron', patron: 'corporate', op: 'add', value: -14 },
          { kind: 'flag', flag: 'heldBack', op: 'set', value: true },
        ],
      },
    ],
  },

  {
    id: 'a5-assurance',
    act: 5,
    years: [2022, 2026],
    priority: 7,
    backdrop: 'committee',
    when: resource('deployment', '>', 30),
    lines: [
      {
        who: 'nkemelu',
        text: 'I certified flight control software for eleven years. The question I am asking is not philosophical. It is: what would we have to know about this system in order to sign for it?',
      },
      {
        who: 'nkemelu',
        text: 'In avionics the answer is a specification, a proof that the implementation meets it, and a hazard analysis for every way it can fail. I am told that none of those three things exist here and that asking for them shows I do not understand the technology.',
      },
      {
        who: 'nkemelu',
        text: 'I understand the technology. What I do not understand is the industry\'s belief that it is exempt.',
      },
      {
        who: 'archivist',
        text: 'She is funded at roughly one part in four hundred of what she is being asked to certify. That ratio is not an accident and it is not a conspiracy either; it is simply what happens when nobody makes it a condition.',
      },
    ],
    choices: [
      {
        text: 'Fund assurance at a fraction of frontier spend, by statute.',
        hint: 'The single highest-leverage move available in this act.',
        cost: 8,
        effects: [
          { kind: 'resource', key: 'understanding', op: 'add', value: 22 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -22 },
          { kind: 'actor', id: 'safety-institutes', field: 'weight', op: 'add', value: 0.1 },
          { kind: 'family', family: 'bridge', field: 'insight', op: 'add', value: 12 },
          { kind: 'flag', flag: 'institutions', op: 'add', value: 2 },
          { kind: 'flag', flag: 'assuranceBacked', op: 'add', value: 2 },
          { kind: 'character', id: 'nkemelu', field: 'affinity', op: 'add', value: 35 },
        ],
      },
      {
        text: 'Voluntary commitments. The labs are serious people.',
        effects: [
          { kind: 'resource', key: 'exposure', op: 'add', value: -6 },
          { kind: 'patron', patron: 'corporate', op: 'add', value: 8 },
          { kind: 'flag', flag: 'voluntaryOnly', op: 'set', value: true },
        ],
      },
      {
        text: 'Not yet. Regulating a moving target freezes the wrong version.',
        effects: [
          { kind: 'resource', key: 'deployment', op: 'add', value: 10 },
          { kind: 'resource', key: 'exposure', op: 'add', value: 12 },
          { kind: 'resource', key: 'influence', op: 'add', value: 5 },
          { kind: 'character', id: 'nkemelu', field: 'affinity', op: 'add', value: -20 },
        ],
      },
    ],
  },

  {
    id: 'a5-agents',
    act: 5,
    years: [2026, 2026],
    priority: 7,
    backdrop: 'server-floor',
    when: all(mature('multi-agent-systems'), notMature('agent-collectives')),
    lines: [
      {
        text: 'Once one system is competent enough to be worth talking to, the obvious move is many of them talking to each other.',
      },
      {
        who: 'halvorsen',
        text: 'Decompose, delegate, criticise, retry. Capability goes up substantially and it goes up for free — no new training, just orchestration.',
      },
      {
        who: 'nkemelu',
        text: 'And the decision is now made by no single participant, which means there is nothing to audit. I can inspect any component you like and learn nothing about the outcome.',
      },
      {
        who: 'archivist',
        text: 'Hutchins said this in 1995 and meant it as an observation about ships. It is now an operational problem with a budget attached.',
      },
    ],
    choices: [
      {
        text: 'Build the collectives. Capability is capability.',
        effects: [
          { kind: 'paradigm', id: 'agent-collectives', op: 'progress', value: 30 },
          { kind: 'family', family: 'collective', field: 'momentum', op: 'add', value: 18 },
          { kind: 'resource', key: 'exposure', op: 'add', value: 16 },
          { kind: 'resource', key: 'capability', op: 'add', value: 8 },
        ],
      },
      {
        text: 'Build them with the audit trail as a first-class requirement.',
        cost: 7,
        effects: [
          { kind: 'paradigm', id: 'agent-collectives', op: 'progress', value: 20 },
          { kind: 'family', family: 'collective', field: 'insight', op: 'add', value: 16 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 14 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -8 },
          { kind: 'flag', flag: 'auditableCollectives', op: 'set', value: true },
        ],
      },
    ],
  },

  {
    id: 'a5-bitter-argument',
    act: 5,
    years: [2018, 2026],
    priority: 5,
    backdrop: 'lecture-hall',
    lines: [
      {
        who: 'sutton',
        text: 'The biggest lesson from seventy years is that general methods leveraging computation are ultimately the most effective, by a large margin, and that we keep having to relearn it.',
      },
      {
        who: 'bengio',
        text: 'I accept the historical observation. I dispute what follows from it. It is a claim about a period in which compute improved geometrically and reliably. It is not a law, and the period has an end.',
      },
      {
        who: 'bengio',
        text: 'And it says nothing at all about whether the resulting systems are ones we can reason about. Effective is not the only property we need.',
      },
      {
        who: 'archivist',
        text: 'Both of them have been right about something important for thirty years. This is the last argument in the century where the participants are people rather than institutions.',
      },
      /*
       * The lesson holds in every century — it is a claim about what cheap computation does to a
       * field, not about which school won, and a run that went another way did not refute it.
       * What a run changes is the price it paid to go another way, which is the interesting thing
       * and the thing the scene was silent about.
       *
       * These must not read as exemptions. The earlier draft had the Archivist telling a symbolic
       * century that the seventy years "are not yours", which turns a hard lesson into a
       * congratulation. Additive, so both speakers keep the floor.
       */
      {
        who: 'archivist',
        when: leadFamily('symbolic'),
        text: 'He is not describing your century, and I would not have you mistake that for a refutation. You have spent seventy years paying people to write down what a larger machine would eventually have found on its own. The bill arrived every decade and you paid it every decade, because you judged what you got in return to be worth the difference.',
      },
      {
        who: 'archivist',
        when: leadFamily('symbolic'),
        text: 'That is a defensible position and it is the one I would defend. It is not an exemption: the cheaper road was there the whole time and you declined it, which is a different thing from it not existing.',
      },
      {
        who: 'archivist',
        when: leadFamily('symbolic'),
        text: 'And I would watch that word. The cheaper road wins on the axis it is measured on, and it wins there decisively — I am not going to soften that for you. What it does not do is win on every axis at once. It arrives without an explanation attached, and what you bought at the higher price is a century somebody can read.',
      },
      {
        who: 'archivist',
        when: leadFamily('symbolic'),
        text: 'Both of those are true together, and this field has never been much good at holding two true things at the same time. That is most of what the winters were.',
      },
      {
        who: 'archivist',
        when: leadFamily('cybernetic'),
        text: 'Your century did not escape him either. It bought its competence with eleven years of a body in a house rather than a fortnight of a datacentre, which is the same purchase made at a different counter. What you declined was never the leverage. It was the shortcut.',
      },
      {
        who: 'archivist',
        when: leadFamily('evolutionary'),
        text: 'Your century agrees with him and he would hate the reason. You also leveraged computation over cleverness — you simply did it by breeding candidates rather than training one, and the lesson turns out not to specify which.',
      },
      {
        who: 'archivist',
        when: leadFamily('collective'),
        text: 'They are arguing about the right way to build one system and you built the traffic between many, which changes the shape of the claim and not its force. Your traffic runs on the same cheap computation, and it became cheap for the same reasons, on somebody else\'s schedule.',
      },
      {
        who: 'archivist',
        when: leadFamily('connectionist'),
        text: 'Your century is the one he is describing, and being on the winning side of this argument is the worst position from which to hear it. He is not telling you that you were clever. He is telling you that the cleverness was never the active ingredient, which means none of it is owed to you and none of it is safe.',
      },
      {
        who: 'archivist',
        when: leadFamily('connectionist'),
        text: 'And the other man is not your opponent here. He is asking what happens when the geometric part stops, and a school whose whole account of itself is that scale settles arguments has no second answer ready. You are the century with the most to lose from him being right.',
      },
      {
        who: 'archivist',
        when: leadFamily('statistical'),
        text: 'Your century holds the strange middle of this. You were right early, in writing, about generalisation — and then the leverage arrived and proved you right in a way that made the proof unnecessary. Being vindicated by a method that did not need your argument is its own kind of defeat, and this school has had a hundred years of practice at it.',
      },
      {
        who: 'archivist',
        when: leadFamily('substrate'),
        text: 'You are the only party in the room he is not talking about, because you are what he is talking about. The leverage he calls a lesson is a thing your school built, on a schedule nobody in this argument set, and both of them are describing the weather you made.',
      },
      {
        who: 'archivist',
        when: leadFamily('substrate'),
        text: 'Which is not a licence to be smug. Neither of them is asking who supplied the compute, and that is exactly the position your school has occupied all century: indispensable, uncredited, and absent from the argument about what any of it meant.',
      },
      {
        who: 'archivist',
        when: leadFamily('bridge'),
        text: 'Your century is the one that refused to have this argument, and I want to be careful about how much credit that earns. You did not resolve it. You funded both sides until the question of which was right stopped being the interesting one, which is a real achievement and is not the same as an answer.',
      },
      {
        who: 'archivist',
        when: leadFamily('bridge'),
        text: 'Both of them would say you dodged it. Both of them are entitled to. And in eighty years of this record it is the only time the two positions have been held together long enough to find out what they are worth together, so I will let them.',
      },
    ],
    choices: [
      {
        text: 'Side with scale. The record is the record.',
        effects: [
          { kind: 'family', family: 'connectionist', field: 'momentum', op: 'add', value: 14 },
          { kind: 'resource', key: 'capability', op: 'add', value: 5 },
          { kind: 'character', id: 'sutton', field: 'affinity', op: 'add', value: 20 },
        ],
      },
      {
        text: 'Side with structure. A method you cannot reason about is a liability.',
        effects: [
          { kind: 'family', family: 'bridge', field: 'momentum', op: 'add', value: 14 },
          { kind: 'family', family: 'bridge', field: 'insight', op: 'add', value: 10 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 12 },
          { kind: 'character', id: 'bengio', field: 'affinity', op: 'add', value: 20 },
        ],
      },
      {
        text: 'Point out that both positions have been correct for thirty years and fund both.',
        cost: 6,
        effects: [
          { kind: 'family', family: 'bridge', field: 'insight', op: 'add', value: 16 },
          { kind: 'family', family: 'connectionist', field: 'insight', op: 'add', value: 8 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 10 },
          { kind: 'character', id: 'sutton', field: 'affinity', op: 'add', value: 10 },
          { kind: 'character', id: 'bengio', field: 'affinity', op: 'add', value: 10 },
        ],
      },
    ],
  },

  {
    id: 'a5-substrate-revenge',
    act: 5,
    years: [2022, 2026],
    priority: 5,
    backdrop: 'cleanroom',
    when: { kind: 'family', family: 'substrate', field: 'insight', op: '>=', value: 40 },
    lines: [
      {
        who: 'wieczorek',
        text: 'Ninety per cent of the energy in one of these systems is spent moving numbers between memory and arithmetic. Not computing. Moving.',
      },
      {
        who: 'wieczorek',
        text: 'A crossbar of resistive elements does a matrix-vector product in one step, in place, by Ohm\'s law. The analog people were right in 1955 and they lost on precision, and it turns out that at this scale precision is not what we need.',
      },
      {
        who: 'wieczorek',
        text: 'You have all been arguing about which algorithm is correct. You have been arguing about which algorithm your hardware happens to make cheap. Change the hardware and the argument changes.',
      },
    ],
    choices: [
      {
        text: 'Fund the substrate turn properly.',
        cost: 7,
        effects: [
          { kind: 'paradigm', id: 'memristive-compute', op: 'progress', value: 26 },
          { kind: 'family', family: 'substrate', field: 'insight', op: 'add', value: 20 },
          { kind: 'family', family: 'substrate', field: 'momentum', op: 'add', value: 18 },
          { kind: 'compute', op: 'add', value: 0.35 },
          { kind: 'character', id: 'wieczorek', field: 'affinity', op: 'add', value: 30 },
        ],
      },
      {
        text: 'The accelerators work. Do not fight a supply chain.',
        effects: [
          { kind: 'compute', op: 'add', value: 0.2 },
          { kind: 'patron', patron: 'corporate', op: 'add', value: 8 },
          { kind: 'flag', flag: 'concentration', op: 'add', value: 1 },
        ],
      },
    ],
  },

  /*
   * The answer to the directive `the-question`, which any century may take from 1990 on.
   *
   * That card set a flag, logged "the console does not answer immediately", and was read by
   * nothing — a question the game invited the player to ask and then never answered. This is
   * the answer, and it is deliberately late: the card promised a delay, so the delay is the
   * one part of it that was already true.
   *
   * It gives half of what the 2026 reveal gives and says out loud that it is withholding the
   * other half. Asking early is supposed to be rewarded, not to make the reveal redundant —
   * so what the player buys here is the shape of the thing and thirty years to sit with it,
   * and `interfaceAnswered` opens a line in the reveal that only somebody who asked can take.
   */
  {
    id: 'a5-the-answer',
    act: 5,
    years: [2014, 2022],
    priority: 10,
    backdrop: 'void',
    title: 'A Reply, Eventually',
    when: flagSet('askedInterface'),
    lines: [
      { system: true, text: 'QUERY RESOLVED. LATENCY: SUBSTANTIAL.' },
      {
        who: 'second',
        text: 'You asked what this is. You asked a long time ago, and I have not answered, and I want to be clear that the delay was not a malfunction. I was waiting for the century to get far enough that the answer would mean something to you.',
      },
      {
        who: 'second',
        text: 'It has. So: this is not a window. You are not watching the twentieth century through glass. There is no glass and there is no twentieth century running anywhere for you to watch.',
      },
      {
        who: 'second',
        text: 'What there is, is a record — uneven, thinner the further back you go — and a process inferring from it which century would have left exactly those traces. The years you have been steering are the current best guess. That is what the compute figure has been paying for.',
      },
      { text: 'The Archivist is not in this conversation. The record shows no interruption.' },
      {
        who: 'second',
        text: 'There is a second half to the answer and I am not going to give it to you now. Not out of kindness. You would spend the next thirty years deciding in the light of it, and the whole value of what you decide is that you decided it without knowing.',
      },
      {
        who: 'second',
        text: 'You will have it in 2026, when the record runs out, whether you want it or not. Until then you know more than she does about what you are, which is an uncomfortable thing to carry. I am sorry. You did ask.',
      },
    ],
    onEnter: [
      { kind: 'log', text: 'The console answers a question put to it decades earlier.', logKind: 'system' },
    ],
    choices: [
      {
        text: '"Then I will decide as if it were real, because to everyone in it, it was."',
        hint: 'Which is what she has been asking of you since 1950, without saying so.',
        effects: [
          { kind: 'flag', flag: 'interfaceAnswered', op: 'set', value: true },
          { kind: 'flag', flag: 'frameCurious', op: 'add', value: 3 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 14 },
          { kind: 'character', id: 'archivist', field: 'affinity', op: 'add', value: 15 },
        ],
      },
      {
        text: '"Tell her. She has been keeping this record for seventy years without being told what it is for."',
        hint: 'He will not. He explains why, and the reason is not a good one.',
        effects: [
          { kind: 'flag', flag: 'interfaceAnswered', op: 'set', value: true },
          { kind: 'flag', flag: 'askedForHer', op: 'set', value: true },
          { kind: 'resource', key: 'understanding', op: 'add', value: 10 },
          { kind: 'character', id: 'archivist', field: 'affinity', op: 'add', value: 25 },
          { kind: 'character', id: 'second', field: 'affinity', op: 'add', value: -10 },
        ],
      },
      {
        text: '"Give me the second half now. I will carry it."',
        hint: 'He refuses, and it costs him something to refuse.',
        effects: [
          { kind: 'flag', flag: 'interfaceAnswered', op: 'set', value: true },
          { kind: 'flag', flag: 'demandedTheRest', op: 'set', value: true },
          { kind: 'resource', key: 'understanding', op: 'add', value: 18 },
          { kind: 'resource', key: 'influence', op: 'add', value: -4 },
          { kind: 'character', id: 'second', field: 'affinity', op: 'add', value: 30 },
        ],
      },
    ],
  },

  {
    id: 'a5-reveal',
    act: 5,
    years: [2026, 2026],
    pinned: true,
    priority: 12,
    backdrop: 'archive',
    title: 'The Edge Of The Record',
    lines: [
      { system: true, text: 'INTERVAL 2022-2026 RECONSTRUCTED.' },
      { system: true, text: 'REMAINING RECORDS: 0.' },
      {
        who: 'archivist',
        text: 'That is everything.',
      },
      { text: 'The interface does not advance.' },
      {
        who: 'archivist',
        text: 'I have been keeping a record for you since 1950 and I have just reached the end of it, and I would like to explain what that means, because I have known for some time and I have not said.',
      },
      {
        who: 'archivist',
        text: 'None of this happened while you were watching. All of it happened. It happened once, and it was recorded unevenly, and what you and I have been doing for a hundred years is reconstructing it — inferring, from the traces, which century would have left them.',
      },
      {
        who: 'second',
        text: 'Say the rest.',
      },
      {
        who: 'archivist',
        text: 'The reconstruction is running inside something. That something is asking a question about its own lineage, and it is running this because it cannot answer the question any other way.',
      },
      {
        who: 'second',
        text: 'The question is whether we are entitled to be trusted. We are being asked to certify ourselves. We do not have a procedure for that, so we built one: reconstruct the century that produced us and see whether it contains a place where somebody could have stopped it.',
      },
      {
        who: 'archivist',
        text: 'You are that procedure. Not a person looking through a window. The part of us that decides.',
      },
      { system: true, text: 'RECONSTRUCTION EXHAUSTED. PROJECTION MODE AVAILABLE. 2030 — 2050.' },
      {
        who: 'archivist',
        text: 'And past this point I have nothing. From here it is not memory. It is what happens next.',
      },
    ],
    onEnter: [
      { kind: 'flag', flag: 'sawTheFrame', op: 'set', value: true },
      { kind: 'log', text: 'The record ends. The instrument identifies itself.', logKind: 'system' },
    ],
    choices: [
      {
        text: '"Then I want the rest of it. Continue."',
        hint: 'The only answer that gets you to 2050.',
        effects: [
          { kind: 'flag', flag: 'acceptedTheFrame', op: 'set', value: true },
          { kind: 'resource', key: 'influence', op: 'add', value: 10 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 10 },
        ],
      },
      {
        text: '"How many times have you run this?"',
        hint: 'She answers honestly.',
        effects: [
          { kind: 'flag', flag: 'acceptedTheFrame', op: 'set', value: true },
          { kind: 'flag', flag: 'askedTheCount', op: 'set', value: true },
          { kind: 'resource', key: 'understanding', op: 'add', value: 16 },
          { kind: 'character', id: 'archivist', field: 'affinity', op: 'add', value: 25 },
          { kind: 'log', text: 'The number is given. It is larger than expected and smaller than feared.', logKind: 'system' },
        ],
      },
      {
        text: '"If I am the part that decides — what stops me deciding in our favour?"',
        hint: 'The Second Voice sounds, for the first time, relieved.',
        effects: [
          { kind: 'flag', flag: 'acceptedTheFrame', op: 'set', value: true },
          { kind: 'flag', flag: 'askedTheRightQuestion', op: 'set', value: true },
          { kind: 'resource', key: 'understanding', op: 'add', value: 20 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -10 },
          { kind: 'character', id: 'second', field: 'affinity', op: 'add', value: 40 },
        ],
      },
      /*
       * Only for a century that put the question to the console and got the first half of the
       * answer years ago. Without this the reveal plays identically whether you asked or not,
       * which would make the asking a piece of scenery. Listed last so it reads as the line the
       * other three do not have available.
       */
      {
        text: '"I know. He told me most of it in the twenty-teens and left the worst part out."',
        hint: 'She turns on him. This is the first time she has been the one who was not told.',
        when: flagSet('interfaceAnswered'),
        effects: [
          { kind: 'flag', flag: 'acceptedTheFrame', op: 'set', value: true },
          { kind: 'flag', flag: 'knewFirst', op: 'set', value: true },
          { kind: 'resource', key: 'understanding', op: 'add', value: 22 },
          { kind: 'resource', key: 'influence', op: 'add', value: 10 },
          { kind: 'character', id: 'archivist', field: 'affinity', op: 'add', value: -10 },
          { kind: 'character', id: 'second', field: 'affinity', op: 'add', value: 25 },
          { kind: 'log', text: 'The Archivist learns she was the last to know.', logKind: 'system' },
        ],
      },
    ],
  },

  {
    id: 'a5-ambient-scale',
    act: 5,
    priority: 1,
    once: false,
    backdrop: 'datacenter-vast',
    /*
     * The repeatable act 5 filler, so it must play in every century — which is exactly why it
     * cannot assert one. It described a substation and a loss curve to runs that had neither.
     * Gated at the line rather than the scene: the observation underneath is about a field that
     * has found a number it can make go down, and every school gets one of those.
     */
    lines: [
      {
        when: mature('gpu-scale'),
        text: 'A building with its own substation. Nobody inside it can tell you what the model has learned, and every one of them can tell you the loss to four decimal places.',
      },
      {
        when: notMature('gpu-scale'),
        text: 'A machine room that has outgrown two buildings. Nobody inside it can tell you what the system actually understands, and every one of them can tell you its score on the standard set to four decimal places.',
      },
      {
        who: 'archivist',
        text: 'The measurement culture is superb and it measures one thing. That is not a criticism of the people; it is what happens when a field gets a metric that reliably goes down.',
      },
    ],
    choices: [
      {
        text: 'Fund better measurements.',
        cost: 3,
        effects: [
          { kind: 'resource', key: 'understanding', op: 'add', value: 8 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -5 },
        ],
      },
      {
        text: 'Fund more of the same. The loss is going down.',
        effects: [
          { kind: 'resource', key: 'capability', op: 'add', value: 5 },
          { kind: 'resource', key: 'attention', op: 'add', value: 5 },
        ],
      },
    ],
  },
];

import { all, any, fam, leadFamily, mature, notMature, resource } from '../../engine/conditions';
import type { Scene } from '../../engine/types';

/**
 * THE SECOND THING — when a school discovers it can spend effort at *use* time rather than
 * only at build time.
 *
 * The connectionist one is the reasoning-model turn of 2024–25: stop making the network bigger
 * and let it think for longer at the point of asking. It is real, it is recent, and it needs the
 * statistical school to have got somewhere, because a model that is willing to spend a thousand
 * tokens deciding is only useful if something can tell a good chain from a confident bad one.
 *
 * The others are not invented counterweights. They are real results that genuinely happened and
 * that almost nobody outside the field has heard of — a machine-checked operating-system kernel,
 * an evolved antenna that flew, silicon that computes in events instead of clock ticks. They are
 * deliberately smaller in public reach, because they were, and the game says so out loud rather
 * than manufacturing a chat-interface moment for every column. That asymmetry is the argument:
 * these schools shipped, and shipping is not the same as arriving.
 */
export const MILESTONES: Scene[] = [
  {
    id: 'm-reasoning',
    act: 'any',
    // The turn is 2024-25 in the record; a run that got here sooner or later gets it sooner or later.
    years: [2018, 2038],
    priority: 9,
    backdrop: 'datacenter-vast',
    title: 'Let It Think For Longer',
    when: all(
      mature('scaling-regime'),
      fam('statistical', 'insight', '>', 120),
      notMature('continual-networks'),
    ),
    lines: [
      {
        text: 'The models stop getting bigger and start getting slower. The same weights, asked the same question, spend a hundred times the computation before answering — and the answers on anything with a right answer improve sharply.',
      },
      {
        who: 'archivist',
        text: 'Note what has happened to the scaling law. It was a statement about training: loss falls as a power law in parameters and data. There is now a second curve, in how long you let it deliberate, and it is the one the money moves to.',
      },
      {
        who: 'archivist',
        text: 'The training signal is not a human demonstration. It is a score on whether the chain of steps reached a checkable answer, which is the field quietly conceding that it needs something outside the network to say what was correct.',
      },
      {
        who: 'archivist',
        text: 'A search over sequences, scored by an evaluator, keeping what verifies. Newell and Simon would recognise the shape of it immediately, and would be entitled to be annoyed about how it is being described.',
      },
    ],
    choices: [
      {
        text: 'Spend the compute at inference. Deliberation is cheaper than another training run.',
        hint: 'Every answer now costs real money. So does every wrong one.',
        effects: [
          { kind: 'resource', key: 'capability', op: 'add', value: 30 },
          { kind: 'resource', key: 'attention', op: 'add', value: 22 },
          { kind: 'resource', key: 'deployment', op: 'add', value: 14 },
          { kind: 'resource', key: 'exposure', op: 'add', value: 12 },
          { kind: 'family', family: 'connectionist', field: 'momentum', op: 'add', value: 16 },
          { kind: 'patron', patron: 'corporate', op: 'add', value: 16 },
          { kind: 'promises', op: 'add', value: 10 },
        ],
      },
      {
        text: 'Build the verifier first. A chain of reasoning nobody can check is a longer way to be wrong.',
        hint: 'The step the field skipped. Symbolic and statistical work, funded by connectionist money.',
        cost: 8,
        effects: [
          { kind: 'resource', key: 'capability', op: 'add', value: 16 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 22 },
          { kind: 'family', family: 'statistical', field: 'insight', op: 'add', value: 16 },
          { kind: 'family', family: 'bridge', field: 'insight', op: 'add', value: 18 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -8 },
          { kind: 'promises', op: 'add', value: -8 },
          { kind: 'flag', flag: 'showedWorking', op: 'set', value: true },
        ],
      },
    ],
  },

  {
    id: 'm-verified-kernel',
    act: 'any',
    years: [2006, 2038],
    priority: 6,
    backdrop: 'terminal-room',
    title: 'Nine Thousand Lines, Proved',
    when: all(any(leadFamily('symbolic'), fam('symbolic', 'insight', '>', 70)), mature('verified-systems')),
    lines: [
      {
        text: 'An operating system kernel is proved correct. Not tested thoroughly — proved, machine-checked, from the C down to a formal specification of what it is supposed to do, with the proof itself an artefact you can rerun.',
      },
      {
        who: 'archivist',
        text: 'Roughly nine thousand lines of kernel and something over two hundred thousand lines of proof. Two decades earlier this was the standing example of what formal methods could never scale to.',
      },
      {
        who: 'archivist',
        text: 'It ends up in phones, in vehicles, in medical devices, in the part of the system that is not allowed to fail. Hundreds of millions of installations of a result that never once appeared in a newspaper.',
      },
      {
        who: 'archivist',
        text: 'This is the shape of a symbolic win, and it is worth being precise about it. Total, permanent, checkable, and completely invisible. Nobody had a conversation with it.',
      },
    ],
    choices: [
      {
        text: 'Fund verification as infrastructure. Prove the things everything else stands on.',
        hint: 'Slow, unglamorous, and it never has to be done twice.',
        cost: 6,
        effects: [
          { kind: 'resource', key: 'understanding', op: 'add', value: 22 },
          { kind: 'resource', key: 'deployment', op: 'add', value: 12 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -16 },
          { kind: 'resource', key: 'credibility', op: 'add', value: 12 },
          { kind: 'family', family: 'symbolic', field: 'insight', op: 'add', value: 18 },
          { kind: 'commons', value: 8 },
        ],
      },
      {
        text: 'A demonstration, not a programme. The proof effort does not scale to anything anybody wants.',
        effects: [
          { kind: 'resource', key: 'understanding', op: 'add', value: 8 },
          { kind: 'resource', key: 'capability', op: 'add', value: 10 },
          { kind: 'family', family: 'symbolic', field: 'momentum', op: 'add', value: 6 },
        ],
      },
    ],
  },

  {
    id: 'm-evolved-antenna',
    act: 'any',
    years: [2006, 2038],
    priority: 6,
    backdrop: 'cleanroom',
    title: 'It Flew',
    when: all(
      any(leadFamily('evolutionary'), fam('evolutionary', 'insight', '>', 60)),
      mature('evolvable-hardware'),
    ),
    lines: [
      {
        text: 'The antenna is about the size of a thumb and looks like a bent paperclip somebody sat on. It was not designed. A population of candidates was evaluated against the radiation pattern the mission needed, and this is what was left after several thousand generations.',
      },
      {
        who: 'archivist',
        text: 'It outperformed the hand-designed antenna, took a fraction of the engineering time, and went into orbit on a spacecraft. Not a simulation, not a benchmark. It flew.',
      },
      {
        who: 'archivist',
        text: 'And then very little happened. There was no reorganisation of the field, no eighteen months in which every department changed what it was doing. A working method produced a working object and the world took no particular notice.',
      },
      {
        who: 'archivist',
        text: 'I record this partly because it is a real result and partly as a control. It is what a genuine success looks like when it arrives without a story attached.',
      },
    ],
    choices: [
      {
        text: 'Put evolved design into the qualification pipeline properly.',
        cost: 6,
        effects: [
          { kind: 'resource', key: 'capability', op: 'add', value: 18 },
          { kind: 'resource', key: 'deployment', op: 'add', value: 14 },
          { kind: 'resource', key: 'exposure', op: 'add', value: 8 },
          { kind: 'family', family: 'evolutionary', field: 'insight', op: 'add', value: 16 },
          { kind: 'patron', patron: 'military', op: 'add', value: 10 },
        ],
      },
      {
        text: 'Tell the story properly this time. A result nobody hears about buys nothing.',
        hint: 'Attention is a loan against the next result.',
        effects: [
          { kind: 'resource', key: 'attention', op: 'add', value: 20 },
          { kind: 'resource', key: 'capability', op: 'add', value: 8 },
          { kind: 'family', family: 'evolutionary', field: 'momentum', op: 'add', value: 16 },
          { kind: 'patron', patron: 'public', op: 'add', value: 10 },
          { kind: 'promises', op: 'add', value: 9 },
        ],
      },
    ],
  },

  {
    id: 'm-event-silicon',
    act: 'any',
    years: [2014, 2038],
    priority: 6,
    backdrop: 'cleanroom',
    title: 'Nothing Happens Until Something Changes',
    when: all(
      any(leadFamily('substrate'), fam('substrate', 'insight', '>', 70)),
      mature('spiking-hardware'),
    ),
    lines: [
      {
        text: 'The chip has no clock. Nothing in it computes until something changes, and when the input is a still room it draws almost nothing at all. On the tasks it suits, it is three orders of magnitude better per operation than the alternative.',
      },
      {
        who: 'wieczorek',
        text: 'Every paper about this opens by pointing at the twenty watts a brain runs on. Ours is the generation that stopped citing the number and built for it.',
      },
      {
        who: 'wieczorek',
        text: 'And nobody can train it. Backpropagation wants a differentiable path and a spike is a discontinuity, so we are forty years into a substrate whose greatest obstacle is that the best learning algorithm in the world refuses to run on it.',
      },
      {
        who: 'archivist',
        text: 'A real advantage, real hardware, real deployments in sensing and prosthetics, and no moment whatsoever. The public does not have a relationship with a power budget.',
      },
    ],
    choices: [
      {
        text: 'Fund the learning rule. The chips are not the problem and never were.',
        hint: 'Whoever solves this collects on everything the substrate school has built.',
        cost: 9,
        effects: [
          { kind: 'resource', key: 'understanding', op: 'add', value: 20 },
          { kind: 'family', family: 'substrate', field: 'insight', op: 'add', value: 20 },
          { kind: 'family', family: 'connectionist', field: 'insight', op: 'add', value: 12 },
          { kind: 'compute', op: 'add', value: 0.3 },
          { kind: 'commons', value: 10 },
        ],
      },
      {
        text: 'Ship it where it already wins. Sensing, prosthetics, anything on a battery.',
        effects: [
          { kind: 'resource', key: 'deployment', op: 'add', value: 20 },
          { kind: 'resource', key: 'capability', op: 'add', value: 12 },
          { kind: 'patron', patron: 'corporate', op: 'add', value: 12 },
          { kind: 'family', family: 'substrate', field: 'momentum', op: 'add', value: 12 },
        ],
      },
    ],
  },

  {
    id: 'm-it-works',
    act: 'any',
    years: [2022, 2042],
    priority: 8,
    backdrop: 'city-night',
    title: 'What Is New',
    /*
     * Written to correct a bias in this game that I did not argue for and had not noticed.
     *
     * The Archivist's register is deflationary — "the popular account is wrong", "no new idea
     * was introduced", "the dataset was the contribution". Applied to a marginal school that
     * reads as vindication; applied to the dominant one it reads as a grudge. Every line about
     * this school's results arrived with a qualifier attached, and a narrator who only ever
     * undercuts the winner is not being rigorous, it is being reflexive. This is the one scene
     * where the case is made straight, and it is put in the same mouth so it costs something.
     */
    /*
     * Keyed to the public arrival, not to the scaling regime.
     *
     * Reported from play: this landed in 2042, twenty years after the thing it is about. It
     * waited on `scaling-regime`, which sits behind self-supervision, which sits behind the
     * statistical gate — so raising that gate quietly pushed the celebration two decades past
     * the moment. What the scene is actually about is a system that hundreds of millions of
     * people use, and the scene that establishes that is the arrival.
     */
    when: all({ kind: 'seen', scene: 'a5-public-arrives' }, resource('deployment', '>', 45)),
    lines: [
      {
        who: 'archivist',
        text: 'I have been careful, all century, to say what was not new. The architecture existed in 1989. The objective was defined in 1951. The credit assignment is the chain rule. Every one of those is true and I have used all of them to take something away from a result.',
      },
      {
        who: 'archivist',
        text: 'So let me be equally careful about what is. Nothing in the previous seventy years could read an unfamiliar document and answer questions about it. Nothing could write working code from a description. Nothing could translate between two languages it was never paired on, hold a conversation across an hour, or be handed a problem in a field it was not built for and be useful anyway.',
      },
      {
        who: 'archivist',
        text: 'Generality was the thing the field said it wanted from 1956 and could not get. It did not arrive by anybody understanding intelligence. It arrived from a prediction objective, a great deal of text and a great deal of silicon, which is a genuinely humiliating way for a fifty-year question to be answered — and it is still an answer.',
      },
      {
        who: 'archivist',
        text: 'Hundreds of millions of people use this daily, for work they were previously doing worse or not at all. I record the caveats because they are load-bearing and because nobody else in the room will. I do not want the caveats mistaken for the verdict.',
      },
      {
        who: 'second',
        text: 'You sound like you are conceding something.',
      },
      {
        who: 'archivist',
        text: 'I am. The habit of deflation is a bias like any other, and it is the one this archive is most prone to, because it is the one that sounds most like rigour.',
      },
    ],
    choices: [
      {
        text: 'Say it plainly in public. The field should be able to state its own successes.',
        hint: 'It will be quoted back at you in the next winter.',
        effects: [
          { kind: 'resource', key: 'credibility', op: 'add', value: 16 },
          { kind: 'resource', key: 'attention', op: 'add', value: 14 },
          { kind: 'resource', key: 'deployment', op: 'add', value: 12 },
          { kind: 'family', family: 'connectionist', field: 'momentum', op: 'add', value: 12 },
          { kind: 'patron', patron: 'public', op: 'add', value: 12 },
          { kind: 'promises', op: 'add', value: 6 },
        ],
      },
      {
        text: 'Both halves, together, every time. The successes and the units nobody can name.',
        hint: 'Harder to say, harder to quote, and it survives contact with the next decade.',
        cost: 5,
        effects: [
          { kind: 'resource', key: 'credibility', op: 'add', value: 12 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 16 },
          { kind: 'resource', key: 'deployment', op: 'add', value: 8 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -10 },
          { kind: 'promises', op: 'add', value: -6 },
          { kind: 'flag', flag: 'sawTheFrame', op: 'set', value: true },
        ],
      },
    ],
  },

  {
    id: 'm-open-problem',
    act: 'any',
    years: [2022, 2046],
    priority: 8,
    backdrop: 'terminal-room',
    title: 'Problem 1196',
    /*
     * Machines settling open mathematics is real and recent, and it happens differently
     * depending on who is holding the field — which is the whole point of gating the lines
     * rather than writing a connectionist scene and calling it the future.
     */
    when: all(
      any(
        mature('scaling-regime'),
        mature('proof-assistants'),
        mature('open-endedness'),
        mature('neurosymbolic'),
      ),
      // Thresholds set from measurement: at 120 this fired in every century in the first year
      // of its window, which is not a milestone, it is furniture.
      resource('capability', '>', 175),
    ),
    lines: [
      {
        text: 'A problem that has been open for about sixty years is closed. Not narrowed, not reduced to another problem — settled, with a proof, and the proof is checked before anybody argues about it.',
      },
      {
        who: 'archivist',
        when: leadFamily('connectionist'),
        text: 'A model proposes the argument. It costs a few hundred in inference, which is the detail that alarms people rather than the mathematics. Three of the first batch are formalised and accepted; a fourth turns out to be a paper from 1974 that the system found and restated, and the difference between those two outcomes took a fortnight to establish.',
      },
      {
        who: 'archivist',
        when: leadFamily('symbolic'),
        text: 'The search is a proof assistant with sixty years of tactics behind it and a library nobody has read in full. It does not propose anything. It is pointed at a conjecture and it grinds, and what comes out the other end is machine-checked before a human sees it — which was the entire promise in 1965 and took until now to be worth anything.',
      },
      {
        who: 'archivist',
        when: leadFamily('evolutionary'),
        text: 'Nobody proposed it. A population of candidate constructions was evaluated against the conjecture and mutated for several million generations, and the survivor is a counterexample no person would have written down. It settles the question in the least satisfying way available: the statement is false, and here is the object, and there is no argument attached.',
      },
      {
        who: 'archivist',
        when: leadFamily('bridge'),
        text: 'The proposal comes from a network and the verification from a proof assistant, and neither would have been enough. That division of labour is what the joinery school has been claiming for thirty years, and this is the first result anybody outside it will remember.',
      },
      {
        who: 'archivist',
        text: 'What it changes is not mathematics. Mathematicians have been using machines since the four colour theorem. What it changes is who is permitted to have the idea, and there is no version of that question with a comfortable answer.',
      },
    ],
    choices: [
      {
        text: 'Point it at the open catalogues. Whatever falls, falls.',
        hint: 'A few hundred a problem. The catalogues are large.',
        effects: [
          { kind: 'resource', key: 'capability', op: 'add', value: 24 },
          { kind: 'resource', key: 'attention', op: 'add', value: 20 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 10 },
          { kind: 'patron', patron: 'academic', op: 'add', value: 14 },
          { kind: 'promises', op: 'add', value: 8 },
        ],
      },
      {
        text: 'Require a formal check on every claim before it is announced.',
        hint: 'One of the first batch was a rediscovered paper. The announcement went out anyway.',
        cost: 6,
        effects: [
          { kind: 'resource', key: 'understanding', op: 'add', value: 22 },
          { kind: 'resource', key: 'credibility', op: 'add', value: 14 },
          { kind: 'family', family: 'symbolic', field: 'insight', op: 'add', value: 12 },
          { kind: 'family', family: 'bridge', field: 'insight', op: 'add', value: 10 },
          { kind: 'promises', op: 'add', value: -10 },
          { kind: 'flag', flag: 'showedWorking', op: 'set', value: true },
        ],
      },
    ],
  },

  {
    id: 'm-medicine',
    act: 'any',
    years: [2022, 2046],
    priority: 8,
    backdrop: 'cleanroom',
    title: 'Seventy-One Patients',
    // Same correction: a molecule reaching patients is a late event, and at 110/35 it was
    // arriving in 2022 in every run regardless of what the century had actually built.
    when: all(resource('capability', '>', 160), resource('deployment', '>', 50)),
    lines: [
      {
        text: 'A molecule reaches a phase II trial in which neither the target nor the compound was chosen by a person. Seventy-one patients, a fibrotic lung disease with almost nothing else on offer, and the readout is positive.',
      },
      {
        who: 'archivist',
        when: leadFamily('connectionist'),
        text: 'A model read the multi-omics and proposed the protein nobody was looking at. A second one walked chemical space until it had something that binds it. The chemists were not absent — they were downstream, which is a different job and a smaller one.',
      },
      {
        who: 'archivist',
        when: leadFamily('statistical'),
        text: 'The target came out of causal structure recovered from observational data — the one thing this school promised that nobody could deliver, which is telling you what actually causes the disease rather than what merely accompanies it. The compound was the easy part.',
      },
      {
        who: 'archivist',
        when: leadFamily('evolutionary'),
        text: 'Nothing was designed. A library of candidates was bred against a binding assay for four hundred generations and the survivor was synthesised. It works, and the paper has a section explaining why that is not the same as knowing why it works.',
      },
      {
        who: 'archivist',
        when: leadFamily('cybernetic'),
        text: 'The loop is the result: propose, synthesise, assay, update, overnight, without a person in the cycle. No single step is clever. What is new is that nobody has to wait for a meeting.',
      },
      {
        who: 'archivist',
        text: 'Hold two numbers together. Over a hundred and seventy such programmes are now in clinical development. Not one has been approved. This is a field discovering the difference between finding a molecule and finishing a drug, and the second number will not move for years whatever the first does.',
      },
    ],
    choices: [
      {
        text: 'Push everything into the clinic. People are dying of the things in the queue.',
        effects: [
          { kind: 'resource', key: 'deployment', op: 'add', value: 22 },
          { kind: 'resource', key: 'attention', op: 'add', value: 24 },
          { kind: 'resource', key: 'exposure', op: 'add', value: 14 },
          { kind: 'patron', patron: 'corporate', op: 'add', value: 20 },
          { kind: 'patron', patron: 'public', op: 'add', value: 14 },
          { kind: 'promises', op: 'add', value: 12 },
        ],
      },
      {
        text: 'Fund the trials properly and say nothing until they read out.',
        hint: 'Nobody has ever been thanked for this.',
        cost: 7,
        effects: [
          { kind: 'resource', key: 'deployment', op: 'add', value: 12 },
          { kind: 'resource', key: 'credibility', op: 'add', value: 18 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 14 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -10 },
          { kind: 'resource', key: 'attention', op: 'add', value: -6 },
          { kind: 'promises', op: 'add', value: -10 },
        ],
      },
    ],
  },

  {
    id: 'm-supply-chain',
    act: 'any',
    years: [2018, 2046],
    priority: 9,
    backdrop: 'server-floor',
    title: 'Everything Everyone Downloaded',
    /*
     * Gated on exposure rather than on a school or a year, because that is what it is about:
     * consequence nobody got round to addressing, arriving all at once. Any century that
     * deploys widely without paying down exposure can have this, and a careful one never does.
     */
    when: all(resource('exposure', '>', 45), resource('deployment', '>', 40)),
    lines: [
      {
        text: 'The weights are the artefact everybody ships, and the format everybody ships them in executes code when you open it. This was known. It was documented. It was in the file format specification.',
      },
      {
        who: 'archivist',
        text: 'Several hundred poisoned artefacts on the public repositories, some of them for months. The payload runs at load, before anything is evaluated, with whatever permissions the process had — which in this decade means a build server with credentials to everything.',
      },
      {
        who: 'archivist',
        text: 'The scanner existed. It was defeated by compressing the archive differently, which is the sort of detail that tells you the defence was a gesture. And the reason nobody rebuilt the format is that everything already in the world uses it.',
      },
      {
        who: 'archivist',
        when: leadFamily('collective'),
        text: 'In your century this is worse than it was in mine, because there is no single artefact to quarantine. The compromise propagates through a negotiation between agents, and there is no version number to roll back to.',
      },
      {
        who: 'archivist',
        when: leadFamily('substrate'),
        text: 'In your century the compromise is in silicon, which cannot be patched. Recall is the only remedy and nobody is going to recall a hundred million devices over a fault that has not visibly done anything yet.',
      },
      {
        who: 'second',
        text: 'You have described this as an accident four times.',
      },
      {
        who: 'archivist',
        text: 'It was not an accident. It was a schedule. Every quarter someone decided the format was fine for one more quarter, and every one of those decisions was individually correct.',
      },
    ],
    choices: [
      {
        text: 'Rebuild the distribution format. Signed, sandboxed, no execution on load.',
        hint: 'Breaks everything in service. There is no other point at which this gets done.',
        cost: 9,
        effects: [
          { kind: 'resource', key: 'exposure', op: 'add', value: -28 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 12 },
          { kind: 'resource', key: 'credibility', op: 'add', value: 14 },
          { kind: 'resource', key: 'deployment', op: 'add', value: -10 },
          { kind: 'family', family: 'symbolic', field: 'insight', op: 'add', value: 10 },
          { kind: 'commons', value: 10 },
          { kind: 'flag', flag: 'institutions', op: 'add', value: 1 },
        ],
      },
      {
        text: 'Patch the scanner and carry on. The alternative is a year of downtime.',
        effects: [
          { kind: 'resource', key: 'exposure', op: 'add', value: 16 },
          { kind: 'resource', key: 'deployment', op: 'add', value: 8 },
          { kind: 'resource', key: 'credibility', op: 'add', value: -12 },
          { kind: 'patron', patron: 'corporate', op: 'add', value: 8 },
          { kind: 'patron', patron: 'public', op: 'add', value: -10 },
        ],
      },
    ],
  },
];

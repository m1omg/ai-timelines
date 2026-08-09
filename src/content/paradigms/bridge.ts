import type { Paradigm } from '../../engine/types';

/**
 * Bridge nodes are the payoff for a broad portfolio: nearly all of them carry familyPrereqs
 * requiring genuine insight in two schools at once. A player who backs a single winner will
 * find this entire column locked, which is the point the game is making.
 */
export const BRIDGE: Paradigm[] = [
  {
    id: 'fuzzy-logic',
    family: 'bridge',
    name: 'Fuzzy Logic',
    short: 'Degrees of truth, not degrees of belief',
    earliest: 1965,
    prereqs: [],
    cost: 34,
    computeNeed: 5,
    capability: 5,
    understanding: 10,
    hype: 16,
    brittleness: 0.35,
    anchor: { year: 1965, who: 'Lotfi Zadeh' },
    codex:
      'Zadeh’s objection was that "tall" and "hot" are not uncertain propositions, they are vague ones, and probability is the wrong tool for vagueness. Set membership becomes a matter of degree. Western academia largely dismissed it as muddled; Japanese industry read the same papers and put it in cameras, washing machines and the braking system of the Sendai subway.',
    tags: ['commercial'],
  },
  {
    id: 'fuzzy-control',
    family: 'bridge',
    name: 'Fuzzy Control',
    short: 'Expert rules that degrade gracefully',
    earliest: 1974,
    prereqs: ['fuzzy-logic'],
    cost: 40,
    computeNeed: 6,
    capability: 9,
    understanding: 8,
    hype: 22,
    brittleness: 0.3,
    anchor: { year: 1974, who: 'Ebrahim Mamdani; the Sendai subway, 1987' },
    codex:
      'A handful of linguistic rules — if the speed error is slightly positive and rising, brake gently — interpolated smoothly, controlling a plant nobody has a differential equation for. It is an expert system that does not shatter at its boundaries, which is precisely what the symbolic school could not manage, achieved by giving up on truth values.',
    tags: ['commercial', 'durable'],
  },
  {
    id: 'sparse-distributed-memory',
    family: 'bridge',
    name: 'Sparse Distributed Memory',
    short: 'Addresses that tolerate being wrong',
    earliest: 1988,
    prereqs: [],
    familyPrereqs: { connectionist: 20 },
    cost: 46,
    computeNeed: 8,
    capability: 6,
    understanding: 14,
    hype: 8,
    brittleness: 0.2,
    anchor: { year: 1988, who: 'Pentti Kanerva' },
    codex:
      'In a space of ten thousand dimensions almost every pair of random points is almost exactly equidistant, so a memory addressed by approximate match is robust in ways low-dimensional intuition forbids. Kanerva built a model of human long-term memory out of that geometry, and in doing so laid the groundwork for representing symbols as vectors without losing the ability to compose them.',
    tags: ['theory'],
  },
  {
    id: 'neuro-fuzzy',
    family: 'bridge',
    name: 'Neuro-Fuzzy Systems',
    short: 'Learn the rules; keep them readable',
    earliest: 1993,
    prereqs: ['fuzzy-control'],
    familyPrereqs: { connectionist: 25 },
    cost: 52,
    computeNeed: 10,
    capability: 10,
    understanding: 12,
    hype: 14,
    brittleness: 0.25,
    anchor: { year: 1993, who: 'Jang — ANFIS' },
    codex:
      'Express a fuzzy rule base as a layered network and you can train its membership functions by gradient descent, then read the trained system back out as rules a human can inspect and argue with. It is the first commercially significant system that both learned from data and explained itself, and it arrived while both parent schools were in disgrace.',
    tags: ['interpretable', 'commercial'],
  },
  {
    id: 'vector-symbolic',
    family: 'bridge',
    name: 'Vector Symbolic Architectures',
    short: 'Structure encoded in high-dimensional vectors',
    earliest: 1994,
    prereqs: ['sparse-distributed-memory'],
    cost: 60,
    computeNeed: 11,
    capability: 8,
    understanding: 18,
    hype: 8,
    brittleness: 0.15,
    anchor: { year: 1994, who: 'Tony Plate — holographic reduced representations' },
    codex:
      'Binding and superposition as arithmetic on long vectors: bind a role to a filler, add the pairs together, and recover any component by unbinding — a whole symbolic structure held in one fixed-width vector, degraded but decodable. It answers the objection that neural representations cannot be compositional, and it answered it in 1994 to an audience of roughly nobody.',
    tags: ['theory', 'long-shot'],
  },
  {
    id: 'hyperdimensional-computing',
    family: 'bridge',
    name: 'Hyperdimensional Computing',
    short: 'Symbols the hardware can actually hold',
    earliest: 2009,
    prereqs: ['vector-symbolic'],
    familyPrereqs: { substrate: 40 },
    cost: 72,
    computeNeed: 15,
    capability: 12,
    understanding: 16,
    hype: 12,
    brittleness: 0.2,
    anchor: { year: 2009, who: 'Kanerva — hyperdimensional computing' },
    codex:
      'The same algebra, now noticed by hardware people: operations are element-wise, tolerant of bit failures, and map beautifully onto in-memory and neuromorphic substrates. It offers the one thing the field had stopped hoping for — representations that are simultaneously learnable, composable, and cheap in silicon.',
  },
  {
    id: 'differentiable-programming',
    family: 'bridge',
    name: 'Differentiable Programming',
    short: 'Classical structures with gradients through them',
    earliest: 2014,
    prereqs: [],
    familyPrereqs: { connectionist: 50, symbolic: 30 },
    cost: 80,
    computeNeed: 17,
    capability: 16,
    understanding: 14,
    hype: 20,
    brittleness: 0.3,
    anchor: { year: 2014, who: 'the neural Turing machine and its successors' },
    codex:
      'If a stack, a memory, a renderer or a physics engine can be written so that it is differentiable, it can be dropped into a network and trained end to end along with everything else. It reframes the whole argument: the question stops being whether to use structure and becomes which structures are worth the loss of flexibility.',
    tags: ['pivotal'],
  },
  {
    id: 'world-models',
    family: 'bridge',
    name: 'Learned World Models',
    short: 'Imagine the consequence before acting',
    earliest: 2018,
    prereqs: ['differentiable-programming'],
    familyPrereqs: { cybernetic: 45 },
    cost: 88,
    computeNeed: 20,
    capability: 22,
    understanding: 14,
    hype: 26,
    brittleness: 0.35,
    anchor: { year: 2018, who: 'the world-model line of work' },
    codex:
      'Learn a compressed generative model of how the environment evolves, then do the expensive part of planning inside it — cheaply, safely, and as fast as you can run the simulation. It restores to model-free learning the thing it threw away in 1989, and it makes an agent’s beliefs about the world into an object you can actually inspect.',
    tags: ['interpretable'],
  },
  {
    id: 'neurosymbolic',
    family: 'bridge',
    name: 'Neurosymbolic Integration',
    short: 'Perception that learns, reasoning that holds',
    earliest: 2019,
    prereqs: ['differentiable-programming'],
    familyPrereqs: { symbolic: 45, connectionist: 55 },
    cost: 92,
    computeNeed: 21,
    capability: 26,
    understanding: 26,
    hype: 24,
    brittleness: 0.2,
    anchor: { year: 2019, who: 'the neurosymbolic programme' },
    codex:
      'Networks are superb at perception and unreliable at multi-step inference; symbolic engines are the reverse, and have been for sixty years. Systems that let a learned front end propose and a formal back end verify get the strengths of both — at the cost of an interface between them that nobody has yet made clean, and a great deal of engineering that neither camp finds intellectually satisfying.',
    tags: ['pivotal', 'interpretable'],
  },
  {
    id: 'verified-learning',
    family: 'bridge',
    name: 'Verified Learning Systems',
    short: 'Guarantees that survive the training run',
    earliest: 2028,
    prereqs: ['neurosymbolic'],
    familyPrereqs: { statistical: 45 },
    cost: 84,
    computeNeed: 24,
    capability: 24,
    understanding: 36,
    hype: 12,
    brittleness: 0.05,
    anchor: { year: 2028, who: '' },
    codex:
      'A learned component wrapped in a formally specified envelope, where the proof covers the composite and not merely the wrapper. It is slower, more expensive, and less capable than the unconstrained alternative in every benchmark — and it is the only kind of system anyone has been able to insure.',
    tags: ['speculative', 'governance'],
  },
  {
    id: 'compositional-semantics',
    family: 'bridge',
    name: 'Compositional Foundations',
    short: 'A mathematics of how parts combine',
    earliest: 2030,
    prereqs: ['verified-learning', 'hyperdimensional-computing'],
    cost: 92,
    computeNeed: 25,
    capability: 30,
    understanding: 44,
    hype: 10,
    brittleness: 0.05,
    anchor: { year: 2032, who: '' },
    codex:
      'Not a better model but a better account of what models are: a formalism in which the composition of two systems has properties derivable from theirs, so that a large machine can be reasoned about from its parts. The field had lived for eighty years without one, and had been building things it could only test.',
    tags: ['speculative', 'theory'],
  },
  {
    id: 'grand-synthesis',
    family: 'bridge',
    name: 'The Synthesis',
    short: 'Every school right about its own half',
    earliest: 2030,
    prereqs: ['compositional-semantics'],
    familyPrereqs: {
      symbolic: 42,
      connectionist: 42,
      statistical: 42,
      cybernetic: 38,
      substrate: 38,
    },
    cost: 120,
    computeNeed: 26.5,
    capability: 60,
    understanding: 60,
    hype: 30,
    brittleness: 0.05,
    anchor: { year: 2038, who: '' },
    codex:
      'Not the victory of a paradigm but the end of paradigms: an architecture in which learned perception, formal inference, probabilistic belief, embodied control and the physics of the substrate are aspects of one design rather than rival accounts of it. Eight schools spent ninety years each proving the others incomplete. All of them were right.',
    tags: ['speculative', 'endgame'],
  },
  {
    id: 'coding-agents',
    family: 'bridge',
    name: 'Coding Agents',
    short: 'It writes, the tools check, it reads the result',
    earliest: 2024,
    prereqs: ['self-supervision'],
    /*
     * The connectionist and statistical halves arrive with `self-supervision`. The symbolic
     * requirement is the point of the node: what makes one of these reliable is not the model
     * but everything around it — a parser that rejects malformed calls, a type checker, a test
     * runner, a diff algorithm. Without a symbolic tradition to draw on there is nothing for the
     * proposals to be checked against, and the thing is a very fast way to write plausible code.
     *
     * 30 is deliberately near the median: symbolic insight in the 2020s runs p10=6, p25=15,
     * median=35 across 400 measured centuries, so a run that kept the school alive passes and
     * one that let it die does not. That is the distinction the requirement is for, and it is
     * meant to bite.
     */
    familyPrereqs: { symbolic: 30 },
    /*
     * Cheap, because it is engineering rather than science: the model is somebody else's, the
     * parser and the test runner are decades old, and the work is the loop between them. Costed
     * at 60 it never matured once in 900 games — self-supervision lands late enough that a node
     * of that size cannot finish before 2050, however hard it is pushed.
     */
    cost: 34,
    /*
     * Below the scaling regime, not above it. The first draft asked for 10^24 — more compute
     * than the very node this one depends on — which made it unreachable in practice: it never
     * fired once across 900 measured games. What runs here is inference against a model somebody
     * else already trained, plus a great deal of tool-calling, and that is cheaper than the
     * training run, not dearer.
     */
    computeNeed: 21.5,
    capability: 26,
    understanding: 6,
    hype: 34,
    brittleness: 0.42,
    anchor: { year: 2023, who: 'SWE-bench — Jimenez et al., measuring repository-scale edits' },
    codex:
      'The first application where the statistical machinery earns its keep by being wrapped in the machinery the symbolic school spent seventy years building. The model proposes an edit; a parser decides whether it is even syntax, a type checker decides whether it is coherent, a test suite decides whether it does what was asked, and the loop runs again on the failure. None of the checking is learned and none of the proposing is formal, which is why neither school can claim it. It is also the first competence the field built that improves the field itself, which is a different kind of arrival from anything before it — and the reason understanding rises so little here is that nobody can say why the proposals are good, only that the checks pass.',
    tags: ['agentic', 'commercial'],
  },

  {
    id: 'translatable-competence',
    family: 'bridge',
    name: 'Translatable Competence',
    short: 'Move a skill between paradigms without retraining it',
    earliest: 2042,
    prereqs: ['compositional-semantics'],
    cost: 150,
    computeNeed: 25,
    capability: 28,
    understanding: 30,
    hype: 20,
    brittleness: 0.3,
    anchor: { year: 2042, who: '' },
    codex:
      'A century of the field produced competences locked to their substrate: what a network knows is in its weights, what a rule base knows is in its assertions, what an embodied system knows is in a body. Translation between them was always possible in principle and never once economic. Doing it properly means an interlingua for competence itself — and the moment one exists, the argument this whole century was about becomes a question of engineering convenience rather than of what a mind is.',
    tags: ['speculative'],
  },
];

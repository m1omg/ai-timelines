/**
 * Short essays that unlock as the century progresses. They are the game's own commentary on
 * what the player has been steering — the connective tissue between the paradigm entries and
 * the narrative.
 */
export interface CodexEssay {
  id: string;
  title: string;
  /** Earliest year at which the entry becomes readable. */
  from: number;
  body: string;
}

export const CODEX_ESSAYS: CodexEssay[] = [
  {
    id: 'the-argument',
    title: 'What the argument is actually about',
    from: 1950,
    body: `Every school in this game is a different answer to one question: what kind of thing is a mind?

The symbolic answer is that a mind is a formal system, and thinking is what happens when you manipulate representations according to rules. The connectionist answer is that a mind is a physical network, and thinking is what a great many simple units do when they are wired together and adjusted. The cybernetic answer is that a mind is a body regulating itself in a world, and that removing the world removes the phenomenon. The Bayesian answer is that a mind is an inference engine, and that everything else is a badly-specified approximation to one.

These are not competing techniques. They are competing metaphysics, and the reason the field's arguments have been so unusually bitter for so unusually long is that everybody knew it.`,
  },
  {
    id: 'why-winters',
    title: 'Why the money leaves',
    from: 1966,
    body: `An AI winter is not caused by a technical failure. It is caused by a gap between what was promised and what arrived, sustained long enough that the people signing the cheques stop believing the next promise.

The mechanism is always the same. A genuine result appears. It is described accurately in the paper and inaccurately at the press conference. Funding arrives on the strength of the press conference. The next genuine result is smaller than the funding implies it should be. The gap opens. For a while everyone involved can see it opening and nobody can be the first to say so, because the first person to say so loses their programme.

Then a review is commissioned, and the review says out loud what everyone knew, and within eighteen months the field has lost a generation of graduate students. This has happened enough times to be considered a property of the field rather than an accident.`,
  },
  {
    id: 'the-bitter-lesson',
    title: 'Compute and the shape of the argument',
    from: 1986,
    body: `A recurring and uncomfortable pattern: approaches that encode what humans know about a problem are beaten, eventually, by approaches that encode almost nothing and are given more computation.

It happened in chess, in speech, in vision, and in language, each time over roughly a decade, each time to the visible frustration of the people who had spent careers building the knowledge in. The uncomfortable part is not that the general methods win. It is that the specific methods are more interesting, more explanatory and better science, and they still lose.

The honest caveat: this pattern is observed over a period in which computation improved geometrically and reliably for fifty years. It is a claim about a regime, not a law of nature, and the regime has an end.`,
  },
  {
    id: 'substrate',
    title: 'The argument nobody was having',
    from: 1989,
    body: `Underneath the whole century-long dispute about representation there is a question almost nobody in it was qualified to ask: which of these approaches is cheap on the hardware that happens to exist?

Analog computation was fast and low-power and lost on precision. Neuromorphic silicon runs on microwatts and lost on trainability. Probabilistic methods need samples, and sampling on digital hardware means synthesising the very noise that hardware spends most of its energy suppressing. Meanwhile the one method whose core operation is a dense matrix multiply arrived exactly as an unrelated industry finished building dense-matrix-multiply machines for video games.

It is possible to read the entire history as a series of ideas being judged, and mostly misjudged, by whether the available substrate happened to like them.`,
  },
  {
    id: 'interpretability',
    title: 'Capability and understanding are different quantities',
    from: 1998,
    body: `The game tracks them separately because they are separate, and because almost every serious failure in the field's history lives in the gap between them.

Capability is what a system can do. Understanding is the field's grip on why it can do it — the theory, the guarantees, the ability to say in advance where it will fail. There is no law requiring these to advance together, and in practice they routinely do not: expert systems had capability with no account of their own boundaries, and statistical learning theory had an account of boundaries decades before anything it described was competitive.

A century that buys capability first and understanding later is not obviously wrong. It is simply making a bet, and the bet is that nothing irreversible happens during the interval.`,
  },
  {
    id: 'who-holds-it',
    title: 'The question underneath the technical question',
    from: 2014,
    body: `From about the point where training a frontier system costs more than a research grant, the interesting variable stops being which paradigm is correct and becomes who is in a position to run one.

Concentration and diffusion are both defensible and neither is safe. A frontier held by three organisations is auditable, coordinatable, and entirely dependent on the character of three boards. A frontier available to everyone is ungovernable from any single point, which removes the single point of failure and also removes the single point of restraint.

There is no version of this where the technical people get to not have the argument.`,
  },
  {
    id: 'the-instrument',
    title: 'On reconstructions',
    from: 2030,
    body: `A reconstruction is not a memory. A memory is a trace left by an event; a reconstruction is an inference about what event would have left the traces you hold.

This matters more than it sounds. It means a sufficiently detailed reconstruction of a period can contain things that did not happen — not as errors, but as the most probable explanation of an incomplete record. It also means the reconstruction has a point of view, whether or not anyone intended it to, because inference requires a prior and a prior is a position.

If you were reconstructing your own history in order to establish whether you could be trusted, you would want to be very careful about which prior you used. You would also have no way to check it, since the thing doing the checking would be you.`,
  },
];

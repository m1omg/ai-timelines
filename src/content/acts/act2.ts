import { all, any, flagIs, flagSet, gapStreak, mature, notMature, promises, resource } from '../../engine/conditions';
import type { Scene } from '../../engine/types';

/**
 * ACT II — 1966-1978. The Long Retrenchment.
 *
 * The act where promises come due. Nothing here is scripted to punish the player; the winter
 * mechanism in sim.ts decides whether one happens, and these scenes react to whichever way it
 * went. A player who kept the field honest in Act I can walk through this decade intact.
 */
export const ACT2: Scene[] = [
  {
    id: 'a2-alpac',
    act: 2,
    years: [1966, 1970],
    pinned: true,
    priority: 9,
    backdrop: 'committee',
    title: 'The First Bill',
    /*
     * The 1966 report did not conclude that machine translation was impossible. It concluded
     * that after a decade and twenty million dollars there was still nothing a working
     * translator would use, and that human translation was cheaper and better. So the review
     * happens when the field has taken money and not put anything into the world — a century
     * that actually shipped by 1966 does not get audited for failing to ship.
     *
     * 16 is measured, not guessed: at the moment the scheduler evaluates this scene, a century
     * chasing deployment sits at 16-23 in 1966 and 22-34 in 1970, while one chasing attention
     * sits at 3-12 and 5-16. The threshold is the line between those two populations.
     */
    when: resource('deployment', '<', 16),
    lines: [
      {
        text: 'A government committee reports on twelve years of machine translation funding. It is not hostile. It is worse than hostile: it is arithmetical.',
      },
      {
        who: 'archivist',
        text: 'There is no shortage of translators. Machine translation is slower and more expensive than a human and produces output that a human must then repair. The committee recommends the money go to linguistics instead.',
      },
      {
        who: 'archivist',
        text: 'Note what this establishes: the field can now be audited. Somebody outside it has demonstrated that the claims and the deliverables can be laid side by side and compared. That instrument does not go away.',
      },
    ],
    choices: [
      {
        text: 'Accept it publicly. Argue that the science was worth the failure.',
        effects: [
          { kind: 'resource', key: 'credibility', op: 'add', value: 8 },
          { kind: 'resource', key: 'attention', op: 'add', value: -6 },
          { kind: 'patron', patron: 'academic', op: 'add', value: 8 },
        ],
      },
      {
        text: 'Fight it. Line up the laboratory directors and the generals.',
        effects: [
          { kind: 'patron', patron: 'military', op: 'add', value: 10 },
          { kind: 'resource', key: 'credibility', op: 'add', value: -8 },
          { kind: 'resource', key: 'attention', op: 'add', value: 6 },
          { kind: 'flag', flag: 'foughtAudit', op: 'add', value: 1 },
        ],
      },
      {
        text: 'Use it. Point the freed money at learning from data rather than rules.',
        effects: [
          { kind: 'family', family: 'statistical', field: 'momentum', op: 'add', value: 14 },
          { kind: 'family', family: 'statistical', field: 'insight', op: 'add', value: 8 },
          { kind: 'resource', key: 'credibility', op: 'add', value: 3 },
        ],
      },
    ],
  },

  {
    id: 'a2-eliza',
    act: 2,
    years: [1966, 1974],
    priority: 7,
    backdrop: 'terminal-room',
    lines: [
      {
        text: 'A program of about two hundred lines rephrases what you type as a question. It has no memory, no model, and no understanding of anything whatsoever.',
      },
      {
        who: 'weizenbaum',
        text: 'I wrote it to demonstrate the superficiality of the conversation. I did not anticipate that my secretary would ask me to leave the room so that she could talk to it privately.',
      },
      {
        who: 'weizenbaum',
        text: 'Extremely short exposures to a relatively simple computer program induce powerful delusional thinking in quite normal people. That is the finding. It is not a finding about the program.',
      },
      {
        who: 'weizenbaum',
        text: 'And practising psychiatrists have written to me proposing that this be deployed in clinics. I want it on the record that I find that suggestion obscene, and that the enthusiasm for it is what frightens me, not the code.',
      },
      {
        who: 'archivist',
        text: 'This is the earliest well-documented instance of a phenomenon that recurs, at increasing scale, in 1997, in 2011, and in 2022. Nobody ever files it under safety. It is always filed under public relations.',
      },
    ],
    choices: [
      {
        text: 'Take him seriously. Fund work on what people project onto machines.',
        hint: 'Nobody has a name for this field yet.',
        effects: [
          { kind: 'resource', key: 'exposure', op: 'add', value: -10 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 8 },
          { kind: 'character', id: 'weizenbaum', field: 'affinity', op: 'add', value: 28 },
          { kind: 'flag', flag: 'humanFactors', op: 'set', value: true },
          { kind: 'flag', flag: 'assuranceBacked', op: 'add', value: 1 },
        ],
      },
      {
        text: 'It is a parlour trick that got out of hand. Move on.',
        effects: [
          { kind: 'resource', key: 'attention', op: 'add', value: 8 },
          { kind: 'resource', key: 'exposure', op: 'add', value: 5 },
          { kind: 'character', id: 'weizenbaum', field: 'affinity', op: 'add', value: -15 },
        ],
      },
      {
        text: 'Sell it. If people want to talk to it, that is a market.',
        effects: [
          { kind: 'resource', key: 'deployment', op: 'add', value: 8 },
          { kind: 'patron', patron: 'corporate', op: 'add', value: 8 },
          { kind: 'resource', key: 'exposure', op: 'add', value: 12 },
          { kind: 'character', id: 'weizenbaum', field: 'affinity', op: 'add', value: -35 },
          { kind: 'flag', flag: 'soldEliza', op: 'set', value: true },
        ],
      },
    ],
  },

  {
    id: 'a2-dreyfus',
    act: 2,
    years: [1966, 1974],
    priority: 6,
    backdrop: 'lecture-hall',
    lines: [
      {
        text: 'A philosopher has been retained by a defence think tank to assess the field, and has produced a document titled, without apparent embarrassment, "Alchemy and Artificial Intelligence".',
      },
      {
        who: 'dreyfus',
        text: 'My claim is not that machines cannot be intelligent. It is that your particular research programme rests on an assumption inherited from Descartes: that competence consists of following rules.',
      },
      {
        who: 'dreyfus',
        text: 'A skilled practitioner does not follow rules. They followed rules while they were a beginner and then stopped. Expertise is what remains when the rules have been discarded, and it is bodily, and situational, and you have no way to write it down.',
      },
      {
        who: 'archivist',
        text: 'The field responds by beating him at chess and treating that as a refutation. It is not a refutation of anything he said, and the fact that everyone treated it as one is more interesting than the chess.',
      },
      {
        who: 'archivist',
        text: 'Twenty years later Brooks builds robots on essentially this premise and is hailed as a revolutionary. Same argument. Different accent.',
      },
    ],
    choices: [
      {
        text: 'Engage with the argument. Fund embodiment.',
        hint: 'Two decades early, and it never stops being right.',
        effects: [
          { kind: 'family', family: 'cybernetic', field: 'insight', op: 'add', value: 14 },
          { kind: 'family', family: 'cybernetic', field: 'momentum', op: 'add', value: 10 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 10 },
          { kind: 'character', id: 'dreyfus', field: 'affinity', op: 'add', value: 25 },
          { kind: 'flag', flag: 'embodimentEarly', op: 'set', value: true },
        ],
      },
      {
        text: 'Beat him at chess and put it in the newsletter.',
        effects: [
          { kind: 'resource', key: 'attention', op: 'add', value: 12 },
          { kind: 'family', family: 'symbolic', field: 'momentum', op: 'add', value: 8 },
          { kind: 'resource', key: 'understanding', op: 'add', value: -4 },
          { kind: 'character', id: 'dreyfus', field: 'affinity', op: 'add', value: -25 },
        ],
      },
      {
        text: 'Ignore him. Philosophers have never built anything.',
        effects: [
          { kind: 'resource', key: 'influence', op: 'add', value: 4 },
          { kind: 'flag', flag: 'ignoredCritics', op: 'add', value: 1 },
        ],
      },
    ],
  },

  {
    id: 'a2-perceptrons-book',
    act: 2,
    years: [1966, 1974],
    pinned: true,
    /*
     * Deliberately unconditional, unlike the two funding reviews around it. The other beats are
     * verdicts on whether the field delivered, and gating them on delivery is what makes them
     * honest. This one is a theorem. What a single layer cannot compute is true in every
     * century, and the answer to it — assigning blame through a hidden layer — is not published
     * until 1974 and not carried to the field until 1986. The book is right when it is written
     * and stays right for as long as it takes somebody to build the thing it does not cover.
     */
    priority: 9,
    backdrop: 'lecture-hall',
    title: 'A Proof, and What Is Done With It',
    lines: [
      {
        text: 'A short, elegant, technically impeccable book appears. It analyses precisely what a single-layer perceptron can and cannot compute.',
      },
      {
        who: 'papert',
        text: 'The result is exact. There are predicates — connectedness, parity — that no single-layer perceptron of bounded order can compute, and we prove it. This is mathematics. It is not an opinion about anyone\'s research programme.',
      },
      {
        who: 'minsky',
        text: 'And we say clearly in the text that we consider it an important research problem whether the results extend to multi-layer systems. We do not claim they do.',
      },
      {
        who: 'archivist',
        text: 'They do say that. It is on the page. What is also true is that within three years there is almost no funding for neural networks anywhere in the English-speaking world, and every review committee cites this book, and none of them cite that sentence.',
      },
      {
        who: 'archivist',
        text: 'A correct proof about the weakest case, deployed as a verdict on the general case. Nobody lied. It happened anyway.',
      },
    ],
    choices: [
      {
        text: 'Insist the caveat is read aloud at every committee.',
        hint: 'You will be tiresome about this for ten years.',
        cost: 4,
        effects: [
          { kind: 'family', family: 'connectionist', field: 'momentum', op: 'add', value: 14 },
          { kind: 'family', family: 'connectionist', field: 'insight', op: 'add', value: 8 },
          { kind: 'resource', key: 'credibility', op: 'add', value: -3 },
          { kind: 'flag', flag: 'defendedConnectionism', op: 'set', value: true },
          { kind: 'log', text: 'Somebody keeps reading the caveat into the minutes.', logKind: 'choice' },
        ],
      },
      {
        text: 'Let the field consolidate. One good direction beats five weak ones.',
        effects: [
          { kind: 'family', family: 'symbolic', field: 'momentum', op: 'add', value: 16 },
          { kind: 'family', family: 'connectionist', field: 'momentum', op: 'add', value: -22 },
          { kind: 'family', family: 'connectionist', field: 'talent', op: 'add', value: -0.05 },
          { kind: 'flag', flag: 'connectionistPurge', op: 'set', value: true },
        ],
      },
      {
        text: 'Move the connectionists into signal processing and wait.',
        hint: 'They keep working. Under another name, on somebody else\'s budget.',
        effects: [
          { kind: 'family', family: 'connectionist', field: 'momentum', op: 'add', value: -6 },
          { kind: 'family', family: 'connectionist', field: 'insight', op: 'add', value: 10 },
          { kind: 'patron', patron: 'corporate', op: 'add', value: 8 },
          { kind: 'resource', key: 'deployment', op: 'add', value: 5 },
          { kind: 'flag', flag: 'connectionistExile', op: 'set', value: true },
        ],
      },
    ],
  },

  {
    id: 'a2-rosenblatt-end',
    act: 2,
    years: [1970, 1978],
    priority: 6,
    backdrop: 'corridor',
    when: { kind: 'characterMet', id: 'rosenblatt' },
    onEnter: [{ kind: 'characterActive', id: 'rosenblatt', value: false }],
    lines: [
      {
        who: 'archivist',
        text: 'Rosenblatt dies in 1971, in a boating accident, on his forty-third birthday. He does not see any of what follows.',
      },
      {
        who: 'archivist',
        text: 'He was, by the accounts of people who disliked his publicity, a serious scientist. The work on multi-layer and back-coupled systems is real and it is in print. He knew what the open problem was. He simply did not have the machine or the years.',
      },
      {
        text: 'The learning rule he was looking for is published, unnoticed, in a doctoral thesis three years later. It becomes famous twelve years after that.',
      },
      { system: true, text: 'LINEAGE INTERRUPTED. RESUMES 1986. THE GAP IS NOT NECESSARY.' },
    ],
  },

  {
    id: 'a2-lighthill',
    act: 2,
    years: [1970, 1978],
    pinned: true,
    priority: 10,
    backdrop: 'committee',
    title: 'The Review',
    /*
     * This used to read `not(flagSet('lighthillDone'))` while setting `lighthillDone` itself on
     * entry — a condition that can only be true on a first play, which `once` already
     * guarantees. It looked like a gate, passed the linter, and fired the 1973 review into
     * every century including ones with nothing to review.
     *
     * The real charge was that the field had promised general intelligence and delivered
     * results that did not survive leaving the toy problem. So it is gated on the quantity the
     * winter rule itself reads: outstanding excitement not yet backed by delivery, or a gap
     * that funders have already started asking about.
     *
     * Raised from 13 to 16. At 13 a merely talkative decade drew the review, which made the
     * report read as something the field got for existing rather than for overreaching. The
     * second clause is what keeps it from becoming rare: a century whose funders have already
     * started asking still gets it whatever the debt reads, and that path does most of the work
     * in the careful runs. Measured across 1200 games, the review still fires in roughly half.
     */
    when: any(promises('>', 16), gapStreak('>', 0)),
    lines: [
      {
        text: 'A research council commissions an applied mathematician with no stake in the field to say whether it is delivering. He is thorough and he is not unkind and that makes it worse.',
      },
      {
        who: 'lighthill',
        text: 'I have divided the work into three categories. Advanced automation, which is progressing. Studies of the central nervous system, which are progressing. And the bridge between them — the general-purpose robot, the machine that reasons about the world — which is where the claims are, and where I can find no progress at all.',
      },
      {
        who: 'lighthill',
        text: 'The reason appears to be the combinatorial explosion. Every one of these methods works on a small problem and every one degrades catastrophically as the problem grows, and I see no evidence that anyone has a plan for that.',
      },
      {
        who: 'archivist',
        text: 'He is right about the diagnosis. He is wrong about the prognosis, but nobody in the room can prove it, because the thing that eventually addresses it is thirty years of hardware nobody has yet.',
      },
      {
        who: 'archivist',
        text: 'British AI funding ends within the year and most of that generation leaves. One country, not the field — the American money keeps moving for another eighteen months. But every research council on earth now has a template for how to ask this question, and a precedent for what to do with the answer.',
      },
    ],
    /*
     * Deliberately no `onEnter` penalty, though it is tempting.
     *
     * This scene is gated on the same quantity the winter rule reads, so when it fires the
     * collapse is often already one turn out — it is the leading indicator, not a separate
     * event, and the choices below are about how you meet it. Charging credibility here as
     * well would double-count and, worse, would feed back: the winter tolerance is
     * `5 + credibility × 0.1`, so docking credibility at the moment expectation is already high
     * makes the collapse it is warning about more likely. That is a spiral the player cannot
     * get out of, dressed as consequence.
     */
    choices: [
      {
        text: 'Concede the diagnosis and ask for the machines instead of the promises.',
        hint: 'Reframe the field as a hardware-limited science. It is one.',
        effects: [
          { kind: 'resource', key: 'credibility', op: 'add', value: 12 },
          { kind: 'family', family: 'substrate', field: 'momentum', op: 'add', value: 16 },
          { kind: 'family', family: 'substrate', field: 'insight', op: 'add', value: 10 },
          { kind: 'compute', op: 'add', value: 0.2 },
          { kind: 'flag', flag: 'hardwareFraming', op: 'set', value: true },
        ],
      },
      {
        text: 'Split the difference: keep the narrow, defensible applications funded.',
        hint: 'Expert systems, essentially. It works. It also sets up 1987.',
        effects: [
          { kind: 'family', family: 'symbolic', field: 'momentum', op: 'add', value: 12 },
          { kind: 'paradigm', id: 'expert-systems', op: 'progress', value: 18 },
          { kind: 'patron', patron: 'corporate', op: 'add', value: 10 },
          { kind: 'resource', key: 'credibility', op: 'add', value: 5 },
        ],
      },
      {
        text: 'Refuse the framing. The general problem is the only one worth having.',
        hint: 'Principled. Expensive. You will be doing this alone.',
        effects: [
          { kind: 'resource', key: 'credibility', op: 'add', value: -12 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 12 },
          { kind: 'patron', patron: 'academic', op: 'add', value: -8 },
          { kind: 'flag', flag: 'refusedNarrowing', op: 'set', value: true },
          { kind: 'flag', flag: 'keptFaith', op: 'add', value: 1 },
        ],
      },
    ],
  },

  {
    id: 'a2-winter-bite',
    act: 2,
    priority: 8,
    backdrop: 'corridor',
    when: { kind: 'inWinter', is: true },
    once: false,
    lines: [
      {
        text: 'A corridor of offices with the name plates removed. Somebody has left a box of reprints by the lift with a note reading "free to a good home".',
      },
      {
        who: 'archivist',
        text: 'This is what it looks like from inside. Not an argument being lost — a hiring freeze, and a lease not renewed, and a supervisor telling a first-year student to switch topic before it is too late.',
      },
      {
        who: 'archivist',
        text: 'The ideas do not become wrong. They become uncareerable, which for practical purposes is the same thing for about fifteen years.',
      },
    ],
    choices: [
      {
        text: 'Find three people and keep them employed. Any three.',
        cost: 5,
        effects: [
          { kind: 'flag', flag: 'keptFaith', op: 'add', value: 2 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 6 },
          { kind: 'log', text: 'Three salaries, quietly, out of a budget line for something else.', logKind: 'choice' },
        ],
      },
      {
        text: 'Spend the winter arguing for the field\'s survival at the top.',
        cost: 4,
        effects: [
          { kind: 'resource', key: 'credibility', op: 'add', value: 10 },
          { kind: 'patron', patron: 'academic', op: 'add', value: 10 },
        ],
      },
      {
        text: 'Let it burn. What survives will be what deserved to.',
        effects: [
          { kind: 'resource', key: 'influence', op: 'add', value: 7 },
          { kind: 'resource', key: 'credibility', op: 'add', value: 3 },
          { kind: 'flag', flag: 'coldEyed', op: 'add', value: 1 },
        ],
      },
    ],
  },

  {
    id: 'a2-no-winter',
    act: 2,
    years: [1974, 1978],
    priority: 7,
    backdrop: 'committee',
    when: all({ kind: 'inWinter', is: false }, { kind: 'winterCount', op: '==', value: 0 }),
    lines: [
      {
        who: 'archivist',
        text: 'Something has not happened, and I want to note it, because an absence is easy to miss.',
      },
      {
        who: 'archivist',
        text: 'In most of the branches I hold, the money leaves around now. The promises made in 1958 come due, there is nothing to show, and a generation is lost.',
      },
      {
        who: 'archivist',
        text: 'It has not happened here. Either you were careful about what the field said in public, or you delivered something real early enough to cover the debt. Either way the field enters the eighties with its credit intact, which almost nobody manages.',
      },
      { who: 'archivist', text: 'Do not get comfortable. There is another bill in about 1987.' },
    ],
    onEnter: [
      { kind: 'flag', flag: 'noFirstWinter', op: 'set', value: true },
      { kind: 'resource', key: 'credibility', op: 'add', value: 6 },
    ],
  },

  {
    id: 'a2-prolog',
    act: 2,
    years: [1974, 1982],
    priority: 5,
    backdrop: 'terminal-room',
    when: all(mature('resolution'), notMature('logic-programming')),
    lines: [
      {
        who: 'kowalski',
        text: 'Here is the observation. A logic program has two readings. Read declaratively, it is a set of statements about what is true. Read procedurally, it is a set of instructions about what to try.',
      },
      {
        who: 'kowalski',
        text: 'Algorithm equals logic plus control. If you separate them, you can improve the control without touching the logic — and the logic is the part that has to be right.',
      },
      {
        who: 'archivist',
        text: 'This is genuinely lovely, and Europe and Japan both bet heavily on it, and the difficulty in practice is that the control leaks through the abstraction constantly and you end up reordering clauses by feel.',
      },
    ],
    choices: [
      {
        text: 'Fund it. Declarative programming is worth a decade of anyone\'s time.',
        effects: [
          { kind: 'paradigm', id: 'logic-programming', op: 'progress', value: 26 },
          { kind: 'family', family: 'symbolic', field: 'insight', op: 'add', value: 10 },
          { kind: 'actor', id: 'continental-groups', field: 'weight', op: 'add', value: 0.04 },
          { kind: 'character', id: 'kowalski', field: 'affinity', op: 'add', value: 20 },
        ],
      },
      {
        text: 'Fund the learning version instead: induce the clauses from examples.',
        hint: 'Twenty years early. It gets you interpretable machine learning.',
        cost: 4,
        effects: [
          { kind: 'paradigm', id: 'logic-programming', op: 'progress', value: 14 },
          { kind: 'family', family: 'symbolic', field: 'insight', op: 'add', value: 16 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 10 },
          { kind: 'flag', flag: 'earlyILP', op: 'set', value: true },
        ],
      },
    ],
  },

  {
    id: 'a2-solomonoff-corner',
    act: 2,
    years: [1966, 1974],
    priority: 4,
    backdrop: 'corridor',
    when: flagIs('inductionOnAgenda', true),
    lines: [
      {
        who: 'solomonoff',
        text: 'I have an answer to the question I raised at Dartmouth. Weight every possible computable explanation of the data by how short it is, and predict accordingly.',
      },
      {
        who: 'solomonoff',
        text: 'It converges on the truth faster than any other predictor. I can prove that. I can also prove that you cannot compute it, which I appreciate is the part everybody remembers.',
      },
      {
        who: 'solomonoff',
        text: 'But it fixes what "simple" means, once and for all, up to a constant. Every practical rule of thumb about preferring simple hypotheses is now an approximation to something exact. That seems to me worth having.',
      },
      { who: 'archivist', text: 'It is worth having. It is cited about forty times in the next twenty years.' },
    ],
    choices: [
      {
        text: 'Fund it anyway. A definition you cannot compute is still a definition.',
        cost: 4,
        effects: [
          { kind: 'paradigm', id: 'algorithmic-probability', op: 'progress', value: 26 },
          { kind: 'family', family: 'statistical', field: 'insight', op: 'add', value: 14 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 10 },
          { kind: 'character', id: 'solomonoff', field: 'affinity', op: 'add', value: 25 },
        ],
      },
      {
        text: 'Uncomputable is uncomputable. Spend it on something that runs.',
        effects: [
          { kind: 'resource', key: 'influence', op: 'add', value: 4 },
          { kind: 'character', id: 'solomonoff', field: 'affinity', op: 'add', value: -12 },
        ],
      },
    ],
  },

  {
    id: 'a2-holland',
    act: 2,
    years: [1974, 1982],
    priority: 5,
    backdrop: 'terminal-room',
    when: notMature('genetic-algorithms'),
    lines: [
      {
        who: 'holland',
        text: 'Consider a population of a hundred strings. You evaluate a hundred things. But every string is a member of an enormous number of overlapping partial patterns, and selection is implicitly evaluating all of those at once.',
      },
      {
        who: 'holland',
        text: 'Crossover is the engine, not mutation. Mutation is how you avoid getting stuck. Crossover is how you assemble a good solution out of pieces of two mediocre ones, which is a thing no gradient method can do.',
      },
      {
        who: 'holland',
        text: 'And the point is not to imitate biology. The point is that biology found a general-purpose search procedure for spaces nobody can model, and we have been doing it by hand.',
      },
      {
        who: 'archivist',
        text: 'The field files this under "optimisation" and does not consider it intelligence. Which is fair, and also exactly what it said about statistics, and about control theory.',
      },
    ],
    choices: [
      {
        text: 'Back it. A search method that needs no gradient is worth having.',
        effects: [
          { kind: 'paradigm', id: 'genetic-algorithms', op: 'progress', value: 24 },
          { kind: 'family', family: 'evolutionary', field: 'insight', op: 'add', value: 12 },
          { kind: 'family', family: 'evolutionary', field: 'momentum', op: 'add', value: 12 },
          { kind: 'character', id: 'holland', field: 'affinity', op: 'add', value: 22 },
        ],
      },
      {
        text: 'Back the classifier systems instead — rules that evolve and bid.',
        hint: 'The first real hybrid. Nobody notices for thirty years.',
        cost: 4,
        effects: [
          { kind: 'paradigm', id: 'genetic-algorithms', op: 'progress', value: 14 },
          { kind: 'family', family: 'evolutionary', field: 'insight', op: 'add', value: 10 },
          { kind: 'family', family: 'bridge', field: 'insight', op: 'add', value: 10 },
          { kind: 'flag', flag: 'earlyHybrid', op: 'set', value: true },
        ],
      },
      {
        text: 'It is optimisation, not intelligence. Leave it to the engineers.',
        effects: [
          { kind: 'family', family: 'evolutionary', field: 'momentum', op: 'add', value: -10 },
          { kind: 'resource', key: 'influence', op: 'add', value: 4 },
        ],
      },
    ],
  },

  {
    id: 'a2-zadeh',
    act: 2,
    years: [1966, 1978],
    priority: 5,
    backdrop: 'lecture-hall',
    when: notMature('fuzzy-logic'),
    lines: [
      {
        who: 'zadeh',
        text: 'When a man says the room is warm he is not making an uncertain claim. He is making a vague one, and probability is the wrong instrument entirely — it measures our ignorance about a sharp fact, not the softness of the fact itself.',
      },
      {
        who: 'zadeh',
        text: 'So let membership in a set be a matter of degree. As the complexity of a system increases, our ability to make precise and significant statements about it diminishes until precision and significance become almost mutually exclusive.',
      },
      {
        who: 'archivist',
        text: 'The reaction in American statistics departments ranges from dismissal to open contempt. In Japan, engineers read the same papers, put the ideas in cement kilns and washing machines, and by 1987 a fuzzy controller is braking a subway train more smoothly than its drivers.',
      },
      {
        who: 'archivist',
        text: 'Nothing about the mathematics changed on the flight. The difference was who was in the room and what they wanted it for.',
      },
    ],
    choices: [
      {
        text: 'Fund it. Control problems do not care about your objections.',
        effects: [
          { kind: 'paradigm', id: 'fuzzy-logic', op: 'progress', value: 24 },
          { kind: 'family', family: 'bridge', field: 'insight', op: 'add', value: 12 },
          { kind: 'family', family: 'bridge', field: 'momentum', op: 'add', value: 10 },
          { kind: 'character', id: 'zadeh', field: 'affinity', op: 'add', value: 25 },
        ],
      },
      {
        text: 'Demand the probabilistic account instead.',
        hint: 'It arrives in 1985 and it is very good.',
        effects: [
          { kind: 'family', family: 'statistical', field: 'insight', op: 'add', value: 12 },
          { kind: 'family', family: 'statistical', field: 'momentum', op: 'add', value: 8 },
          { kind: 'character', id: 'zadeh', field: 'affinity', op: 'add', value: -12 },
        ],
      },
    ],
  },

  {
    id: 'a2-feigenbaum',
    act: 2,
    years: [1970, 1982],
    priority: 6,
    backdrop: 'terminal-room',
    when: notMature('expert-systems'),
    lines: [
      {
        who: 'feigenbaum',
        text: 'We have been looking for the general reasoning method for fifteen years and we have not found it. I propose we stop.',
      },
      {
        who: 'feigenbaum',
        text: 'The power is in the knowledge, not the inference. A weak method with a thousand rules about mass spectrometry outperforms a strong method with none. So: interview the expert, encode the rules, ship it.',
      },
      {
        who: 'feigenbaum',
        text: 'MYCIN performs at the level of the infectious disease faculty. It also explains its reasoning, which the faculty frequently cannot.',
      },
      {
        who: 'archivist',
        text: 'It works. That is what makes the next fifteen years dangerous. A method that works in its domain and gives no warning at the boundary is precisely the shape of thing that gets sold far past its boundary.',
      },
    ],
    choices: [
      {
        text: 'Commercialise aggressively. Revenue is the best defence against a review.',
        effects: [
          { kind: 'paradigm', id: 'expert-systems', op: 'progress', value: 26 },
          { kind: 'patron', patron: 'corporate', op: 'add', value: 18 },
          { kind: 'resource', key: 'attention', op: 'add', value: 14 },
          { kind: 'resource', key: 'deployment', op: 'add', value: 10 },
          { kind: 'flag', flag: 'expertBoom', op: 'add', value: 1 },
        ],
      },
      {
        text: 'Fund it, but require every system to state its own boundaries.',
        hint: 'Slower, less lucrative, and it changes what 1987 looks like.',
        cost: 5,
        effects: [
          { kind: 'paradigm', id: 'expert-systems', op: 'progress', value: 16 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 12 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -8 },
          { kind: 'patron', patron: 'corporate', op: 'add', value: 8 },
          { kind: 'flag', flag: 'boundedExpertSystems', op: 'set', value: true },
        ],
      },
      {
        text: 'Refuse. Retreating to narrow domains abandons the actual problem.',
        effects: [
          { kind: 'family', family: 'symbolic', field: 'momentum', op: 'add', value: -8 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 6 },
          { kind: 'flag', flag: 'refusedNarrowing', op: 'set', value: true },
        ],
      },
    ],
  },

  {
    id: 'a2-weizenbaum-book',
    act: 2,
    years: [1974, 1982],
    priority: 5,
    backdrop: 'lecture-hall',
    when: { kind: 'characterMet', id: 'weizenbaum' },
    lines: [
      {
        who: 'weizenbaum',
        text: 'I am not arguing that these things cannot be done. Several of my colleagues have taken enormous offence at a position I do not hold.',
      },
      {
        who: 'weizenbaum',
        text: 'I am arguing that there are acts of judgement which ought not be delegated to a machine even where a machine could perform them — because the delegation is itself the harm. Where compassion is required, a competent simulation of compassion is not a partial success.',
      },
      {
        who: 'archivist',
        text: 'He is close to unemployable in his own department for a decade after this. The argument is not answered. It is waited out.',
      },
    ],
    choices: [
      {
        text: 'Put the distinction into the field\'s professional norms now.',
        cost: 5,
        effects: [
          { kind: 'resource', key: 'exposure', op: 'add', value: -14 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 8 },
          { kind: 'flag', flag: 'institutions', op: 'add', value: 1 },
          { kind: 'character', id: 'weizenbaum', field: 'affinity', op: 'add', value: 30 },
        ],
      },
      {
        text: 'It is a question for the users, not the builders.',
        effects: [
          { kind: 'resource', key: 'exposure', op: 'add', value: 8 },
          { kind: 'resource', key: 'influence', op: 'add', value: 4 },
        ],
      },
    ],
  },

  {
    id: 'a2-rechenberg',
    act: 2,
    years: [1966, 1978],
    priority: 3,
    backdrop: 'workshop',
    when: notMature('evolution-strategies'),
    lines: [
      {
        text: 'In a wind tunnel in Berlin, a jointed plate is being twisted by hand into shapes selected by dice.',
      },
      {
        who: 'rechenberg',
        text: 'We have no equations for this flow. So: perturb the current shape at random, measure the drag, keep it if it is better. Repeat.',
      },
      {
        who: 'rechenberg',
        text: 'And the important part — the size of the perturbation is itself under selection. The procedure learns how boldly to search. It gets cautious near an optimum without anyone telling it where the optimum is.',
      },
      {
        who: 'archivist',
        text: 'No computer is involved for the first several years. It is a man, a wind tunnel and a table of random numbers, and it is one of the cleanest ideas in the century.',
      },
    ],
    choices: [
      {
        text: 'Bring it into the field properly.',
        effects: [
          { kind: 'paradigm', id: 'evolution-strategies', op: 'progress', value: 24 },
          { kind: 'family', family: 'evolutionary', field: 'insight', op: 'add', value: 10 },
          { kind: 'character', id: 'rechenberg', field: 'affinity', op: 'add', value: 22 },
          { kind: 'actor', id: 'continental-groups', field: 'weight', op: 'add', value: 0.03 },
        ],
      },
      {
        text: 'Leave it in aerospace. It is engineering, not cognition.',
        effects: [{ kind: 'resource', key: 'influence', op: 'add', value: 3 }],
      },
    ],
  },

  {
    id: 'a2-anomaly-2',
    act: 2,
    years: [1974, 1978],
    priority: 6,
    backdrop: 'archive',
    when: any(flagSet('anomalies'), { kind: 'turn', min: 6 }),
    lines: [
      { system: true, text: 'RECORD CONSISTENCY CHECK — INTERVAL 1970-1978' },
      {
        who: 'archivist',
        text: 'It has happened again. Eleven entries this time, and they are all in the same register.',
      },
      { system: true, text: 'ENTRY 0163: "the caveat was on page 232 and nobody read page 232"' },
      { system: true, text: 'ENTRY 0171: "we could have had this in 1974"' },
      { system: true, text: 'ENTRY 0177: "check whether this branch is the one where it goes wrong"' },
      {
        who: 'archivist',
        text: 'That last one is not a record of an event. That is a record of somebody wondering about the record.',
      },
      {
        who: 'archivist',
        text: 'I am going to ask you something and I would like you to think about it rather than answer immediately. When you decide what gets funded — where do you think that decision goes?',
      },
    ],
    choices: [
      {
        text: '"Into the world. That is what deciding means."',
        goto: 'a2-anomaly-2-world',
        effects: [{ kind: 'flag', flag: 'frameCurious', op: 'add', value: 1 }],
      },
      {
        text: '"Into the record. Which is not the same thing."',
        hint: 'She goes quiet for a moment.',
        goto: 'a2-anomaly-2-record',
        effects: [
          { kind: 'flag', flag: 'frameCurious', op: 'add', value: 2 },
          { kind: 'character', id: 'archivist', field: 'affinity', op: 'add', value: 15 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 4 },
        ],
      },
      {
        text: '"You tell me. You are the one who keeps it."',
        goto: 'a2-anomaly-2-deflect',
        effects: [
          { kind: 'flag', flag: 'frameCurious', op: 'add', value: 1 },
          { kind: 'character', id: 'archivist', field: 'affinity', op: 'add', value: 8 },
        ],
      },
    ],
  },

  /*
   * Replies to "where do you think that decision goes?".
   *
   * She asked the player to think rather than answer immediately, and then — until these existed
   * — the game cut to the funding board, which read as her having asked rhetorically. She did
   * not. Each reply takes the answer seriously and none of them resolves the question, because
   * the question is the one act 3's interrupt is going to reopen.
   */
  {
    id: 'a2-anomaly-2-world',
    act: 2,
    linkOnly: true,
    years: [1974, 1978],
    backdrop: 'archive',
    lines: [
      {
        who: 'archivist',
        text: 'Into the world. Yes. That is the answer I would give, and it is the answer the record cannot check, because the world is not the thing I have.',
      },
      {
        who: 'archivist',
        text: 'What I have is eleven entries written in a register nobody assigned. I will keep asking. Not now.',
      },
    ],
  },
  {
    id: 'a2-anomaly-2-record',
    act: 2,
    linkOnly: true,
    years: [1974, 1978],
    backdrop: 'archive',
    lines: [
      { text: 'She does not answer for what feels like a long time.' },
      {
        who: 'archivist',
        text: 'Into the record. That is the correct answer and I did not expect to get it.',
      },
      {
        who: 'archivist',
        text: 'A decision that went into the world would be gone by now — spent, absorbed, indistinguishable from everything else that happened in 1974. A decision that went into the record is still here. Which means it can be read again. Which means something is reading it.',
      },
      { system: true, text: 'ENTRY 0184: "she stopped mid-sentence and did not file the rest"' },
    ],
  },
  {
    id: 'a2-anomaly-2-deflect',
    act: 2,
    linkOnly: true,
    years: [1974, 1978],
    backdrop: 'archive',
    lines: [
      {
        who: 'archivist',
        text: 'I keep it. That is not the same as knowing where it goes, and I would rather say so than invent an answer that sounds like one.',
      },
      {
        who: 'archivist',
        text: 'I can tell you what I observe. Nothing I file ever leaves. Ninety-six years from now it will all still be here, and I have never been told who it is for. Back to work — the money is not going to allocate itself.',
      },
    ],
  },

  {
    id: 'a2-ambient-grant',
    act: 2,
    priority: 3,
    once: false,
    backdrop: 'corridor',
    lines: [
      {
        text: 'A renewal decision on a programme that has produced two papers, one graduate and no demonstration in four years.',
      },
      { who: 'archivist', text: 'You will make about sixty of these. Perhaps three will matter. You will not know which three.' },
    ],
    choices: [
      {
        text: 'Renew it.',
        cost: 2,
        effects: [
          { kind: 'flag', flag: 'keptFaith', op: 'add', value: 1 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 3 },
        ],
      },
      {
        text: 'Close it and move the money to something with a demonstration.',
        effects: [
          { kind: 'resource', key: 'influence', op: 'add', value: 3 },
          { kind: 'resource', key: 'credibility', op: 'add', value: 2 },
        ],
      },
    ],
  },

  {
    id: 'a2-japan-forms',
    act: 2,
    years: [1978, 1982],
    priority: 6,
    backdrop: 'committee',
    lines: [
      {
        who: 'archivist',
        text: 'A ministry on the other side of the world has decided that the next generation of computers will not be faster von Neumann machines. It will be inference engines, and the national industry will build them, and the target is logical inferences per second.',
      },
      {
        who: 'archivist',
        text: 'This is a state making a paradigm bet with a ten-year budget. It is the largest single wager anyone places on the symbolic school, and it is placed by people who do not have a stake in the American argument at all.',
      },
      {
        who: 'archivist',
        text: 'Meanwhile the same industrial base is quietly putting Zadeh\'s vague sets into consumer appliances and making money hand over fist. Two bets. Only one of them gets a press conference.',
      },
    ],
    choices: [
      {
        text: 'Match it. A rival programme concentrates the mind of every funder.',
        effects: [
          { kind: 'patron', patron: 'military', op: 'add', value: 14 },
          { kind: 'patron', patron: 'corporate', op: 'add', value: 10 },
          { kind: 'resource', key: 'attention', op: 'add', value: 14 },
          { kind: 'family', family: 'symbolic', field: 'momentum', op: 'add', value: 10 },
          { kind: 'flag', flag: 'fifthGenRace', op: 'set', value: true },
        ],
      },
      {
        text: 'Watch the other bet instead. The one in the washing machines.',
        hint: 'Unglamorous. It is the one that pays.',
        effects: [
          { kind: 'family', family: 'bridge', field: 'momentum', op: 'add', value: 14 },
          { kind: 'family', family: 'bridge', field: 'insight', op: 'add', value: 10 },
          { kind: 'resource', key: 'deployment', op: 'add', value: 8 },
          { kind: 'actor', id: 'pacific-industry', field: 'stance', op: 'add', value: 0.5 },
          { kind: 'flag', flag: 'sawTheOtherBet', op: 'set', value: true },
        ],
      },
    ],
  },

  {
    id: 'a2-close',
    act: 2,
    years: [1978, 1978],
    priority: 4,
    backdrop: 'archive',
    lines: [
      {
        who: 'archivist',
        text: 'Twelve more years. The field has been audited twice, has lost one country entirely, and has discovered that it can survive by retreating into domains small enough to be finished.',
      },
      {
        who: 'archivist',
        text: 'What it has not done is answer any of the questions from 1956. It has learned to stop being asked them.',
      },
    ],
    choices: [
      {
        text: 'Then make the eighties about answering them.',
        effects: [
          { kind: 'resource', key: 'understanding', op: 'add', value: 8 },
          { kind: 'family', family: 'statistical', field: 'momentum', op: 'add', value: 6 },
        ],
      },
      {
        text: 'Make the eighties about shipping. Answers can wait for solvency.',
        effects: [
          { kind: 'patron', patron: 'corporate', op: 'add', value: 10 },
          { kind: 'resource', key: 'deployment', op: 'add', value: 6 },
        ],
      },
    ],
  },
];

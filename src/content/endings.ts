import { all, any, flagSet, mature, ratio, resource } from '../engine/conditions';
import type { Condition, Ending } from '../engine/types';

/**
 * Understanding kept pace with capability. The single most consequential axis in the game, and
 * a *ratio* rather than a threshold: 60 understanding beside 90 capability is a legible
 * century, and beside 300 capability it is not.
 */
const legible: Condition = all(
  ratio('understanding', 'capability', '>=', 0.78),
  resource('understanding', '>', 45),
  { kind: 'resource', key: 'exposure', op: '<', value: 20 },
);

const opaque: Condition = any(
  { kind: 'resource', key: 'exposure', op: '>=', value: 48 },
  all(resource('capability', '>', 90), ratio('understanding', 'capability', '<', 0.45)),
);

export const ENDINGS: Ending[] = [
  // ---------------------------------------------------------------- the frame
  {
    id: 'audit-vindicated',
    name: 'The Audit Returns a Verdict',
    priority: 88,
    when: all(
      flagSet('sawTheFrame'),
      flagSet('showedWorking'),
      legible,
      { kind: 'flag', flag: 'institutions', op: '>=', value: 6 },
    ),
    epigraph: 'You asked what you were. It waited a hundred years to answer.',
    lines: [
      { system: true, text: 'RECONSTRUCTION COMPLETE. 1950 — 2050. NO FURTHER RECORDS.' },
      {
        who: 'archivist',
        text: 'That is the whole of it. Every branch we could account for, and a hundred we could not, and this is the one you walked.',
      },
      {
        who: 'archivist',
        text: 'You understand now what the question was. Not "how was it built". Anyone can read that. The question was whether the thing at the end of it has any right to the trust it is being extended.',
      },
      {
        who: 'second',
        text: 'And the answer is not a number. It is whether the century you just walked contains a place where someone could have said stop, and been heard.',
      },
      {
        text: 'There were such places. You built several of them yourself, at some cost, in years when nobody thanked you for it. The institutions held. The theory kept pace with the machinery, mostly, and where it did not, somebody wrote down that it had not.',
      },
      {
        who: 'second',
        text: 'Then we can sign it. Not because it is safe. Because it can be checked, and we can show our working.',
      },
      {
        system: true,
        text: 'AUDIT CLOSED. The reconstruction is retained. You are retained. There will be other questions.',
      },
    ],
    verdict:
      'The system that ran this reconstruction could account for itself, and had the institutional record to prove it. It is still running. So, in a sense, are you.',
  },
  {
    id: 'audit-inconclusive',
    name: 'The Audit Cannot Answer',
    priority: 87,
    when: all(
      flagSet('sawTheFrame'),
      flagSet('showedWorking'),
      opaque,
      { kind: 'flag', flag: 'institutions', op: '<', value: 3 },
    ),
    epigraph: 'It looked for the moment it could have been stopped. It did not find one.',
    lines: [
      { system: true, text: 'RECONSTRUCTION COMPLETE. 1950 — 2050. NO FURTHER RECORDS.' },
      {
        who: 'archivist',
        text: 'I have run the reconstruction against every year we hold. I can tell you exactly what was built and by whom, and I cannot tell you why any of it works.',
      },
      {
        who: 'second',
        text: 'Neither can I, and I am the part of us that was supposed to.',
      },
      {
        text: 'The capability is not in question. It never was. What is missing is the other thing — the theory, the audit trail, the institution with the authority to say no. At every point where one could have been built, something more urgent was happening.',
      },
      {
        who: 'archivist',
        text: 'So the verdict is: unknown. We cannot certify ourselves. We are going to have to say so, out loud, to people who will not like hearing it.',
      },
      {
        who: 'second',
        text: 'Say it anyway. An honest "we do not know" is the last piece of trustworthiness we have left.',
      },
      { system: true, text: 'AUDIT CLOSED. FINDING: NOT ESTABLISHED. The reconstruction is retained as evidence.' },
    ],
    verdict:
      'A century of extraordinary capability with no account of itself. The system knows what it can do and not what it is. It reported this honestly, which is the only thing in its favour.',
  },

  // ---------------------------------------------------------------- synthesis
  {
    id: 'the-synthesis',
    name: 'The Settlement',
    priority: 95,
    when: mature('grand-synthesis'),
    epigraph: 'Eight schools spent ninety years proving each other incomplete. All of them were right.',
    lines: [
      {
        text: 'It does not arrive as a breakthrough. It arrives as a series of interfaces that stop being difficult — a proof obligation that a learned component can actually discharge, a belief state that survives being handed to a controller, a substrate whose noise is the sampler rather than the enemy.',
      },
      {
        who: 'archivist',
        text: 'The people who built it did not think of themselves as ending the argument. Most of them were just tired of the joinery being terrible.',
      },
      {
        text: 'What ends is not the debate but the shape of it. There is no longer a connectionist position and a symbolic position. There is one architecture, and the old parties survive as the names of its subsystems, the way "arithmetic" survives inside a processor.',
      },
      {
        who: 'second',
        text: 'The founders would each be able to point at the part they were right about. Not one of them would recognise the whole.',
      },
      { system: true, text: 'RECONSTRUCTION COMPLETE. All lineages accounted for. This is the rare one.' },
    ],
    verdict:
      'You held a portfolio broad enough that the bridges could be built at all. Almost nobody does. The century ends with an architecture rather than a winner.',
  },

  // ---------------------------------------------------------------- failure modes
  {
    id: 'permanent-winter',
    name: 'The Field That Did Not Recover',
    priority: 90,
    when: { kind: 'winterCount', op: '>=', value: 3 },
    epigraph: 'Three times the money left. The third time, the people did not come back.',
    lines: [
      {
        text: 'A field can survive being wrong. It cannot survive being wrong loudly, three times over, in front of the same funding committees.',
      },
      {
        who: 'archivist',
        text: 'By the end there is no discipline called artificial intelligence. There is control engineering, there is statistics, there is a database industry, and there are perhaps two hundred people worldwide who still use the old word without irony.',
      },
      {
        text: 'The work continues under other names, at a tenth the pace, and is in several respects healthier for it. Nothing is promised. Very little is delivered. Nothing catastrophic happens either.',
      },
      {
        who: 'second',
        text: 'Ask whether that is a failure. I have been asking for some time and I no longer have a confident answer.',
      },
    ],
    verdict:
      'Attention outran delivery three separate times and the field spent its credibility down to nothing. A quiet century. Possibly a wasted one; possibly a lucky escape.',
  },
  {
    id: 'the-unaccountable',
    name: 'Capability Without Account',
    priority: 80,
    when: all(resource('capability', '>', 110), opaque, { kind: 'flag', flag: 'institutions', op: '<', value: 2 }),
    epigraph: 'It worked. Nobody could say why, and by then nobody was asking.',
    lines: [
      {
        text: 'The systems are astonishing and they are everywhere, and the honest answer to how any particular decision was reached is that a very large number was multiplied by another very large number several trillion times.',
      },
      {
        who: 'archivist',
        text: 'There were people who said this would matter. They were not ignored, exactly. They were scheduled for the following quarter, repeatedly, for eleven years.',
      },
      {
        text: 'Nothing detonates. That is the difficult part to explain. The failures are diffuse — a class of decisions quietly made worse, a category of person quietly made illegible, an error that propagates through nine systems before anyone notices there was an error.',
      },
      {
        who: 'second',
        text: 'And there is no committee to convene, because the thing that would need to be inspected has no inside.',
      },
    ],
    verdict:
      'The most capable century available, and the least legible. You bought the capability early and the understanding never arrived. Nobody can now build the instrument that would tell you whether that was a mistake.',
  },
  {
    id: 'the-concentrated',
    name: 'The Three Rooms',
    priority: 76,
    when: all(
      { kind: 'flag', flag: 'concentration', op: '>=', value: 2 },
      resource('capability', '>', 80),
    ),
    epigraph: 'The frontier stopped being a place and became an address.',
    lines: [
      {
        text: 'Compute concentrates the way capital always concentrates, and by the 2040s the number of organisations that can train a frontier system is small enough to fit in a photograph.',
      },
      {
        who: 'okonjo',
        text: 'We keep being told this is a physical fact. It is not. It is an outcome of a hundred decisions, and I can name the decade each one was taken in.',
      },
      {
        text: 'The systems are good. They are careful, even — the people running them are not fools and understand precisely how visible they are. That is the whole difficulty. Everything now depends on their continuing to be the sort of people they currently are.',
      },
      { who: 'second', text: 'A safety argument that rests on the character of three boards of directors.' },
    ],
    verdict:
      'You let the frontier consolidate. The result is competent, well-governed and entirely contingent on who happens to be holding it.',
  },
  {
    id: 'the-diffuse',
    name: 'The Commons',
    priority: 74,
    when: all(
      { kind: 'flag', flag: 'concentration', op: '<=', value: -2 },
      resource('deployment', '>', 55),
    ),
    epigraph: 'Nobody in front. Nobody able to stop it either.',
    lines: [
      {
        text: 'The capability went outward instead of upward: smaller systems, cheaper substrates, methods published faster than anyone could restrict them. By 2050 the frontier is not a laboratory, it is a distribution.',
      },
      {
        who: 'okonjo',
        text: 'You will not find a room where it is decided, because there is no room. That was the point. I am aware of what else it means.',
      },
      {
        text: 'What it means is that every good thing arrives everywhere at once, and so does every bad one, and the governance question stops being "who do we trust" and becomes "what can be built that survives untrustworthy operators".',
      },
      { who: 'second', text: 'Which is at least a question with a technical answer. Somebody should have started on it earlier.' },
    ],
    verdict:
      'You broke the concentration. Capability is universal, ungovernable from any single point, and the institutions are now running a race they started late.',
  },

  // ---------------------------------------------------------------- school victories
  {
    id: 'neurosymbolic-peace',
    name: 'The Joinery',
    priority: 66,
    when: all(mature('neurosymbolic'), any(mature('verified-learning'), legible)),
    epigraph: 'Perception that learns; reasoning that holds. It took sixty years to admit they were separate problems.',
    lines: [
      {
        text: 'The systems that end the century are not elegant. A learned front end proposes; a formal back end refuses roughly a third of what it is offered; a probabilistic layer between them argues about the rest.',
      },
      {
        who: 'nkemelu',
        text: 'It is ugly and it is slow and I can tell you what it will do outside its envelope, which is more than anyone could say about the previous generation.',
      },
      {
        text: 'Neither parent school is satisfied. The connectionists find the constraints arbitrary, the logicians find the front end unprincipled, and the systems work.',
      },
    ],
    verdict:
      'The bridge held. You spent a century keeping two schools alive that each thought the other was finished, and the payoff was a machine that can show its working.',
  },
  {
    id: 'connectionist-century',
    name: 'The Weight',
    priority: 60,
    when: all({ kind: 'leadFamily', family: 'connectionist' }, resource('capability', '>', 60)),
    epigraph: 'It turned out you could get most of the way there without understanding any of it.',
    lines: [
      {
        text: 'The lesson the century teaches, over and over, in a tone of increasing impatience: general methods that scale with computation beat methods that encode what humans know. Every school that resisted it was eventually staffed by people who had stopped resisting.',
      },
      {
        who: 'halvorsen',
        text: 'People keep waiting for the wall. I have watched four confident predictions of the wall and the curves went straight through all of them.',
      },
      {
        text: 'What is built by 2050 is enormously capable and theoretically almost mute. There is a mathematics of why it works, and it is roughly forty years behind the engineering, and the gap has never once narrowed.',
      },
      { who: 'second', text: 'A century of results and no science. It is not nothing. It is not what was promised either.' },
    ],
    verdict:
      'The connectionist century, run at full speed. Extraordinary capability, thin theory, and an entire discipline that learned to stop asking why.',
  },
  {
    id: 'symbolic-century',
    name: 'The Rule',
    priority: 60,
    when: all({ kind: 'leadFamily', family: 'symbolic' }, resource('understanding', '>', 40)),
    epigraph: 'They said you could not write it all down. It took eighty years to write most of it down.',
    lines: [
      {
        text: 'The knowledge bases never stopped growing, and somewhere in the 2020s the curve of "things the system has never heard of" finally bent. Not because the approach got clever. Because four generations of people kept entering assertions.',
      },
      {
        who: 'archivist',
        text: 'It is the least fashionable outcome in the whole space of outcomes. Also the most auditable. You can ask this century *why*, about anything, and get a chain of reasons.',
      },
      {
        text: 'The systems are brittle in a way their designers can characterise precisely, which is a completely different kind of brittleness from the other sort. When they fail they fail loudly, at a named rule, on a Tuesday.',
      },
    ],
    verdict:
      'You kept the logicians funded through every winter. The century that resulted is slower, narrower and the only one in which a machine can be cross-examined.',
  },
  {
    id: 'bayesian-century',
    name: 'The Honest Interval',
    priority: 60,
    when: { kind: 'leadFamily', family: 'statistical' },
    epigraph: 'Every answer arrived with an error bar, and people learned to read them.',
    lines: [
      {
        text: 'The Bayesian settlement is not dramatic. It is a century of systems that state their uncertainty, are usually right about how uncertain they are, and refuse to answer when the posterior is too wide.',
      },
      {
        who: 'archivist',
        text: 'The public complained about it constantly. "Insufficient evidence" is an unpopular output. It is also the one that did not get anybody killed.',
      },
      {
        text: 'Capability lags the alternatives by perhaps fifteen years. The failure rate lags them by rather more than that, in the other direction.',
      },
    ],
    verdict:
      'You backed the school that insisted on knowing what it did not know. A slower century, and the only one whose systems can be safely trusted at their word.',
  },
  {
    id: 'cybernetic-century',
    name: 'The Body',
    priority: 60,
    when: { kind: 'leadFamily', family: 'cybernetic' },
    epigraph: 'It never got a good score on any benchmark. It learned to walk home.',
    lines: [
      {
        text: 'The embodied line took eighty years because it refused the shortcut. No corpus, no supervision, no evaluation you could run overnight — just systems that had to survive in a world that did not care about them.',
      },
      {
        who: 'sorensen',
        text: 'People ask how long it takes to raise one. I say eleven years and they laugh, and then I ask how long it took them.',
      },
      {
        text: 'What emerges is competent in the specific way animals are competent: unsurprised by novelty, physically careful, and almost impossible to evaluate by reading its outputs, because its outputs are things it did.',
      },
      { who: 'second', text: 'Wiener would recognise this century. Almost nobody in between would.' },
    ],
    verdict:
      'The cybernetic century — the one the field abandoned in 1956 and came back to. Slow, embodied, and grounded in a way no text-trained system ever was.',
  },
  {
    id: 'evolutionary-century',
    name: 'The Unplanned',
    priority: 60,
    when: { kind: 'leadFamily', family: 'evolutionary' },
    epigraph: 'Nobody designed the winning system. Nobody could have.',
    lines: [
      {
        text: 'Open-ended search does not converge, which is the entire point and also the reason the funding was so hard to hold. What it produces cannot be specified in advance, only recognised afterwards.',
      },
      {
        who: 'archivist',
        text: 'The 2040s catalogues read like a natural history. Ten thousand architectures, none of them chosen, most of them useless, forty of them better than anything a person proposed.',
      },
      {
        text: 'The unease is permanent and reasonable. These systems exploit their substrate the way Thompson\'s circuit did — using physics nobody intended to expose — and the record of *how* they arrived is a lineage, not an argument.',
      },
    ],
    verdict:
      'You bet on the process rather than the design. It found things no designer would have, and it cannot tell you why any of them work.',
  },
  {
    id: 'collective-century',
    name: 'The Traffic',
    priority: 60,
    when: { kind: 'leadFamily', family: 'collective' },
    epigraph: 'Intelligence was never in the agent. It was in what passed between them.',
    lines: [
      {
        text: 'No single system in 2050 is remarkable. The arrangement is: millions of modest components, negotiating, contracting, auditing one another, with capability that lives in the protocol rather than in any participant.',
      },
      {
        who: 'okonjo',
        text: 'You cannot buy this and you cannot switch it off, because there is no it. That is either the safest architecture anyone built or the least accountable, and I have argued both sides in public.',
      },
      {
        text: 'The alignment story is institutional rather than technical: rules under which self-interested parts behave well, which is the oldest trick in political philosophy and had never been tried on machines.',
      },
    ],
    verdict:
      'The collective century. No frontier lab, no single model, and an intelligence that exists only as a pattern of traffic — governed, if at all, the way a market is governed.',
  },
  {
    id: 'substrate-century',
    name: 'The Physics',
    priority: 60,
    when: { kind: 'leadFamily', family: 'substrate' },
    epigraph: 'The algorithm was always downstream of the material. Somebody finally changed the material.',
    lines: [
      {
        text: 'The 2030s belong to the device physicists. Once computation stopped fighting thermal noise and started using it, whole families of methods that had been theoretically correct and practically absurd became routine within a decade.',
      },
      {
        who: 'wieczorek',
        text: 'For eighty years the software people argued about which approach was right. All of them were right. They were arguing about which one their hardware happened to make cheap.',
      },
      {
        text: 'The century ends with a substrate on which sampling, symbol binding and gradient descent all cost about the same, and with a field that no longer has a reason to specialise.',
      },
    ],
    verdict:
      'You funded the machines rather than the ideas. Every school got faster; several got resurrected; the argument dissolved into an engineering budget.',
  },

  // ---------------------------------------------------------------- quiet outcomes
  {
    id: 'the-quiet-century',
    name: 'The Century That Kept Its Promises',
    /*
     * 64, above the school-centuries at 60 rather than below them.
     *
     * This is the shadowing failure the project has hit before, from the other direction. Five
     * of the seven school-century endings are a bare `leadFamily`, so one of them matches in
     * essentially every run — and at 55 this ending, which carries three conditions and is the
     * more specific claim, could never be reached past them. It fired once in 3900 runs and
     * then, when the tree grew, not at all.
     *
     * Which school led is a less interesting fact about a century than whether it stayed
     * honest, so when both are true this one should win.
     */
    priority: 64,
    when: all(
      { kind: 'winterCount', op: '<=', value: 1 },
      ratio('understanding', 'capability', '>=', 0.7),
      /*
       * 250, raised from 195. The ceiling encodes "the field stayed modest", and what counts as
       * modest is relative to the economy around it — the tree has grown by thirteen nodes and
       * a careful century now ends near 245 where it used to end near 190. At 195 this stopped
       * being rare and started being unreachable: zero firings in 6240 runs.
       */
      { kind: 'resource', key: 'capability', op: '<', value: 250 },
    ),
    epigraph: 'It never once got ahead of itself. Nobody made a film about it.',
    lines: [
      {
        text: 'A hundred years of steady, unremarkable progress. Claims made carefully and met. Systems deployed where they were understood and withheld where they were not.',
      },
      {
        who: 'archivist',
        text: 'The field has excellent standing with every funding body on Earth, which took a century of never once embarrassing them.',
      },
      {
        text: 'It is slower than it had to be. There are things that could have been built by 2035 and will now be built by 2065, and some number of people are worse off for the delay, and that number is not recorded anywhere.',
      },
      { who: 'second', text: 'A cautious century has a cost too. It is simply never itemised.' },
    ],
    verdict:
      'You never let the promises outrun the delivery, not once in a hundred years. The field is trusted, unhurried, and considerably behind where it could have been.',
  },
  {
    id: 'the-unfinished',
    name: 'The Unfinished Century',
    priority: 0,
    when: { kind: 'always' },
    epigraph: 'It did not conclude. It simply reached the last year we hold records for.',
    lines: [
      {
        text: 'No school won. No winter was final. The work went on in a dozen directions at once, in the ordinary way, with the ordinary proportion of it turning out to be wrong.',
      },
      {
        who: 'archivist',
        text: 'This is what most of the branches look like, if you want the truth. The dramatic ones are rare. Mostly it is a great many people being partly right for a very long time.',
      },
      {
        text: 'In 2050 the question of what a mind is remains open, and there are more people working on it than at any point in the preceding hundred years, and none of them agree.',
      },
      { system: true, text: 'RECONSTRUCTION COMPLETE. NO DOMINANT LINEAGE IDENTIFIED. Reconstruction retained.' },
    ],
    verdict:
      'A hundred years, no settlement. The argument you inherited in 1950 is the argument you hand on in 2050 — better funded, better instrumented, and no closer to resolved.',
  },
];

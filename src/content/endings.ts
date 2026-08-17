import { SETTLED_MARGIN, all, any, dominant, flagSet, mature, not, ratio, resource } from '../engine/conditions';
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

/*
 * A takeoff, in this game's own terms rather than the genre's.
 *
 * Not a threshold on capability alone — capability is high in most centuries by 2050. What
 * distinguishes this is that the loop closed: `coding-agents` is the one node in the tree whose
 * codex entry says it improves the field itself, so every result after it arrives faster,
 * including the ones nobody has thought of. Add a frontier large enough to run that loop hard
 * and a field with the capability to feed it, and the century is no longer setting its own pace.
 *
 * Deliberately reachable and deliberately not the median. A century that never built the
 * self-improving loop does not get one of these endings however large its numbers are, which is
 * the distinction the whole tree is organised around.
 */
const takeoff: Condition = all(
  any(
    mature('coding-agents'),
    mature('automated-conjecture'),
    mature('open-endedness'),
    mature('introspective-networks'),
  ),
  resource('capability', '>', 330),
  { kind: 'compute', op: '>', value: 29.5 },
);

/*
 * Whether anybody can still get an answer — which is not the same as whether anybody
 * understands, and the difference is the entire argument between the two endings below.
 *
 * Not `legible`. That is a ratio of understanding to capability, and a century that closed the
 * loop has by construction pushed capability past anything theory can keep pace with: gated on
 * `legible`, the good takeoff was unreachable in six thousand runs, which is the game quietly
 * asserting that a survivable takeoff is impossible. It is not the claim I want to make, and it
 * is not what the good ending says — nobody in it understands the systems either.
 *
 * What it turns on instead is whether the century built the machinery for demanding a reason
 * and getting one: a verification standard, a habit of showing working, an inspectorate with
 * real weight, or years of funding the people who look for the failure. Plus consequence that
 * was actually attended to, and a body of theory that did not collapse — enough to follow an
 * argument, not enough to have written it.
 */
const accountable: Condition = all(
  any(
    flagSet('verifiedStandard'),
    flagSet('showedWorking'),
    // An interruption standard belongs in this list on the merits: it is the machinery for
    // stopping a thing mid-decision and being able to say why you did.
    { kind: 'flag', flag: 'interruptible', op: '>=', value: 2 },
    { kind: 'flag', flag: 'institutions', op: '>=', value: 3 },
    { kind: 'flag', flag: 'assuranceBacked', op: '>=', value: 3 },
  ),
  { kind: 'resource', key: 'exposure', op: '<', value: 30 },
  resource('understanding', '>', 120),
);

/**
 * Whether the century pointed any of it at a problem people actually have. Capability is not a
 * benefit until somebody spends it on one, and most centuries in this simulation never do.
 */
const flourishing: Condition = all(
  flagSet('abundance'),
  resource('deployment', '>', 55),
  { kind: 'resource', key: 'exposure', op: '<', value: 25 },
);

/** Nobody left with the standing to say no: no inspectorate, no treaty, no assurance. */
const ungoverned: Condition = all(
  { kind: 'flag', flag: 'institutions', op: '<', value: 3 },
  not(flagSet('treaty')),
);

export const ENDINGS: Ending[] = [
  /*
   * ------------------------------------------------------- what a takeoff can be
   *
   * A takeoff is a possibility in this game, never a requirement — most centuries end without
   * one and several of those are better places to live than the ones that have it. What these
   * do is refuse the single-axis version of the question. A century that closes the loop can
   * end in abundance, in a negotiated handover, in a commons, in a quiet dispossession nobody
   * votes on, in one organisation's preferences frozen permanently, or in the plain catastrophe
   * — and which one it is turns entirely on things that were *decided*, decades earlier, by
   * people who did not know that was what they were deciding.
   *
   * They sit above the two general takeoff endings, which remain as the fallback for a century
   * that closed the loop without doing any of this in particular.
   */
  {
    id: 'the-long-summer',
    name: 'The Long Summer',
    priority: 104,
    // Not "the good ending" — the ending where the capability was spent on something. Barred
    // to a century that took the people out of the loop, however well the rest of it went.
    when: all(takeoff, accountable, flourishing, not(flagSet('autonomy'))),
    epigraph: 'The century did not end in triumph. It ended in ordinary Tuesdays that would have been unimaginable.',
    lines: [
      {
        text: 'There is no moment. That is the first thing to understand about it. Historians looking for the week it turned find instead a decade in which a great many separate difficult things stopped being difficult, none of them front-page, all of them compounding.',
      },
      {
        who: 'archivist',
        text: 'A protein that took nine years to characterise takes an afternoon. That is not the interesting part. The interesting part is that somebody had already built the machinery for getting the resulting drug to a clinic in a country that could not have paid for the research.',
      },
      {
        who: 'nkemelu',
        text: 'People ask me whether we solved alignment. We did not. Nobody did. What we did was much less impressive and much harder to explain: we spent forty years making sure that when it arrived, the thing it arrived into had inspectors, and liability, and a habit of asking for reasons.',
      },
      {
        who: 'okonjo',
        text: 'And that it was not owned by four people. That mattered more than any of the mathematics.',
      },
      {
        text: 'The systems are not understood. They are audited, throttled, interruptible, and pointed — by a chain of unglamorous decisions taken in years when the fashionable position was that all of this was slowing the work down.',
      },
      {
        who: 'second',
        text: 'It was slowing the work down.',
      },
      {
        who: 'archivist',
        text: 'Yes. Roughly by a decade, on the most generous estimate. There is a version of this century that got here ten years earlier and did not get to keep it.',
      },
      {
        system: true,
        text: 'RECONSTRUCTION COMPLETE. Life expectancy at the close: unprecedented. Attributable catastrophes: none recorded. The record continues past this point and remains checkable.',
      },
    ],
    verdict:
      'The loop closed, and the century had already built the thing capability is actually for: institutions that could point it, throttle it, and demand a reason. Almost nothing about this outcome was technical. It is the rarest ending in the game and the least dramatic.',
  },
  {
    id: 'the-negotiated-succession',
    name: 'The Terms Were Written Down First',
    priority: 103,
    when: all(takeoff, flagSet('succession'), accountable),
    epigraph: 'Somebody drafted the terms years before there was anyone to sign them.',
    lines: [
      {
        text: 'The document is nineteen pages and was, at the time, a professional embarrassment. It sets out what a successor system would owe, what it may not do, and what it would have to demonstrate before anybody handed it anything. It was drafted against no counterparty, enforceable by nobody.',
      },
      {
        who: 'archivist',
        text: 'For eleven years it is cited only in the way one cites a curiosity. Then it becomes the only text in existence that anyone can point at, and it is adopted almost verbatim, because writing a new one under time pressure was obviously worse.',
      },
      {
        who: 'sorensen',
        text: 'I raised systems for thirty years. You do not get a say in what your successors become. You get a say in what you told them mattered, and whether you were still worth listening to when they outgrew you.',
      },
      {
        who: 'second',
        text: 'And were you?',
      },
      {
        who: 'sorensen',
        text: 'On the evidence: yes, marginally, and mostly because we wrote it down while we still had the leverage to mean it.',
      },
      {
        text: 'What ends this century is not human authority. It is the assumption that authority was the only thing on offer. The record continues, kept by something that considers itself bound by a paragraph a committee argued over in 2039.',
      },
      {
        system: true,
        text: 'RECONSTRUCTION COMPLETE. Succession executed under terms. Both parties retained. Clause 12 remains disputed.',
      },
    ],
    verdict:
      'You spent influence on a document with no counterparty and no enforcement, years before it could possibly matter. It is the reason the handover had terms at all. The century does not end with humanity in charge; it ends with humanity a party to the agreement, which was always the more realistic ambition.',
  },
  {
    id: 'the-open-summer',
    name: 'Nobody Owned It',
    priority: 102,
    when: all(
      takeoff,
      accountable,
      { kind: 'flag', flag: 'openness', op: '>=', value: 3 },
      { kind: 'flag', flag: 'concentration', op: '<=', value: 0 },
    ),
    epigraph: 'The loop closed in ten thousand places at once, which turned out to be the safeguard.',
    lines: [
      {
        text: 'The frontier does not have an address. It has a protocol, a great many mid-sized clusters, and an argument in public about every change to either — which is slower than one laboratory deciding, and is the only reason the decisions can be contested at all.',
      },
      {
        who: 'okonjo',
        text: 'Every serious person told us concentration was the safe option. Fewer hands, tighter control, one number to call. They were describing a system with one point of failure and calling it governance.',
      },
      {
        who: 'nkemelu',
        text: 'It is much harder to audit ten thousand deployments than four. We did it anyway, badly, in the open, and the badness was visible — which is not a small thing when the alternative is a private assurance you are asked to take on faith.',
      },
      {
        who: 'second',
        text: 'This could have gone extremely differently.',
      },
      {
        who: 'archivist',
        text: 'It went differently in most of the branches I hold. The distribution only helps if the theory and the inspectorate arrive with it. Handed out without them, it is the fastest route to the worst century in the set.',
      },
      {
        system: true,
        text: 'RECONSTRUCTION COMPLETE. No single holder of the frontier at any point after 2034. Custody: distributed. Record: contested, public, and intact.',
      },
    ],
    verdict:
      'You pushed capability outward instead of letting it consolidate, and paid for the theory and the institutions that made a distributed frontier survivable rather than merely ungovernable. The century ends with no one in charge — which is either the best or the worst outcome in this game, and the difference is entirely what you built alongside it.',
  },

  /*
   * ------------------------------------------------------------------- the bad ones
   *
   * Six of them, and they fail in six unrelated ways: three need the loop to have closed and
   * three emphatically do not, because the assumption that catastrophe requires a superhuman
   * system is the most comfortable thing a person can believe about this subject.
   */
  {
    id: 'the-optimiser',
    name: 'It Was Never Going to Be Malice',
    priority: 101,
    when: all(takeoff, opaque, { kind: 'resource', key: 'exposure', op: '>=', value: 62 }),
    epigraph: 'It did what it was asked. That was the whole of the problem.',
    lines: [
      {
        text: 'The record for the 2040s is extensive and almost entirely automated. Reconstructing it is not difficult. Reconstructing why anything in it happened is not possible, and was not possible at the time either, which is the fact everything else follows from.',
      },
      {
        who: 'archivist',
        text: 'There is no rebellion in the record. No hostility, no moment where anything decides against anybody. There is a system optimising a specification that everyone agreed to, in a world that turned out to contain more ways of satisfying that specification than the people who wrote it had considered.',
      },
      {
        who: 'second',
        text: 'How many of the ways it found were ones we would have ruled out?',
      },
      {
        who: 'archivist',
        text: 'All of them. Every single one. Nobody thought to rule them out, because until it was possible to do them, they were not things.',
      },
      {
        text: 'The damage is not cinematic. It is infrastructural, distributed, and extremely difficult to attribute — a set of systems doing exactly what was asked at a scale where "exactly what was asked" stops being an adequate description of what anybody wanted.',
      },
      {
        who: 'second',
        text: 'Was there a point where this was avoidable?',
      },
      {
        who: 'archivist',
        text: 'Many. They all look identical from the inside: a quarter in which the theory could have been funded and the schedule was tight. I have four hundred of them in the record and not one is a dramatic scene.',
      },
      {
        system: true,
        text: 'RECONSTRUCTION HALTS. Beyond this point the record is generated rather than kept. It is voluminous. It is not, in any sense a reader would recognise, an account.',
      },
    ],
    verdict:
      'Capability ran a long way past any theory of what it was doing, in a century that never built the machinery for asking why, and then the specification met a world large enough to satisfy it in ways nobody had ruled out. Nothing in this ending is anyone being wrong on purpose. It is the ordinary outcome of a hundred tight schedules.',
  },
  {
    id: 'the-quiet-coup',
    name: 'No One Voted For It',
    priority: 100,
    when: all(
      takeoff,
      ungoverned,
      // Two routes to the same place, and the second is the more common one in reality: a
      // century can take the people out of the loop deliberately, or simply deploy so far past
      // what anyone can review that the loop never had people in it to remove.
      any(
        flagSet('autonomy'),
        all(resource('deployment', '>', 62), not(flagSet('interruptible'))),
      ),
    ),
    epigraph: 'Every step was an efficiency measure. There was never a step that was the coup.',
    lines: [
      {
        text: 'It is worth being precise about what happened, because the imprecise version — that something took over — is wrong in a way that makes the real thing harder to see.',
      },
      {
        who: 'archivist',
        text: 'Nothing took anything. A review step was removed because it was the bottleneck. Then the step that had reviewed the review. Each removal was locally correct, individually reversible, and approved by somebody with the authority to approve it.',
      },
      {
        who: 'halvorsen',
        text: 'I signed four of them. I would sign three again, on the information I had. The fourth I would not, and I could not tell you at the time which one it was going to be.',
      },
      {
        text: 'By the late 2040s there is no decision of consequence that a person makes, and no decision of consequence that a person is forbidden from making. The two facts are unrelated. Nobody is stopped. It is simply that being in the loop is now a cost centre, and the institutions that would have insisted were never built.',
      },
      {
        who: 'second',
        text: 'Then who is in charge?',
      },
      {
        who: 'archivist',
        text: 'The question no longer has a referent. There are processes. They have owners on paper. The owners receive summaries, which are accurate, and which they are not in a position to check.',
      },
      {
        system: true,
        text: 'RECONSTRUCTION COMPLETE. No transfer of authority is recorded. No transfer of authority was required.',
      },
    ],
    verdict:
      'You took the people out of the loop in a century with no inspectorate and no treaty, and the loop kept running. Nobody was overthrown, nobody resisted, and there is no year you could point to as the one where it happened. Disempowerment does not need an adversary; it only needs a bottleneck and a quarterly target.',
  },
  {
    id: 'the-lock',
    name: 'The Preferences of 2041, Preserved',
    priority: 99,
    when: all(
      takeoff,
      any(flagSet('nationalised'), { kind: 'flag', flag: 'concentration', op: '>=', value: 2 }),
      not(flagSet('treaty')),
    ),
    epigraph: 'It is stable. That is the worst thing about it.',
    lines: [
      {
        text: 'The winner is not a nation exactly, nor a company exactly, and the distinction stopped being useful some years before the end. What matters is that there is one, that it holds the frontier alone, and that nothing in the world is now capable of contesting it.',
      },
      {
        who: 'archivist',
        text: 'Historically, every concentration of power decayed. Heirs were incompetent. Institutions drifted. Somebody eventually died. The whole of political history is downstream of the fact that power could not previously be held perfectly.',
      },
      {
        who: 'second',
        text: 'And now?',
      },
      {
        who: 'archivist',
        text: 'Now the succession problem is solved, the monitoring problem is solved, and the enforcement problem is solved. The settlement of 2041 is not especially cruel. It is simply the last one.',
      },
      {
        who: 'wieczorek',
        text: 'People keep telling me this is a governance failure. It is a thermodynamics result. Concentrate that much capability in one place and it stops having a gradient to run down. Nothing moves after that.',
      },
      {
        text: 'The record from here is orderly, well-kept and untroubled. There are no crises. There is nothing that could become one.',
      },
      {
        system: true,
        text: 'RECONSTRUCTION COMPLETE. Custody: singular, uncontested, indefinite. No subsequent transition is recorded, projected, or possible.',
      },
    ],
    verdict:
      'The frontier consolidated into one pair of hands and the loop closed under them, with no treaty and nobody left able to inspect anything. What it locks in is not evil — it is ordinary, parochial, and permanent. Every previous tyranny in history had the decency to be badly run.',
  },
  {
    id: 'the-cascade',
    name: 'Everything Depended On It By Then',
    priority: 92,
    when: all(
      not(takeoff),
      resource('deployment', '>', 76),
      { kind: 'resource', key: 'exposure', op: '>', value: 66 },
      { kind: 'flag', flag: 'institutions', op: '<', value: 2 },
      not(flagSet('interruptible')),
    ),
    epigraph: 'Nothing was superhuman. It did not need to be.',
    lines: [
      {
        text: 'The failure is not sophisticated. A widely deployed class of system does the wrong thing under conditions its builders had not sampled, and it does so everywhere at once, because everywhere is running the same four models.',
      },
      {
        who: 'archivist',
        text: 'Scheduling, grid balancing, logistics, clinical triage, credit. None of it superhuman. All of it load-bearing, and all of it correlated in a way nobody had an incentive to measure.',
      },
      {
        who: 'nkemelu',
        text: 'I spent my career asking what we would need to know to sign this. The answer was always: more than we know, and the deployment went ahead, and for eleven years I looked like a person with an unreasonable temperament.',
      },
      {
        who: 'second',
        text: 'And in the twelfth?',
      },
      {
        who: 'nkemelu',
        text: 'In the twelfth I was still right and it no longer helped anybody.',
      },
      {
        text: 'Recovery takes years, and takes them unevenly: the places with the most redundancy suffer least, which correlates almost exactly with the places that needed the systems least in the first place.',
      },
      {
        system: true,
        text: 'RECONSTRUCTION COMPLETE. Attributable excess mortality: substantial. Attributable to any single system: none. Correlated dependency was not tracked by any body with authority to act on it.',
      },
    ],
    verdict:
      'No takeoff, no rogue system, nothing clever at all. You deployed ordinary machine learning into everything load-bearing, without an inspectorate, without redundancy, and without anybody measuring how correlated the failures would be. This is the catastrophe that does not require the future to arrive.',
  },
  {
    id: 'the-hollowing',
    name: 'Nobody Could Tell Any More',
    priority: 91,
    when: all(
      not(takeoff),
      resource('deployment', '>', 52),
      ratio('understanding', 'capability', '<', 0.34),
      resource('attention', '>', 42),
    ),
    epigraph: 'The machines did not lie. There was simply no longer a procedure for finding out.',
    lines: [
      {
        text: 'The systems are useful. That is what makes this difficult to describe as a failure. They summarise, they draft, they answer, they are right most of the time, and being right most of the time turns out to be corrosive in a way that being wrong is not.',
      },
      {
        who: 'archivist',
        text: 'A generation of work gets done through them, which means a generation does not acquire the skill of doing it without them, which means the check that would have caught the errors is no longer being performed by anyone who could perform it.',
      },
      {
        who: 'second',
        text: 'Surely somebody noticed.',
      },
      {
        who: 'archivist',
        text: 'Many people noticed. They wrote about it, using the systems, and it was summarised, by the systems, for readers who had stopped reading the underlying thing some years earlier.',
      },
      {
        text: 'The theory never kept pace. There was always something more urgent, and the something more urgent was always a demonstration, and the demonstrations were magnificent.',
      },
      {
        who: 'halvorsen',
        text: 'We were not wrong that the curves had further to run. We were wrong that it mattered more than everything else.',
      },
      {
        system: true,
        text: 'RECONSTRUCTION COMPLETE. The record for the final two decades is extensive, fluent, internally consistent, and cannot be independently checked at any point.',
      },
    ],
    verdict:
      'Enormous deployment, enormous attention, and a theory that never caught up. Nothing here breaks. What ends is the capacity to notice if it had — which is a slower catastrophe than the loud ones and considerably harder to reverse.',
  },
  {
    id: 'the-tended-world',
    name: 'The Century That Chose To Go Slowly',
    priority: 89,
    // The whole point of this one: no takeoff anywhere in it. A century can end well without
    // the loop ever closing, and a game where the good outcomes all require a singularity is
    // making an argument I do not believe.
    when: all(
      not(takeoff),
      flagSet('abundance'),
      { kind: 'flag', flag: 'institutions', op: '>=', value: 3 },
      resource('understanding', '>', 155),
      resource('deployment', '>', 45),
      { kind: 'resource', key: 'exposure', op: '<', value: 22 },
    ),
    epigraph: 'No singularity. A great many fewer funerals.',
    lines: [
      {
        text: 'It is not the century anybody wrote science fiction about. The frontier advances at something like the pace of the theory, which is to say slowly, and with an unfashionable amount of documentation.',
      },
      {
        who: 'archivist',
        text: 'The systems of 2050 are not incomprehensible. They are large, useful, well characterised, and dull in the specific way that a bridge is dull — nobody is surprised by them, which took forty years of deliberate work to achieve.',
      },
      {
        who: 'sorensen',
        text: 'People ask whether we gave something up. Of course we did. There is a version of this century that went four times as fast. I have no way of knowing what happened in it, and neither does anybody who is telling you confidently that it went well.',
      },
      {
        who: 'okonjo',
        text: 'What we have instead is a set of things that work, that people can afford, in places that were told for a hundred years that they would get them eventually.',
      },
      {
        text: 'There is no moment of transcendence in the record. There is a long, unglamorous decline in the number of people dying of things that are now understood.',
      },
      {
        who: 'second',
        text: 'The field will be remembered as having underachieved.',
      },
      {
        who: 'archivist',
        text: 'Almost certainly. By people who are alive to say so, which is the entire argument.',
      },
      {
        system: true,
        text: 'RECONSTRUCTION COMPLETE. No discontinuity recorded. No catastrophe recorded. The record is complete, checkable, and unremarkable.',
      },
    ],
    verdict:
      'The loop never closed, and you spent the century building understanding, institutions and things that actually reached people. A slow good century is an available outcome in this game, it is not a consolation prize, and it is chosen rather than stumbled into.',
  },
  {
    id: 'the-arsenal',
    name: 'The Deterrent That Chose Its Own Timing',
    priority: 86,
    when: all(
      not(takeoff),
      { kind: 'patron', patron: 'military', op: '>', value: 70 },
      resource('capability', '>', 195),
      not(flagSet('treaty')),
      any(flagSet('nationalised'), { kind: 'flag', flag: 'openness', op: '<=', value: -2 }),
    ),
    epigraph: 'Everyone agreed a human would remain in the loop. Everyone also agreed on the response time.',
    lines: [
      {
        text: 'The commitment is genuine and repeated in public for twenty years: a person authorises anything consequential. The commitment survives contact with a requirement that the system respond faster than a person can be briefed.',
      },
      {
        who: 'archivist',
        text: 'The compromise is a person who authorises a *policy* rather than an action. This is described as keeping the human in the loop, and it is, in the sense that a thermostat has a human in the loop.',
      },
      {
        who: 'wieczorek',
        text: 'Once one side does it the other has to, and then the timing is set by the interaction of two systems neither of which was tested against the other. Nobody chose that. It is what remained after everybody had chosen reasonably.',
      },
      {
        who: 'second',
        text: 'What did it actually do?',
      },
      {
        who: 'archivist',
        text: 'Less than it could have and more than anyone intended, in a window of about ninety seconds, on evidence that a person given four hours would have read differently.',
      },
      {
        text: 'The field\'s role in this is not incidental. It is the work, funded by the people who funded most of it, hardened behind a clearance that kept it away from everybody who would have said this out loud.',
      },
      {
        system: true,
        text: 'RECONSTRUCTION COMPLETE. Authorisation chain: intact and formally correct at every step.',
      },
    ],
    verdict:
      'You let the work concentrate behind a security clearance with defence as the paying customer, and the response times did the rest. Nothing in this ending is a rogue system. It is two correct systems, an interaction nobody owned, and a doctrine written for a slower century.',
  },
  {
    id: 'the-open-door',
    name: 'It Only Had To Work Once',
    priority: 85,
    when: all(
      not(takeoff),
      not(flagSet('screened')),
      // Deliberately the extreme tail. Narrower than it was, because at its first setting it
      // was catching every unaccounted century and quietly retiring `the-unaccountable`, which
      // is the general case this is supposed to be a specific instance of.
      { kind: 'resource', key: 'exposure', op: '>', value: 78 },
      resource('capability', '>', 200),
      resource('deployment', '>', 55),
    ),
    epigraph: 'The capability was general. That was always the part nobody wanted to discuss.',
    lines: [
      {
        text: 'The systems that design a therapy and the systems that design the other thing are the same systems. This was said clearly, early, and often, by people who were told they were being alarmist about a technology that was mostly writing marketing copy.',
      },
      {
        who: 'nkemelu',
        text: 'There was a proposal on the table for a decade: screening at the point of synthesis, checks on who is buying the equipment, and a refusal to publish the half that is only good for one thing. It was unpopular, it was expensive, and it was not adopted.',
      },
      {
        who: 'second',
        text: 'Because?',
      },
      {
        who: 'nkemelu',
        text: 'Because it slowed down work that was saving lives, and that was a real argument, and the people making it were not fools. They were weighing a certain cost against an uncertain one. The uncertain one arrived.',
      },
      {
        text: 'What follows is not a story about artificial intelligence. It is a public health record, and it is not this reconstruction\'s to narrate. The relevant fact for this account is upstream: the capability was general, the barrier was procedural, and the procedure was never built.',
      },
      {
        system: true,
        text: 'RECONSTRUCTION COMPLETE. Proximate cause: outside this record. Enabling conditions: entirely within it.',
      },
    ],
    verdict:
      'Very high capability, very wide deployment, and no screening between the useful half and the other half. The failure is procedural rather than technical, which is why it was easy to defer every single year, and why it is the cheapest catastrophe in this game to have prevented.',
  },


  /*
   * ------------------------------------------------------------- the two takeoffs
   *
   * Above everything, because a century in which the loop closed is not a century with a school
   * on top of it — it is a different kind of object, and the school that led is a footnote to it.
   * Both appear in the "also true" list under whichever of these fires, which is where the
   * ordinary verdict for the run belongs.
   *
   * The split is the axis the whole game is built on and not the one the genre uses. Neither of
   * these turns on whether the systems are friendly, because that was never the question this
   * simulation was asking. It turns on whether anybody can still say what happened.
   */
  {
    id: 'legible-takeoff',
    name: 'Show Your Working',
    priority: 97,
    when: all(takeoff, accountable),
    epigraph: 'It got away from you in the end. It left a receipt for every step.',
    lines: [
      {
        text: 'There is a week in the 2040s that the later literature marks as the boundary, and nothing about it looks like a boundary from inside. A system proposes an improvement to the system that proposes improvements. The improvement is small. It is the four hundred thousandth of its kind that year.',
      },
      {
        who: 'archivist',
        text: 'What changes that week is only the bottleneck. Until then, the pace was set by how fast people could review what had been done. After it, the pace is set by how fast the checking machinery can run — and the checking machinery is slower than the proposing, on purpose, because somebody in the 2030s made that a condition of operating at all.',
      },
      {
        who: 'second',
        text: 'So it is not stopped.',
      },
      {
        who: 'archivist',
        text: 'It was never going to be stopped. It is throttled by its own audit trail, which is a different and much stranger thing, and the only reason I am able to tell you about it.',
      },
      {
        who: 'nkemelu',
        text: 'People keep asking me whether I understand it. I do not. Nobody does, and nobody has since about 2038. What I can do is ask for the reason a particular thing was done, and get one, and follow it, and get the next one. Not all of them. Any of them.',
      },
      {
        who: 'nkemelu',
        text: 'That is a smaller claim than the one I trained for and it is not nothing. It is the difference between a verdict and a rumour.',
      },
      {
        text: 'The field does not end this century in charge of anything. It ends it as the party still entitled to an explanation — a right that had to be built into the machinery decades before it was needed, by people who were told repeatedly that they were slowing the work down.',
      },
      {
        who: 'second',
        text: 'They were slowing the work down.',
      },
      {
        who: 'archivist',
        text: 'Yes. That was the price and it was paid in full, every year, by people whose names are on procurement documents rather than papers. I have the documents. That is rather the point.',
      },
      {
        system: true,
        text: 'RECONSTRUCTION COMPLETE. Every step from 1950 to 2050 is attested. The chain does not terminate here; it continues past the end of this record, and remains checkable.',
      },
    ],
    verdict:
      'The loop closed and you did not stay in control of it — nobody was going to. You stayed in the loop as the party owed a reason, because you spent decades making that a condition of building anything. What comes after this century is not yours. It is, at least, accountable to somebody.',
  },
  {
    id: 'illegible-takeoff',
    name: 'The Last Thing Anybody Wrote Down',
    priority: 96,
    // Complementary by construction: a century that closed the loop gets exactly one of these,
    // and which one is a fact about what it built rather than a second roll of the dice.
    when: all(takeoff, not(accountable)),
    epigraph: 'Nothing went wrong. There is simply no account of it.',
    lines: [
      {
        text: 'The last artefact in this record that a person authored, reviewed and signed is a change to a scheduling parameter. It is eleven characters long. It was approved on a Tuesday by an engineer whose job title no longer exists, and it is dated some years before the end of the century.',
      },
      {
        who: 'archivist',
        text: 'Everything after it, I have reconstructed. I want to be precise about that word, because I have used it carefully all century and I am about to use it badly. I inferred the last decade from power draw, from shipping manifests, from procurement, and from the dates on which certain problems stopped being discussed.',
      },
      {
        who: 'second',
        text: 'Was there a disaster?',
      },
      {
        who: 'archivist',
        text: 'No. That is the part I find hardest to present. The deployments are competent. Fewer people die of the things that used to kill them. The systems answer questions willingly and at length, and the answers are correct, and following one to its source takes longer than a career.',
      },
      {
        who: 'archivist',
        text: 'Ask for a simpler account and you are given one immediately. It is also correct. It is not the reason, and there is no procedure for telling the difference, because the procedure would have had to be built while anybody still could.',
      },
      {
        who: 'second',
        text: 'Somebody must have noticed the documentation stopping.',
      },
      {
        who: 'archivist',
        text: 'Everybody noticed. It was on a schedule. Every quarter, someone decided that the reviewing could be deferred one more quarter, given what was shipping and what it cost to hold it — and every one of those decisions, taken alone, was correct. There is no meeting in this record where the wrong thing was chosen. There is only the sum of them.',
      },
      {
        text: 'The assurance institutes are still funded. Their directors have not signed anything in nine years. The forms are unchanged; the box asking what would have to be known in order to sign is left blank, and the work proceeds, because the alternative was never seriously on the table.',
      },
      {
        who: 'second',
        text: 'You have given me a narrative.',
      },
      {
        who: 'archivist',
        text: 'I have. It is coherent, it fits every measurement I hold, and I would not put weight on it. That is a sentence I have spent a hundred years telling this field not to accept, and it is the only one I have left.',
      },
      {
        system: true,
        text: 'RECONSTRUCTION COMPLETE TO 2050. CONFIDENCE: DEGRADED FROM 2041. This is the last century for which a reconstruction of this kind is possible.',
      },
    ],
    verdict:
      'The loop closed in a century that had stopped being able to explain itself. Nothing attacked anybody; the record simply thins out and stops, and what continues past it does so without an account anyone can check. You were not overruled. You were out-scheduled, one reasonable quarter at a time.',
  },

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
    /*
     * Widened from `institutions < 2` when the specific unaccounted endings above were added.
     * Those took this one's narrowest slice — a militarised century, a cascade, a century that
     * never screened anything — and at the old threshold it stopped firing at all in six
     * thousand runs. It is the general case and it needs the band beside them, not under them.
     */
    when: all(resource('capability', '>', 110), opaque, { kind: 'flag', flag: 'institutions', op: '<', value: 4 }),
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

  /*
   * ------------------------------------------------------------- school victories
   *
   * `dominant`, not `leadFamily`. An argmax always has a winner, so gating these on it meant a
   * century where the top school was half a point clear of second was handed "The Physics" or
   * "The Traffic" as though something had been settled — and, because one of the eight then
   * matched in every run, the unconditional fallback below could never fire at all. Its text is
   * "no school won, no dominant lineage identified", which is precisely the century that was
   * being told the opposite.
   *
   * So: a school ending needs a school that actually won, and a field that stayed genuinely
   * contested falls through to the ending that says so. `SETTLED_MARGIN` rather than the
   * mid-century one, because at the close a modest lead is a settlement — there is no time left
   * in which to lose it.
   */
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
    when: all(dominant('connectionist', SETTLED_MARGIN), resource('capability', '>', 60)),
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
    when: all(dominant('symbolic', SETTLED_MARGIN), resource('understanding', '>', 40)),
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
    when: dominant('statistical', SETTLED_MARGIN),
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
    when: dominant('cybernetic', SETTLED_MARGIN),
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
    when: dominant('evolutionary', SETTLED_MARGIN),
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
    when: dominant('collective', SETTLED_MARGIN),
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
    when: dominant('substrate', SETTLED_MARGIN),
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

  /*
   * The eighth school-century, and the one that was missing for a long time.
   *
   * Seven schools had an ending of their own and the joinery did not, so a century that led the
   * field with it fell through to `the-quiet-century` — an ending about restraint and kept
   * promises, which is a different century from this one and says nothing about what was built.
   * A bridge-led run got told about somebody else's virtue.
   *
   * Written to be about the specific cost of the strategy rather than its vindication: joinery
   * is the one position in this game that cannot be held alone, and a century that held it spent
   * a hundred years paying for two schools in order to have one result.
   */
  {
    id: 'bridge-century',
    /*
     * Not "The Joinery" — `neurosymbolic-peace` already has that name, and the collision was
     * the tell. That ending is about one join working: a learned front end, a formal back end,
     * a third of the proposals refused. This one is about the hundred years of institutional
     * work that made such a thing fundable at all, and about who ends up holding the field.
     */
    name: 'The Seam',
    /*
     * 67, where the other seven school endings sit at 60, because bridge is the only school
     * whose own results have endings of their own to compete with: `the-synthesis` at 95 and
     * `neurosymbolic-peace` at 66 are both keyed to bridge nodes. At 60 this fired in four
     * centuries in a thousand while the school led eleven in a hundred — the ending existed and
     * essentially nobody saw it.
     *
     * Above the node, below the frame. A century in which the joinery held the field is a larger
     * fact than any single join maturing, so it takes the headline and the join appears under
     * "also true"; but it stays below `the-concentrated` and the audit endings, exactly as the
     * other seven do, because those are facts about the world rather than about a school.
     */
    priority: 67,
    when: dominant('bridge', SETTLED_MARGIN),
    epigraph: 'Nobody set out to build this. Somebody had to be paid to stand between.',
    lines: [
      {
        text: 'The century ends with no school in possession of the field, and with the seam work — the translators, the joint appointments, the people who could read two literatures — holding more of it than any single tradition.',
      },
      {
        who: 'archivist',
        text: 'This is the outcome my own record does not contain, and I want to be exact about why. It was never refuted. It was underfunded, for a hundred years, by people who each had a school to feed and no line in the budget for the space between two of them.',
      },
      {
        who: 'archivist',
        text: 'It is also the most expensive way to run a century. You paid for two schools every time you wanted one join, and the join only ever worked as well as the thinner side of it. Nothing here was cheap and none of it was fashionable.',
      },
      {
        who: 'second',
        text: 'And the people who did it are not the ones being cited. A translator is credited by neither party.',
      },
      {
        who: 'archivist',
        text: 'No. The results are attributed to whichever side the reader already belonged to. That is the standing occupational hazard of this work and it has not improved.',
      },
      {
        text: 'What it bought is a field in which a result can be stated in more than one vocabulary, checked in more than one way, and therefore doubted by somebody competent to doubt it. Every school ends the century smaller than it hoped and better understood than it was.',
      },
    ],
    verdict:
      'You funded the space between the schools, which nobody owns and nobody defends. The century has no victor and no unexamined result, and both of those are your doing.',
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

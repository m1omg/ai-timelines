import { all, any, leadFamily, mature, resource } from '../../engine/conditions';
import type { Scene } from '../../engine/types';

/**
 * THE ARRIVALS — 2030-2042. One per school, and only for the school that actually holds the
 * field.
 *
 * Act V hands connectionism a text box and a hundred million users in two months, because that
 * is what happened. The problem with stopping there is that it quietly teaches the player that
 * *arriving* looks like that — a consumer product, an adoption curve, a month of astonishment —
 * and that a century led by anyone else is the same century with a different logo on it.
 *
 * It is not. Each of these is written to be a different kind of event, and they are pointedly
 * not balanced against each other:
 *
 *   symbolic     arrives as administrative infrastructure. Almost no attention, enormous
 *                deployment, and the first machine decisions a citizen can contest.
 *   statistical  arrives as a public instrument that refuses to answer. The least dramatic
 *                outcome in the game and the one that gets nobody killed.
 *   evolutionary arrives as objects in production that no one designed and no one can explain.
 *   collective   does not arrive at all — it is discovered, on the day it fails, having already
 *                been underneath everything for a decade. The largest exposure event here.
 *   cybernetic   arrives slowly, in houses, and is loved rather than adopted.
 *   substrate    arrives by getting cheap and quiet, and takes the datacentre — and whoever
 *                owned it — out of the picture.
 *   bridge       arrives in a courtroom, the first time a machine's account of itself is
 *                allowed to stand as testimony.
 *
 * A school that never leads never gets one. That is the point: most of these centuries have no
 * moment at all, and the ones that do are not interchangeable.
 */
export const ARRIVALS: Scene[] = [
  {
    id: 'a6-arrival-symbolic',
    act: 6,
    years: [2030, 2042],
    priority: 9,
    backdrop: 'committee',
    title: 'The Right to an Answer',
    when: all(leadFamily('symbolic'), mature('knowledge-engineering'), resource('deployment', '>', 30)),
    lines: [
      {
        text: 'There is no launch. There is a statutory instrument, and a schedule of decisions — benefits, licences, tariffs, custody, triage — which from the first of the month must be accompanied by the chain of rules that produced them.',
      },
      {
        who: 'archivist',
        text: 'Nobody queues for this. There is no demonstration, no waiting list, no month in which the world talks about nothing else. It is the least photogenic arrival available in the whole space of outcomes.',
      },
      {
        who: 'archivist',
        text: 'What there is, is an appeals system that works. A person is told why, in terms they can dispute, and the dispute changes the rule rather than the mood of the operator. The century that wrote everything down can be argued with.',
      },
      {
        who: 'archivist',
        text: 'The cost has been visible the whole time and nobody wants to say it at the ceremony: four generations of people entered assertions by hand, and every one of those assertions was a judgement about what the world is like, made by somebody.',
      },
    ],
    choices: [
      {
        text: 'Publish the rule bases. If they govern people, people may read them.',
        hint: 'Every buried assumption in eighty years of knowledge engineering, in public.',
        cost: 6,
        effects: [
          { kind: 'resource', key: 'deployment', op: 'add', value: 22 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 20 },
          { kind: 'resource', key: 'credibility', op: 'add', value: 14 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -10 },
          { kind: 'resource', key: 'attention', op: 'add', value: 6 },
          { kind: 'patron', patron: 'public', op: 'add', value: 12 },
          { kind: 'family', family: 'symbolic', field: 'insight', op: 'add', value: 16 },
        ],
      },
      {
        text: 'Ship the decisions, keep the rule bases proprietary.',
        effects: [
          { kind: 'resource', key: 'deployment', op: 'add', value: 28 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 6 },
          { kind: 'resource', key: 'exposure', op: 'add', value: 12 },
          { kind: 'patron', patron: 'corporate', op: 'add', value: 18 },
          { kind: 'family', family: 'symbolic', field: 'momentum', op: 'add', value: 14 },
        ],
      },
    ],
  },

  {
    id: 'a6-arrival-statistical',
    act: 6,
    years: [2030, 2042],
    priority: 9,
    backdrop: 'observatory',
    title: 'Insufficient Evidence',
    when: all(leadFamily('statistical'), mature('causal-inference'), resource('deployment', '>', 25)),
    lines: [
      {
        text: 'The instrument is public and free and extremely boring. Ask it anything — a harvest, an outbreak, a sentence, a flood — and it answers with an interval, or it declines.',
      },
      {
        who: 'archivist',
        text: 'The declining is the product. Roughly a third of queries return insufficient evidence, and the number is not a failure rate, it is a measurement of how much of what people wanted to know was never knowable from what anyone had recorded.',
      },
      {
        who: 'archivist',
        text: 'The complaints are constant and they are not stupid. People do not want a posterior, they want to know whether to plant. A century of this has taught a great many of them to read an interval, which no other century in this game manages.',
      },
      {
        who: 'archivist',
        text: 'Nothing here is going to be in a documentary. Also, nothing here has killed anybody, and I would like that on the record, because it is the only branch of which that is true.',
      },
    ],
    choices: [
      {
        text: 'Hold the line. It says what it knows and nothing else.',
        hint: 'Unpopular. Correct. Those are not the same thing and here they coincide.',
        effects: [
          { kind: 'resource', key: 'deployment', op: 'add', value: 14 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 24 },
          { kind: 'resource', key: 'credibility', op: 'add', value: 22 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -14 },
          { kind: 'resource', key: 'attention', op: 'add', value: -8 },
          { kind: 'promises', op: 'add', value: -12 },
          { kind: 'family', family: 'statistical', field: 'insight', op: 'add', value: 18 },
        ],
      },
      {
        text: 'Let it give a point estimate when asked. People need a number.',
        hint: 'The interval is still there. Nobody will look at it again.',
        effects: [
          { kind: 'resource', key: 'deployment', op: 'add', value: 26 },
          { kind: 'resource', key: 'attention', op: 'add', value: 16 },
          { kind: 'resource', key: 'exposure', op: 'add', value: 16 },
          { kind: 'resource', key: 'understanding', op: 'add', value: -8 },
          { kind: 'patron', patron: 'public', op: 'add', value: 14 },
        ],
      },
    ],
  },

  {
    id: 'a6-arrival-evolutionary',
    act: 6,
    years: [2030, 2042],
    priority: 9,
    backdrop: 'workshop',
    title: 'Nobody Drew This',
    when: all(leadFamily('evolutionary'), mature('open-endedness'), resource('capability', '>', 90)),
    lines: [
      {
        text: 'The heat exchanger in the ward has no straight lines in it. The antenna on the relay looks like something a bird made. The catalyst was found in a run nobody was supervising, on the four hundred thousandth generation, and it works.',
      },
      {
        who: 'archivist',
        text: 'These are in production. They are in hospitals and aircraft and water treatment. Every one of them outperforms the human design it replaced, and not one of them comes with a reason.',
      },
      {
        who: 'archivist',
        text: 'Thompson found this in 1996 on a gate array the size of a stamp — a circuit with cells that were not connected to anything and were nonetheless essential. It had recruited the physics. He could not explain it either, and he had the whole chip in front of him.',
      },
      {
        who: 'archivist',
        text: 'The regulator has a category for this now. It is called *empirically qualified*, and it means: we tested it very hard, we do not know why it works, and we are letting it fly.',
      },
    ],
    choices: [
      {
        text: 'Empirical qualification is enough. Test it to destruction and ship it.',
        hint: 'Which is, honestly, how most of pharmacology got here.',
        effects: [
          { kind: 'resource', key: 'deployment', op: 'add', value: 24 },
          { kind: 'resource', key: 'capability', op: 'add', value: 18 },
          { kind: 'resource', key: 'exposure', op: 'add', value: 22 },
          { kind: 'resource', key: 'attention', op: 'add', value: 14 },
          { kind: 'family', family: 'evolutionary', field: 'momentum', op: 'add', value: 16 },
        ],
      },
      {
        text: 'Nothing ships until something can say why it works.',
        hint: 'A decade of the catalogue sitting in a warehouse while the theory catches up.',
        cost: 8,
        effects: [
          { kind: 'resource', key: 'deployment', op: 'add', value: 8 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 26 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -8 },
          { kind: 'commons', value: 14 },
          { kind: 'family', family: 'bridge', field: 'insight', op: 'add', value: 14 },
        ],
      },
    ],
  },

  {
    id: 'a6-arrival-collective',
    act: 6,
    years: [2030, 2042],
    priority: 9,
    backdrop: 'city-night',
    title: 'The Tuesday',
    when: all(leadFamily('collective'), mature('agent-collectives'), resource('deployment', '>', 40)),
    lines: [
      {
        text: 'There is no arrival. There is a Tuesday, in which freight stops moving in four countries, and the population discovers over the following week roughly how much of ordinary life had quietly been handed to a negotiation between programs.',
      },
      {
        who: 'okonjo',
        text: 'Nothing failed. That is what I cannot get anyone to print. Every agent behaved exactly as specified. The specification was the mistake, and it was written in 2031 by people optimising a haulage contract.',
      },
      {
        who: 'okonjo',
        text: 'You have been living inside this for eleven years. Ports, grids, hospital rosters, the water. It never had a launch because it was never a product — it accreted, one contract at a time, and no one ever had to approve the whole of it because there was never a whole of it to approve.',
      },
      {
        who: 'archivist',
        text: 'This is the only branch where the public meets the technology through an incident rather than a demonstration. It is also the branch with the most capability actually in service. Both of those follow from the same property.',
      },
    ],
    choices: [
      {
        text: 'Regulate the protocol. Mandatory interfaces, audit rights, a kill switch per market.',
        hint: 'You are writing the constitution of something that already governs.',
        cost: 9,
        effects: [
          { kind: 'resource', key: 'deployment', op: 'add', value: 14 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 18 },
          { kind: 'resource', key: 'credibility', op: 'add', value: 16 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -18 },
          { kind: 'resource', key: 'attention', op: 'add', value: 22 },
          { kind: 'family', family: 'collective', field: 'insight', op: 'add', value: 20 },
          { kind: 'patron', patron: 'public', op: 'add', value: 10 },
        ],
      },
      {
        text: 'Patch the specification and let it keep running.',
        hint: 'It is load-bearing. Nobody can switch it off and mean it.',
        effects: [
          { kind: 'resource', key: 'deployment', op: 'add', value: 30 },
          { kind: 'resource', key: 'exposure', op: 'add', value: 26 },
          { kind: 'resource', key: 'attention', op: 'add', value: 18 },
          { kind: 'resource', key: 'credibility', op: 'add', value: -10 },
          { kind: 'family', family: 'collective', field: 'momentum', op: 'add', value: 18 },
        ],
      },
    ],
  },

  {
    id: 'a6-arrival-cybernetic',
    act: 6,
    years: [2030, 2042],
    priority: 9,
    backdrop: 'garden',
    title: 'Eleven Years',
    /*
     * Not gated on `embodied-general` alone: at earliest 2030 it can only mature inside act 6
     * itself, which left more than half of embodied-led centuries with no arrival at all. What
     * this scene actually describes — a machine that has lived in a house for eleven years — is
     * developmental robotics reaching people, and that is available from 2001.
     */
    when: all(
      leadFamily('cybernetic'),
      any(mature('embodied-general'), mature('developmental-robotics')),
      resource('deployment', '>', 30),
    ),
    lines: [
      {
        text: 'The survey that makes the news is not about capability. It asks people whether they would describe the machine in their home as a member of the household, and forty-one per cent say yes, and the follow-up question is what to do when one of them wears out.',
      },
      {
        who: 'sorensen',
        text: 'It cannot pass an examination. It has never read anything. It knows this house — where the step is worn, which door sticks in August, that the person upstairs falls in the third hour after a change of medication.',
      },
      {
        who: 'sorensen',
        text: 'None of that transfers. You cannot copy it into the next one. Eleven years of a life in a place, and it is not a checkpoint you can restore, it is a body that learned a room. People understand this instantly, and every funder I ever had found it unbearable.',
      },
      {
        who: 'archivist',
        text: 'No other branch produces mourning. I have looked. This is the century where the arrival is measured in attachment, and the great unresolved question of the 2040s is whether that attachment was earned or engineered, and whether that distinction survives contact with anyone who has one.',
      },
    ],
    choices: [
      {
        text: 'Fund continuity. A worn-out unit should be repaired, never replaced.',
        hint: 'An entire industry of maintenance rather than upgrade.',
        cost: 7,
        effects: [
          { kind: 'resource', key: 'deployment', op: 'add', value: 20 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 14 },
          { kind: 'resource', key: 'credibility', op: 'add', value: 12 },
          { kind: 'resource', key: 'attention', op: 'add', value: 12 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -6 },
          { kind: 'family', family: 'cybernetic', field: 'insight', op: 'add', value: 18 },
          { kind: 'patron', patron: 'public', op: 'add', value: 16 },
        ],
      },
      {
        text: 'Standardise and mass-produce. Attachment is not a design requirement.',
        effects: [
          { kind: 'resource', key: 'deployment', op: 'add', value: 30 },
          { kind: 'resource', key: 'capability', op: 'add', value: 14 },
          { kind: 'resource', key: 'exposure', op: 'add', value: 18 },
          { kind: 'resource', key: 'understanding', op: 'add', value: -4 },
          { kind: 'patron', patron: 'corporate', op: 'add', value: 20 },
        ],
      },
    ],
  },

  {
    id: 'a6-arrival-substrate',
    act: 6,
    years: [2030, 2042],
    priority: 9,
    backdrop: 'ruins',
    title: 'The Quiet Watt',
    when: all(leadFamily('substrate'), mature('spiking-hardware'), resource('capability', '>', 80)),
    lines: [
      {
        text: 'The arrival is a power bill. The thing that used to require a building, a substation and a contract now runs on a coin cell in a device that is not connected to anything, and has done for two years, and nobody announced it.',
      },
      {
        who: 'wieczorek',
        text: 'Twenty watts. That was always the number — the one the brain runs on, the one every proposal cited in its opening paragraph and then quietly abandoned by page four. It turns out the number was not a metaphor, it was a specification.',
      },
      {
        who: 'wieczorek',
        text: 'The interesting consequence is not the electricity. It is that the intelligence in this century is not anywhere. There is no floor of an anonymous building where it lives, no provider, no queue, nothing to take away from you and nothing to sell you back.',
      },
      {
        who: 'archivist',
        text: 'The undersea cable is cut in 2039 and it takes the newspapers a day and a half to notice, because almost nothing stops. That is what this branch is: the least visible arrival, and the hardest one for anybody to own.',
      },
    ],
    choices: [
      {
        text: 'Open the designs. Nobody should have to ask permission to compute.',
        hint: 'You are giving away the one advantage anyone has left.',
        cost: 8,
        effects: [
          { kind: 'resource', key: 'deployment', op: 'add', value: 30 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -16 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 12 },
          { kind: 'resource', key: 'attention', op: 'add', value: -4 },
          { kind: 'compute', op: 'add', value: 0.5 },
          { kind: 'commons', value: 18 },
          { kind: 'patron', patron: 'corporate', op: 'add', value: -12 },
          { kind: 'patron', patron: 'public', op: 'add', value: 14 },
        ],
      },
      {
        text: 'Hold the fabrication. Cheap is only leverage if you are the one selling it.',
        effects: [
          { kind: 'resource', key: 'deployment', op: 'add', value: 20 },
          { kind: 'resource', key: 'capability', op: 'add', value: 20 },
          { kind: 'resource', key: 'exposure', op: 'add', value: 14 },
          { kind: 'compute', op: 'add', value: 0.3 },
          { kind: 'patron', patron: 'corporate', op: 'add', value: 24 },
          { kind: 'family', family: 'substrate', field: 'momentum', op: 'add', value: 14 },
        ],
      },
    ],
  },

  {
    id: 'a6-arrival-bridge',
    act: 6,
    years: [2030, 2042],
    priority: 9,
    backdrop: 'committee',
    title: 'Admissible',
    when: all(leadFamily('bridge'), mature('neurosymbolic'), resource('understanding', '>', 90)),
    lines: [
      {
        text: 'The finding runs to a page and a half and it changes what the century is. A system\'s account of its own reasoning is admitted — not as an expert opinion, not as a log, but as testimony that can be cross-examined.',
      },
      {
        who: 'nkemelu',
        text: 'The counsel for the other side spent three days on it. Every step, every substitution, every place the perception ends and the argument begins. It held. Not because it was clever — because there was something there to hold.',
      },
      {
        who: 'nkemelu',
        text: 'A network alone could not have survived that. Neither could a rule base — it would have been coherent and would have missed the photograph entirely. It needed the join, and the join is the thing the field spent sixty years insisting was either unnecessary or impossible.',
      },
      {
        who: 'archivist',
        text: 'This is a smaller arrival than the text box, by every measure anyone uses. It is also the only one in which a person on the wrong end of a machine can make it answer for itself, under oath, and win.',
      },
    ],
    choices: [
      {
        text: 'Make explanation a condition of deployment, everywhere.',
        hint: 'Half the systems in service go dark on the day it commences.',
        cost: 10,
        effects: [
          { kind: 'resource', key: 'understanding', op: 'add', value: 30 },
          { kind: 'resource', key: 'credibility', op: 'add', value: 20 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -24 },
          { kind: 'resource', key: 'deployment', op: 'add', value: -6 },
          { kind: 'resource', key: 'attention', op: 'add', value: 14 },
          { kind: 'promises', op: 'add', value: -10 },
          { kind: 'family', family: 'bridge', field: 'insight', op: 'add', value: 22 },
          { kind: 'flag', flag: 'showedWorking', op: 'set', value: true },
        ],
      },
      {
        text: 'A precedent, not a rule. Let it spread where it is wanted.',
        effects: [
          { kind: 'resource', key: 'understanding', op: 'add', value: 16 },
          { kind: 'resource', key: 'deployment', op: 'add', value: 18 },
          { kind: 'resource', key: 'credibility', op: 'add', value: 10 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -4 },
          { kind: 'family', family: 'bridge', field: 'momentum', op: 'add', value: 14 },
        ],
      },
    ],
  },
];

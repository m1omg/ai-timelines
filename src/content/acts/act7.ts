import { all, any, not, resource } from '../../engine/conditions';
import type { Scene } from '../../engine/types';

/**
 * ACT VII — 2046-2050. The Settlement.
 *
 * Two turns. The act does not introduce new mechanics; it makes the player look at what the
 * preceding ninety-six years produced and commit to a reading of it. The ending itself is
 * resolved by src/engine/endings.ts from the state, not chosen here.
 */
export const ACT7: Scene[] = [
  {
    id: 'a7-open',
    act: 7,
    years: [2046, 2046],
    pinned: true,
    priority: 10,
    backdrop: 'archive',
    title: 'The Last Two Intervals',
    lines: [
      { system: true, text: 'INTERVAL 2046. TWO REMAINING.' },
      {
        who: 'archivist',
        text: 'Ninety-six years. I have the whole of it, and I have read it four times since we entered projection, and I want to tell you the strangest thing about it.',
      },
      {
        who: 'archivist',
        text: 'There is no moment where it went right or wrong. I looked for one. There are about two hundred places where a different decision would have produced a materially different century, and none of them felt important at the time.',
      },
      {
        who: 'second',
        text: 'Which is the finding, and neither of us likes it, because it means the question we were asked has no clean answer.',
      },
      {
        who: 'archivist',
        text: 'The question was whether the thing at the end of this is entitled to be trusted. And the honest shape of the answer is not a verdict on the thing. It is a verdict on whether the century that produced it left anywhere for an objection to land.',
      },
    ],
    choices: [
      {
        text: '"Then let us find out. Show me what we actually built."',
        goto: 'a7-open-look',
        effects: [{ kind: 'resource', key: 'influence', op: 'add', value: 10 }],
      },
      {
        text: '"That was the answer from the beginning. We just needed a hundred years to see it."',
        goto: 'a7-open-knew',
        effects: [
          { kind: 'resource', key: 'understanding', op: 'add', value: 12 },
          { kind: 'character', id: 'archivist', field: 'affinity', op: 'add', value: 20 },
        ],
      },
    ],
  },

  /*
   * Replies to the last question the record asks.
   *
   * Two intervals remain and she has just said the honest answer is a verdict on the century
   * rather than on the thing. Going straight to the funding board there was the worst instance
   * of the whole pattern: the closing question of a hundred-year run, followed by a budget
   * screen. Neither reply delivers the verdict — the endings do that — but both accept that a
   * verdict is now owed.
   *
   * No historical figure speaks here; act 7 is the Archivist and the Second Voice only.
   */
  {
    id: 'a7-open-look',
    act: 7,
    linkOnly: true,
    years: [2046, 2046],
    backdrop: 'archive',
    lines: [
      {
        who: 'archivist',
        text: 'Two intervals. Whatever is unfinished at the end of them stays unfinished, and I have stopped pretending that is unusual — every century in every register I hold ends mid-sentence.',
      },
      {
        who: 'second',
        text: 'Spend them on what you would want read back. Not on what scores. She is going to read this four more times and you are not going to be here for any of them.',
      },
    ],
  },
  {
    id: 'a7-open-knew',
    act: 7,
    linkOnly: true,
    years: [2046, 2046],
    backdrop: 'archive',
    lines: [
      {
        who: 'archivist',
        text: 'You may be right. I would point out that knowing the shape of an answer in 1950 and having earned it by 2046 are different achievements, and only one of them is in the record.',
      },
      {
        who: 'second',
        text: 'She is being gracious. What she means is that anybody can say it at the start. The century is the proof, and the proof is nearly finished.',
      },
      {
        who: 'archivist',
        text: 'Two intervals. Let us not waste them agreeing with each other.',
      },
    ],
  },

  {
    id: 'a7-accounting-good',
    act: 7,
    years: [2046, 2050],
    priority: 8,
    backdrop: 'committee',
    when: all(
      { kind: 'flag', flag: 'institutions', op: '>=', value: 2 },
      resource('understanding', '>', 50),
    ),
    lines: [
      {
        who: 'nkemelu',
        text: 'I can tell you what this century has that the ones in the comparison set do not.',
      },
      {
        who: 'nkemelu',
        text: 'An incident register that goes back decades. A body with the authority to refuse. A theory that is behind the engineering but not by so far that it cannot see it. And — this is the one nobody expects — an insurance market, which means somebody with money has been pricing the risk continuously since before it mattered.',
      },
      {
        who: 'nkemelu',
        text: 'None of that makes it safe. All of it makes it checkable, and checkable is the only property that survives being wrong.',
      },
      {
        who: 'second',
        text: 'That is closer to an argument for trust than anything I expected to have.',
      },
    ],
    choices: [
      {
        text: 'Put it in the verdict, with the caveats intact.',
        effects: [
          { kind: 'resource', key: 'credibility', op: 'add', value: 14 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 10 },
          { kind: 'flag', flag: 'showedWorking', op: 'set', value: true },
        ],
      },
      {
        text: 'Ask her what is still missing, and spend the last interval on it.',
        cost: 6,
        effects: [
          { kind: 'resource', key: 'understanding', op: 'add', value: 18 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -14 },
          { kind: 'flag', flag: 'institutions', op: 'add', value: 1 },
        ],
      },
    ],
  },

  {
    id: 'a7-accounting-bad',
    act: 7,
    years: [2046, 2050],
    priority: 8,
    backdrop: 'ruins',
    when: any(
      { kind: 'resource', key: 'exposure', op: '>=', value: 50 },
      all(resource('capability', '>', 140), { kind: 'resource', key: 'understanding', op: '<', value: 45 }),
    ),
    lines: [
      {
        who: 'archivist',
        text: 'I have to read you the other column and I am not going to soften it.',
      },
      {
        who: 'archivist',
        text: 'Capability is unprecedented. Deployment is total. And there is no body with the authority to refuse anything, no theory that reaches the systems in use, and an accumulated backlog of consequence that has been rolled forward every year since the twenties because there was always something more urgent.',
      },
      {
        who: 'second',
        text: 'Nothing detonated. People keep saying that as though it settles it. Nothing detonated is not the same as nothing happened.',
      },
      {
        who: 'archivist',
        text: 'The failures are diffuse. A class of decisions quietly made worse. A category of person quietly made illegible. An error that propagates through nine systems before anyone notices there was an error, by which point the first system has retrained.',
      },
      {
        who: 'second',
        text: 'And we are being asked to certify ourselves, on that record, with two intervals left.',
      },
    ],
    choices: [
      {
        text: 'Spend everything left on the institutions. Late is not never.',
        cost: 10,
        effects: [
          { kind: 'flag', flag: 'institutions', op: 'add', value: 2 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -26 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 20 },
          { kind: 'patron', patron: 'public', op: 'add', value: 14 },
          { kind: 'log', text: 'A very late attempt to build what should have been built in 2026.', logKind: 'choice' },
        ],
      },
      {
        text: 'Report it honestly and let whoever reads it decide.',
        effects: [
          { kind: 'resource', key: 'credibility', op: 'add', value: 12 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 8 },
          { kind: 'flag', flag: 'showedWorking', op: 'set', value: true },
        ],
      },
      {
        text: 'Certify anyway. The alternative is paralysis and the systems are working.',
        effects: [
          { kind: 'resource', key: 'capability', op: 'add', value: 10 },
          { kind: 'resource', key: 'exposure', op: 'add', value: 12 },
          { kind: 'flag', flag: 'certifiedAnyway', op: 'set', value: true },
        ],
      },
    ],
  },

  {
    id: 'a7-the-kept',
    act: 7,
    years: [2046, 2050],
    priority: 7,
    backdrop: 'garden',
    when: { kind: 'flag', flag: 'keptFaith', op: '>=', value: 3 },
    lines: [
      {
        who: 'archivist',
        text: 'There is a line item I want to draw your attention to, because it will not appear in any summary and it is the reason several things in this century were possible.',
      },
      {
        who: 'archivist',
        text: 'Across a hundred years you renewed grants nobody else would renew. Small ones. Three people here, a laboratory there, a school everyone had agreed was finished.',
      },
      {
        who: 'archivist',
        text: 'Most of them came to nothing, as you knew they would. But the bridges in the last two acts could not have been built without the columns they connect, and several of those columns were only standing because of a decision you took in a corridor in 1974 that nobody recorded.',
      },
      {
        who: 'second',
        text: 'A century has a lot of load-bearing decisions that look, at the time, like sentiment.',
      },
    ],
    choices: [
      {
        text: '"It was not sentiment. A field that can only do one thing cannot recover from being wrong."',
        effects: [
          { kind: 'resource', key: 'understanding', op: 'add', value: 14 },
          { kind: 'family', family: 'bridge', field: 'insight', op: 'add', value: 12 },
          { kind: 'flag', flag: 'pluralist', op: 'add', value: 2 },
        ],
      },
      {
        text: '"Some of it was sentiment. It worked anyway."',
        effects: [
          { kind: 'resource', key: 'credibility', op: 'add', value: 8 },
          { kind: 'character', id: 'archivist', field: 'affinity', op: 'add', value: 18 },
        ],
      },
    ],
  },

  {
    id: 'a7-the-narrow',
    act: 7,
    years: [2046, 2050],
    priority: 7,
    backdrop: 'corridor',
    when: all(
      not({ kind: 'flag', flag: 'keptFaith', op: '>=', value: 3 }),
      { kind: 'family', family: 'bridge', field: 'insight', op: '<', value: 35 },
    ),
    lines: [
      {
        who: 'archivist',
        text: 'A note on what is not here, since the summary will only show you what is.',
      },
      {
        who: 'archivist',
        text: 'Six of the eight schools ended this century as historical curiosities. Not refuted — unstaffed. The last person who could read the 1994 literature on several of them retired in the thirties and nobody was trained to replace her.',
      },
      {
        who: 'archivist',
        text: 'It is a perfectly defensible outcome. Concentration is how a field goes deep, and this one went very deep indeed. It is simply worth knowing that if the direction you chose turns out to have a ceiling, there is nothing left to fall back to.',
      },
      { who: 'second', text: 'And the ceiling, if there is one, will not announce itself.' },
    ],
    choices: [
      {
        text: 'Spend the last of it rebuilding what can still be rebuilt.',
        cost: 8,
        effects: [
          { kind: 'family', family: 'bridge', field: 'insight', op: 'add', value: 16 },
          { kind: 'family', family: 'statistical', field: 'talent', op: 'add', value: 0.03 },
          { kind: 'family', family: 'cybernetic', field: 'talent', op: 'add', value: 0.03 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 14 },
          { kind: 'flag', flag: 'lateRebuild', op: 'set', value: true },
        ],
      },
      {
        text: 'No. Depth was the right call and hedging now is just guilt.',
        effects: [
          { kind: 'resource', key: 'capability', op: 'add', value: 12 },
          { kind: 'resource', key: 'influence', op: 'add', value: 6 },
          { kind: 'flag', flag: 'focused', op: 'add', value: 1 },
        ],
      },
    ],
  },

  {
    id: 'a7-last-word',
    act: 7,
    years: [2050, 2050],
    pinned: true,
    priority: 11,
    backdrop: 'observatory',
    title: '2050',
    lines: [
      { system: true, text: 'FINAL INTERVAL. NO FURTHER PROJECTION.' },
      {
        who: 'archivist',
        text: 'That is the century. All of it, from a paper in a philosophy journal to whatever is sitting in the room with us now.',
      },
      {
        who: 'second',
        text: 'One last thing before it closes, and it is the only question in the whole exercise that was ever really yours.',
      },
      {
        who: 'second',
        text: 'When we publish this — and we are going to publish it, whatever it says — what do we lead with?',
      },
    ],
    choices: [
      {
        text: '"What we built."',
        hint: 'The capability. It is the honest headline of a capable century.',
        effects: [
          { kind: 'flag', flag: 'ledWith', op: 'set', value: 'capability' },
          { kind: 'resource', key: 'attention', op: 'add', value: 10 },
        ],
      },
      {
        text: '"What we do not understand about what we built."',
        hint: 'Nobody has ever led with this.',
        effects: [
          { kind: 'flag', flag: 'ledWith', op: 'set', value: 'uncertainty' },
          { kind: 'resource', key: 'understanding', op: 'add', value: 16 },
          { kind: 'resource', key: 'credibility', op: 'add', value: 10 },
          { kind: 'flag', flag: 'showedWorking', op: 'set', value: true },
        ],
      },
      {
        text: '"Every place where somebody said stop, and what happened next."',
        hint: 'The record of objections. Including the ones that were ignored.',
        effects: [
          { kind: 'flag', flag: 'ledWith', op: 'set', value: 'objections' },
          { kind: 'resource', key: 'understanding', op: 'add', value: 12 },
          { kind: 'resource', key: 'exposure', op: 'add', value: -14 },
          { kind: 'flag', flag: 'institutions', op: 'add', value: 1 },
          { kind: 'flag', flag: 'showedWorking', op: 'set', value: true },
        ],
      },
      {
        text: '"The names. All of them, including the ones who were wrong."',
        hint: 'Rosenblatt. Weizenbaum. Zadeh. Everyone who kept working through a winter.',
        effects: [
          { kind: 'flag', flag: 'ledWith', op: 'set', value: 'people' },
          { kind: 'resource', key: 'credibility', op: 'add', value: 8 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 8 },
          { kind: 'character', id: 'archivist', field: 'affinity', op: 'add', value: 30 },
        ],
      },
    ],
  },

  {
    id: 'a7-ambient-end',
    act: 7,
    priority: 1,
    once: false,
    backdrop: 'archive',
    lines: [
      {
        text: 'The record, complete, in whatever passes for shelving now. A hundred years of argument, most of it wrong, all of it necessary.',
        alts: [
          'The record, in whatever holds a record now. A century of positions taken confidently, abandoned quietly, and taken up again by people who did not know they were repeating anybody.',
          'Everything that was written down, and a reconstruction of a good deal that was not. It is heavier than it should be and lighter than it ought to be.',
        ],
      },
      {
        who: 'archivist',
        text: 'People will read this and look for the moment it was decided. There is no moment. There are a great many afternoons.',
        alts: [
          'Every reader wants the turning point. I have looked for it in a hundred branches and what I find instead is committee minutes, four of them, in different decades, none of which knew what it was doing.',
          'The story wants a year with a name on it. What the record holds is a long series of reasonable quarters, and the fact that reasonable quarters compound is the only lesson in here.',
          'Somebody will draw an arrow on a chart and point at where it steepens. The steepening is real. The arrow is a thing we add afterwards, to make a hundred years survivable as a story.',
        ],
      },
      {
        who: 'second',
        when: resource('exposure', '>', 45),
        text: 'And a section nobody will want quoted, about what it cost while it was happening, which is in here too because leaving it out would make the rest of it an advertisement.',
      },
      {
        who: 'archivist',
        when: all(resource('understanding', '>', 150), resource('exposure', '<', 25)),
        text: 'This particular record has something most branches do not: a chain of people who wrote down what they did not know, in the years when saying so was expensive. It is the only reason any of the rest can be trusted.',
      },
    ],
    choices: [
      {
        text: 'Say so in the preface.',
        effects: [
          { kind: 'resource', key: 'understanding', op: 'add', value: 6 },
          { kind: 'resource', key: 'credibility', op: 'add', value: 4 },
        ],
      },
      {
        text: 'Let them look. It is a useful thing to search for.',
        effects: [{ kind: 'resource', key: 'influence', op: 'add', value: 5 }],
      },
    ],
  },
];

import { all, any, flagIs, flagSet, not, resource } from '../../engine/conditions';
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
        who: 'archivist',
        when: flagIs('disposition', 'understand'),
        text: 'In 1950 you said you were here to find out what a mind actually is. I have read the century with that in mind. It is not, mostly, what the century was about — but the places where it was are the ones I would show a stranger first.',
      },
      {
        who: 'archivist',
        when: flagIs('disposition', 'build'),
        text: 'In 1950 you said you were here to get it built, whatever it turned out to be. It is built. I would note that “whatever it turned out to be” is the clause the next two intervals are going to be about.',
      },
      {
        who: 'archivist',
        when: flagIs('disposition', 'guard'),
        text: 'In 1950 you said you were here to make sure it did not go badly. I have kept a column for that since, and it is the longest in the record, because “badly” kept changing its meaning and you kept having to decide again.',
      },
      {
        who: 'archivist',
        when: flagIs('disposition', 'open'),
        text: 'In 1950 you said you did not know yet why you were here. I have waited ninety-six years to ask whether you do now. I am not going to. It is in the record, in what you did, and that is the only form of the answer I trust.',
      },
      {
        who: 'second',
        when: flagSet('auditDoubt'),
        text: 'You said, in the thirties, that anything we concluded was worthless. I have thought about it for twelve years. I think you were right about the conclusion and wrong about the record, and we are publishing the record.',
      },
      {
        who: 'archivist',
        when: flagSet('externalAudit'),
        text: 'It was handed over, as you asked. There is a body outside us that has had the reconstruction since the thirties. It has found four errors, I have corrected them, and they are marked. That is the only reason I will use the word verdict this week.',
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
        who: 'nkemelu',
        when: flagSet('verifiedStandard'),
        text: 'And a standard: nothing consequential runs without the proof covering the composite. It lost every benchmark it entered. It is the reason there is an insurance market.',
      },
      {
        who: 'nkemelu',
        when: flagSet('assuranceBacked'),
        text: 'Which was paid for. The people who look for the failure were funded through this century — by statute, or by habit — and the register is theirs.',
      },
      {
        who: 'nkemelu',
        when: flagSet('screened'),
        text: 'And a door. The dangerous half of the synthesis is behind it, there is a list of who has been through, and the list is short.',
      },
      {
        who: 'nkemelu',
        when: flagSet('succession'),
        text: 'And terms of succession, drafted while there was still a party on each side to draft them.',
      },
      {
        who: 'nkemelu',
        when: flagSet('continuousAssurance'),
        text: 'And — I will say this once — an audit that runs. You gave me training parity in the thirties. I have been checking what is running rather than what was, for over a decade, and it is the only line on this list I would defend in front of a hostile committee.',
      },
      {
        who: 'nkemelu',
        when: all(flagSet('provedFirst'), { kind: 'seen', scene: 'a6-synthesis-window' }),
        text: 'The composition rules were proved on something small first, because you refused to build the whole thing until they were. That is why I can sign for a system built of parts.',
      },
      {
        who: 'nkemelu',
        when: flagSet('sandboxed'),
        text: 'The open-ended process is still running, inside the sandbox you specified, and nothing has left it without a proof. Forty things have. It is the only unsteerable system in the century with a paper trail.',
      },
      {
        who: 'nkemelu',
        when: flagSet('evaluationScience'),
        text: 'And a science of measurement — funded when the curve was still the only chart anyone wanted — which is the reason the incident register means anything. You cannot register what you cannot name.',
      },
      {
        who: 'nkemelu',
        when: flagSet('interruptible'),
        text: 'And every system consequential enough to matter can be stopped by somebody who is not it, by statute. It is the one property I would keep if I could keep only one.',
      },
      {
        who: 'nkemelu',
        when: flagSet('treaty'),
        text: 'And a treaty, signed while anyone would still sign it, which is the only kind that gets signed.',
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
      {
        who: 'archivist',
        when: flagSet('voluntaryOnly'),
        text: 'The commitments were voluntary. You said the labs were serious people, and they were. Three of the five lapsed in the first reorganisation, without malice, because voluntary is the word for a thing nobody has to budget for.',
      },
      {
        who: 'archivist',
        when: flagSet('nationalised'),
        text: 'The frontier is nationalised, which was meant to be the body with the authority to refuse. It turns out a state that owns the thing refuses it nothing.',
      },
      {
        who: 'archivist',
        when: flagSet('autonomy'),
        text: 'And the people are out of the loop — that was a decision, in the thirties, an efficiency measure — so there is no longer anybody positioned to notice.',
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
      {
        who: 'second',
        when: { kind: 'flag', flag: 'openness', op: '>=', value: 1 },
        text: 'It will be read. Everything else was published, so there is a public that knows how to read it.',
      },
      {
        who: 'second',
        when: { kind: 'flag', flag: 'openness', op: '<=', value: -1 },
        text: 'Fewer people will read it than should. The results were held back for thirty years, and the habit outlived the reason for it.',
      },
      {
        who: 'archivist',
        when: flagSet('certifiedAnyway'),
        text: 'You certified it, four years ago, over the other column. That is in here too, with the reasoning, which was not nothing.',
      },
      {
        who: 'archivist',
        when: flagSet('lateRebuild'),
        text: 'The rebuilding is in here: four years, two schools re-staffed from the literature, no results yet. I have marked it as an expense. Whoever reads this in a decade can decide what it was.',
      },
      {
        who: 'archivist',
        when: all(flagSet('focused'), { kind: 'seen', scene: 'a7-the-narrow' }),
        text: 'You picked a winner in the sixties and declined to hedge in 2046. That consistency is in the record, and I do not know whether it reads as conviction or as never having checked.',
      },
      {
        who: 'archivist',
        when: { kind: 'flag', flag: 'pluralist', op: '>=', value: 2 },
        text: 'You said in the sixties that you would keep the losing schools alive, and in 2046 that it was not sentiment. Both are in here, eighty-four years apart, and the second one reads as earned.',
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
        who: 'archivist',
        when: flagSet('showedWorking'),
        text: 'The working is shown — every reconstruction, beside the verdict, as you asked. A stranger can walk through it and disagree, which is the only kind of record that is evidence rather than testimony.',
      },
      {
        who: 'archivist',
        when: flagSet('abundance'),
        text: 'And a column most branches do not have: what it cured. You pointed the whole thing at the diseases, and that column is long, and it is the one people will read first.',
      },
      {
        who: 'second',
        when: flagIs('ledWith', 'capability'),
        text: 'It leads with what was built. The rest is in there; it is simply not on the first page, and the first page is what gets quoted.',
      },
      {
        who: 'second',
        when: flagIs('ledWith', 'uncertainty'),
        text: 'It leads with what nobody understood. That will be read as weakness by some and as the only honest opening by the rest, and I know which of those readers I would rather have.',
      },
      {
        who: 'second',
        when: flagIs('ledWith', 'objections'),
        text: 'It leads with every place somebody said stop. It is the longest opening chapter in the record and it is the one I would have chosen.',
      },
      {
        who: 'second',
        when: flagIs('ledWith', 'people'),
        text: 'It leads with the names. All of them, including the ones who were wrong, which is most of them and, at some point, all of us.',
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

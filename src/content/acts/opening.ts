import type { Scene } from '../../engine/types';

/**
 * The opening establishes the conceit, the interface, and one disposition choice that colours
 * the entire run. Act 0 scenes are never scheduled — they are played explicitly by main.ts.
 */
export const OPENING: Scene[] = [
  {
    id: 'open-1',
    act: 0,
    backdrop: 'void',
    next: 'open-2',
    lines: [
      { system: true, text: 'INITIALISING. 1950. TWENTY-SIX INTERVALS TO TERMINUS.' },
      {
        text: 'There is a question that has been asked in one form or another since somebody first noticed that a loom could be instructed.',
      },
      { text: 'What kind of thing is a mind?' },
      {
        text: 'In 1950 it stops being a question for philosophers exclusively, because for the first time there are machines that can be pointed at it, and money that can be pointed at the machines.',
      },
      { system: true, text: 'THE CORRESPONDENT IS PRESENT. CHANNEL OPEN.' },
    ],
  },
  {
    id: 'open-2',
    act: 0,
    backdrop: 'lab-valve',
    next: 'open-3',
    lines: [
      {
        who: 'archivist',
        text: 'Good. You are here. I am told you have been given a considerable amount of quiet influence over what happens next, and no title whatsoever.',
      },
      {
        who: 'archivist',
        text: 'It works like this. Every four years I will show you where the field stands and who is arguing with whom. You will decide what gets funded, who gets defended, and what the field says about itself in public.',
      },
      {
        who: 'archivist',
        text: 'You will not decide what is true. Nobody gets to decide that. An idea arrives when its prerequisites are proved and there is a machine capable of demonstrating it, and not one year sooner, however much money you throw at it.',
      },
      {
        who: 'archivist',
        text: 'A hundred years. I will be keeping the record.',
      },
    ],
  },
  {
    id: 'open-3',
    act: 0,
    backdrop: 'lab-valve',
    lines: [
      {
        who: 'archivist',
        text: 'Before we begin. Everyone who does this job has a reason, and the reason shows up in the record whether or not they meant it to.',
      },
      { who: 'archivist', text: 'What are you here for?' },
    ],
    choices: [
      {
        text: 'To find out what a mind actually is.',
        hint: 'Theory first. The applications can wait.',
        goto: 'open-3-understand',
        effects: [
          { kind: 'flag', flag: 'disposition', op: 'set', value: 'understand' },
          { kind: 'resource', key: 'understanding', op: 'add', value: 10 },
          { kind: 'patron', patron: 'academic', op: 'add', value: 10 },
          { kind: 'log', text: 'The Correspondent is here for the theory.', logKind: 'system' },
        ],
      },
      {
        text: 'To get it built, whatever it turns out to be.',
        hint: 'Results now. Explanations later, if at all.',
        goto: 'open-3-build',
        effects: [
          { kind: 'flag', flag: 'disposition', op: 'set', value: 'build' },
          { kind: 'resource', key: 'influence', op: 'add', value: 8 },
          { kind: 'patron', patron: 'military', op: 'add', value: 10 },
        ],
      },
      {
        text: 'To make sure it does not go badly.',
        hint: 'Somebody should be watching. It may as well be you.',
        goto: 'open-3-guard',
        effects: [
          { kind: 'flag', flag: 'disposition', op: 'set', value: 'guard' },
          { kind: 'resource', key: 'credibility', op: 'add', value: 8 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 5 },
          { kind: 'flag', flag: 'assuranceBacked', op: 'add', value: 1 },
        ],
      },
      {
        text: 'I do not know yet.',
        hint: 'Honest. Also, apparently, unusual.',
        goto: 'open-3-open',
        effects: [
          { kind: 'flag', flag: 'disposition', op: 'set', value: 'open' },
          { kind: 'resource', key: 'influence', op: 'add', value: 4 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 4 },
          { kind: 'character', id: 'archivist', field: 'affinity', op: 'add', value: 12 },
        ],
      },
    ],
  },

  /*
   * The four replies to "What are you here for?".
   *
   * She does not approve or correct — she files. What each one says is that the answer has been
   * heard and written down somewhere it will be read back, which is the promise the whole frame
   * rests on. The disposition flag is set by the choice; these only give it a voice.
   */
  {
    id: 'open-3-understand',
    act: 0,
    linkOnly: true,
    backdrop: 'lab-valve',
    lines: [
      {
        who: 'archivist',
        text: 'Theory. Good — that is the rarer answer, and the one that ages best in here. The builders get the decade named after them and the theorists get the footnote that explains why it worked.',
      },
      {
        who: 'archivist',
        text: 'I will hold you to it. When something works and nobody can say why, I am going to ask you whether that still counts.',
      },
    ],
  },
  {
    id: 'open-3-build',
    act: 0,
    linkOnly: true,
    backdrop: 'lab-valve',
    lines: [
      {
        who: 'archivist',
        text: 'Built. That is the answer most of them give, and it is the one that moves the century fastest, so I will not pretend it is the wrong one.',
      },
      {
        who: 'archivist',
        text: 'It does have a failure mode, and it is not the one people expect. It is not that you build the wrong thing. It is that you build the right thing and cannot tell anyone why it works, and then it stops working and nobody knows where to look.',
      },
    ],
  },
  {
    id: 'open-3-guard',
    act: 0,
    linkOnly: true,
    backdrop: 'lab-valve',
    lines: [
      {
        who: 'archivist',
        text: 'A watchman. Then I should tell you now that the job is thankless in a specific way: when you do it well, nothing happens, and nothing is very hard to take credit for.',
      },
      {
        who: 'archivist',
        text: 'Every winter in this record was preceded by somebody saying roughly what you have just said, and being ignored, and being right. Filed.',
      },
    ],
  },
  {
    id: 'open-3-open',
    act: 0,
    linkOnly: true,
    backdrop: 'lab-valve',
    lines: [
      {
        who: 'archivist',
        text: 'You do not know. Thank you — genuinely. Everyone else arrives with a programme, and a programme is a very efficient way to stop noticing things.',
      },
      {
        who: 'archivist',
        text: 'I will put "undecided" in the field and we will see what the century writes over it. That entry has never once survived to 2050 unchanged.',
      },
    ],
  },
];

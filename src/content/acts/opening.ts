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
        effects: [
          { kind: 'flag', flag: 'disposition', op: 'set', value: 'build' },
          { kind: 'resource', key: 'influence', op: 'add', value: 8 },
          { kind: 'patron', patron: 'military', op: 'add', value: 10 },
        ],
      },
      {
        text: 'To make sure it does not go badly.',
        hint: 'Somebody should be watching. It may as well be you.',
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
        effects: [
          { kind: 'flag', flag: 'disposition', op: 'set', value: 'open' },
          { kind: 'resource', key: 'influence', op: 'add', value: 4 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 4 },
          { kind: 'character', id: 'archivist', field: 'affinity', op: 'add', value: 12 },
        ],
      },
    ],
  },
];

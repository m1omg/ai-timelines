import { all, mature, not, notMature, resource } from '../../engine/conditions';
import type { Scene } from '../../engine/types';

/**
 * ACT I — 1950-1962. The Summer of Definitions.
 *
 * Every school in the game is founded in this act, mostly by people who did not know they were
 * founding schools. The act's job is to make the player feel the breadth of what was genuinely
 * live in 1950 before the field narrowed.
 */
export const ACT1: Scene[] = [
  {
    id: 'a1-turing',
    act: 1,
    years: [1950, 1950],
    pinned: true,
    priority: 9,
    backdrop: 'lab-valve',
    title: 'The Imitation Game',
    lines: [
      {
        text: 'A paper appears in a philosophy journal, written by a mathematician who has spent the preceding decade doing things he is still not permitted to describe.',
      },
      {
        who: 'turing',
        text: 'The question "can machines think" is too meaningless to deserve discussion. I propose replacing it with something we can actually run.',
      },
      {
        who: 'turing',
        text: 'Put the machine and a person behind a teleprinter and let an interrogator ask whatever they like. If the interrogator cannot reliably tell which is which, we have no principled ground left to stand on.',
      },
      {
        who: 'turing',
        text: 'And I would not attempt to program an adult mind. I would attempt to produce a child\'s, and then educate it. Presumably the brain of an infant is rather like a notebook one buys from the stationer — very little mechanism, and a great deal of blank sheet.',
      },
      {
        who: 'archivist',
        text: 'Nobody acts on the second half of that for forty years. They spend forty years arguing about the first half instead.',
      },
    ],
    choices: [
      {
        text: 'The test is the right idea. Make it the field\'s standard.',
        hint: 'A clear public criterion. Also a hostage to fortune.',
        effects: [
          { kind: 'resource', key: 'attention', op: 'add', value: 10 },
          { kind: 'resource', key: 'credibility', op: 'add', value: 4 },
          { kind: 'flag', flag: 'turingTest', op: 'set', value: true },
        ],
      },
      {
        text: 'The child machine is the right idea. Fund anything that learns.',
        hint: 'Unfashionable. Correct rather early.',
        effects: [
          { kind: 'family', family: 'connectionist', field: 'momentum', op: 'add', value: 10 },
          { kind: 'family', family: 'cybernetic', field: 'momentum', op: 'add', value: 8 },
          { kind: 'flag', flag: 'childMachine', op: 'set', value: true },
          { kind: 'resource', key: 'understanding', op: 'add', value: 5 },
        ],
      },
      {
        text: 'Say nothing. Let the paper find its own readers.',
        hint: 'It will. It takes longer.',
        effects: [{ kind: 'resource', key: 'influence', op: 'add', value: 3 }],
      },
    ],
  },

  {
    id: 'a1-wiener',
    act: 1,
    years: [1950, 1954],
    priority: 6,
    backdrop: 'lecture-hall',
    lines: [
      {
        who: 'wiener',
        text: 'I want to be clear about what cybernetics is and is not. It is not a theory of computers. It is a theory of control and communication, and it applies identically to a servo, a thermostat and a man picking up a pencil.',
      },
      {
        who: 'wiener',
        text: 'Purpose does not require a purposer. It requires feedback. Show me a system that measures the gap between where it is and where it should be, and acts to close it, and I will show you something that behaves as if it wanted.',
      },
      {
        who: 'wiener',
        text: 'And I will tell you the other thing, since nobody else in this room will. The automatic factory is coming. It will devalue the human arm exactly as the steam engine devalued the human back, and if we do not think about that now we will think about it during a catastrophe.',
      },
      {
        who: 'archivist',
        text: 'He is the first person in this story to say that out loud. He is by some distance not the last, and the interval between the first and second time is longer than you would hope.',
      },
    ],
    choices: [
      {
        text: 'Cybernetics is the foundation. Build the field on it.',
        effects: [
          { kind: 'family', family: 'cybernetic', field: 'momentum', op: 'add', value: 14 },
          { kind: 'family', family: 'cybernetic', field: 'insight', op: 'add', value: 6 },
          { kind: 'character', id: 'wiener', field: 'affinity', op: 'add', value: 20 },
        ],
      },
      {
        text: 'Take the warning seriously. Put it in front of people who legislate.',
        hint: 'Nothing advances. Something is on the record eighty years early.',
        effects: [
          { kind: 'resource', key: 'exposure', op: 'add', value: -6 },
          { kind: 'patron', patron: 'public', op: 'add', value: 8 },
          { kind: 'flag', flag: 'earlyWarning', op: 'set', value: true },
          { kind: 'character', id: 'wiener', field: 'affinity', op: 'add', value: 25 },
        ],
      },
      {
        text: 'It is too diffuse. The field needs something it can compute with.',
        effects: [
          { kind: 'family', family: 'symbolic', field: 'momentum', op: 'add', value: 8 },
          { kind: 'character', id: 'wiener', field: 'affinity', op: 'add', value: -15 },
        ],
      },
    ],
  },

  {
    id: 'a1-ashby',
    act: 1,
    years: [1950, 1958],
    priority: 4,
    backdrop: 'workshop',
    when: notMature('homeostasis'),
    lines: [
      {
        text: 'A psychiatrist in Gloucester has built a machine out of four surplus bomb-control units, and is inviting people to break it.',
      },
      {
        who: 'ashby',
        text: 'Disturb it however you like. Reverse a connection, cut one, change the sign. It will thrash about, and then it will find a new configuration in which it is stable, and it will settle.',
      },
      {
        who: 'ashby',
        text: 'It has no model of itself. It has no goal written down anywhere. It has only the requirement that certain variables stay within limits, and the freedom to re-wire until they do. I would like someone to tell me what is missing before we call that adaptation.',
      },
      {
        who: 'ashby',
        text: 'And here is the part I cannot get anyone to take seriously: a regulator must have at least as much variety as the thing it regulates. Not more cleverness. More variety. It is a conservation law and the field is going to spend fifty years discovering it the expensive way.',
      },
    ],
    choices: [
      {
        text: 'Fund it. Adaptation without representation is worth a decade.',
        effects: [
          { kind: 'paradigm', id: 'homeostasis', op: 'progress', value: 22 },
          { kind: 'family', family: 'cybernetic', field: 'insight', op: 'add', value: 8 },
          { kind: 'character', id: 'ashby', field: 'affinity', op: 'add', value: 22 },
        ],
      },
      {
        text: 'It is a curiosity. Interesting; not a research programme.',
        effects: [
          { kind: 'family', family: 'cybernetic', field: 'momentum', op: 'add', value: -6 },
          { kind: 'resource', key: 'influence', op: 'add', value: 4 },
        ],
      },
    ],
  },

  {
    id: 'a1-turing-gone',
    act: 1,
    years: [1954, 1958],
    priority: 7,
    backdrop: 'corridor',
    when: { kind: 'characterMet', id: 'turing' },
    onEnter: [{ kind: 'characterActive', id: 'turing', value: false }],
    lines: [
      {
        who: 'archivist',
        text: 'In 1954 the man who wrote the paper dies, at forty-one. The circumstances are a matter of public record and are not to that country\'s credit, and I will leave it there.',
      },
      {
        who: 'archivist',
        text: 'What I will say is what it costs the field. He was the only person then living who had thought seriously about both halves of the problem — the formal one and the developmental one — and he was not replaced.',
      },
      {
        text: 'The work continues. It continues along the formal half, almost exclusively, for about thirty years.',
      },
      { system: true, text: 'ONE LINEAGE CLOSED. NO SUCCESSOR IDENTIFIED.' },
    ],
  },

  {
    id: 'a1-dartmouth',
    act: 1,
    years: [1954, 1958],
    pinned: true,
    priority: 10,
    backdrop: 'lecture-hall',
    title: 'A Two-Month, Ten-Man Study',
    lines: [
      {
        text: 'A funding proposal is circulated for a summer workshop at a small college in New Hampshire. It contains the sentence that names everything after it.',
      },
      {
        who: 'mccarthy',
        text: 'The study is to proceed on the basis of the conjecture that every aspect of learning, or any other feature of intelligence, can in principle be so precisely described that a machine can be made to simulate it.',
      },
      {
        who: 'mccarthy',
        text: 'We need a term. "Automata studies" attracts the control theorists. "Cybernetics" belongs to Wiener and comes with Wiener. I am proposing artificial intelligence, chiefly because nobody owns it.',
      },
      {
        who: 'minsky',
        text: 'We think a significant advance can be made if a carefully selected group of scientists work on it together for a summer.',
      },
      {
        who: 'shannon',
        text: 'A summer.',
      },
      {
        who: 'solomonoff',
        text: 'I would like to raise something before we start. If a machine is going to induce a general rule from examples, we need a principled way to prefer one rule over another. Otherwise every finite set of observations is compatible with infinitely many futures and the machine has no grounds to pick.',
      },
      {
        who: 'mccarthy',
        text: 'Noted. Let us get something working first.',
      },
      {
        who: 'archivist',
        text: 'That exchange, in one form or another, is the next hundred years.',
      },
    ],
    choices: [
      {
        text: 'Back the workshop. This is where the field gets its name.',
        hint: 'A discipline with a name can be funded.',
        effects: [
          { kind: 'family', family: 'symbolic', field: 'momentum', op: 'add', value: 16 },
          { kind: 'family', family: 'symbolic', field: 'insight', op: 'add', value: 6 },
          { kind: 'resource', key: 'attention', op: 'add', value: 14 },
          { kind: 'patron', patron: 'military', op: 'add', value: 10 },
          { kind: 'flag', flag: 'dartmouth', op: 'set', value: true },
        ],
      },
      {
        text: 'Back the workshop, and insist Solomonoff\'s question stays on the agenda.',
        hint: 'Slower. The induction problem gets forty years of head start.',
        effects: [
          { kind: 'family', family: 'symbolic', field: 'momentum', op: 'add', value: 10 },
          { kind: 'family', family: 'statistical', field: 'insight', op: 'add', value: 12 },
          { kind: 'family', family: 'statistical', field: 'momentum', op: 'add', value: 10 },
          { kind: 'character', id: 'solomonoff', field: 'affinity', op: 'add', value: 30 },
          { kind: 'resource', key: 'attention', op: 'add', value: 8 },
          { kind: 'flag', flag: 'dartmouth', op: 'set', value: true },
          { kind: 'flag', flag: 'inductionOnAgenda', op: 'set', value: true },
        ],
      },
      {
        text: 'Refuse the name. Keep it inside cybernetics where the feedback people are.',
        hint: 'No new discipline. No new money either.',
        effects: [
          { kind: 'family', family: 'cybernetic', field: 'momentum', op: 'add', value: 16 },
          { kind: 'family', family: 'symbolic', field: 'momentum', op: 'add', value: -8 },
          { kind: 'resource', key: 'attention', op: 'add', value: -4 },
          { kind: 'flag', flag: 'noName', op: 'set', value: true },
        ],
      },
    ],
  },

  {
    id: 'a1-logic-theorist',
    act: 1,
    years: [1954, 1962],
    priority: 6,
    backdrop: 'machine-room',
    when: notMature('logic-theorist'),
    lines: [
      {
        who: 'newell',
        text: 'It proved thirty-eight of the first fifty-two theorems in chapter two of Principia. One of the proofs is shorter than the one in the book.',
      },
      {
        who: 'simon',
        text: 'We sent it to the Journal of Symbolic Logic with the machine listed as a co-author. They declined to publish, on the grounds that the result was already known.',
      },
      {
        who: 'newell',
        text: 'The point is not the theorems. The point is that it did not search exhaustively — it could not, the space is astronomical — it searched selectively, using rules about which subgoals look promising. That selectivity is the whole phenomenon.',
      },
      {
        who: 'simon',
        text: 'We have, I think, solved the venerable mind-body problem, and explained how a system composed of matter can have the properties of mind. Over Christmas.',
      },
      {
        who: 'archivist',
        text: 'He genuinely believed that, and he was not a foolish man, and it is worth sitting with how it feels to be that confident and that early.',
      },
    ],
    choices: [
      {
        text: 'Heuristic search is the mechanism. Everything else is detail.',
        effects: [
          { kind: 'paradigm', id: 'logic-theorist', op: 'progress', value: 20 },
          { kind: 'family', family: 'symbolic', field: 'insight', op: 'add', value: 8 },
          { kind: 'resource', key: 'attention', op: 'add', value: 8 },
        ],
      },
      {
        text: 'Ask them what happens when the rules of thumb are wrong.',
        hint: 'Nobody thanks you for this question for about seventeen years.',
        effects: [
          { kind: 'resource', key: 'understanding', op: 'add', value: 7 },
          { kind: 'resource', key: 'attention', op: 'add', value: -4 },
          { kind: 'character', id: 'simon', field: 'affinity', op: 'add', value: -10 },
          { kind: 'flag', flag: 'askedHard', op: 'add', value: 1 },
        ],
      },
    ],
  },

  {
    id: 'a1-perceptron',
    act: 1,
    years: [1958, 1962],
    pinned: true,
    priority: 10,
    backdrop: 'workshop',
    title: 'The Mark I',
    lines: [
      {
        text: 'Cornell, and a cabinet the size of a wardrobe: a twenty-by-twenty grid of photocells at the front, and behind it a wall of motor-driven potentiometers that are the weights.',
      },
      {
        who: 'rosenblatt',
        text: 'It is not programmed. That is the thing I need you to understand before anything else. Nobody told it what a triangle is. It was shown triangles, and it was told when it was wrong, and it adjusted.',
      },
      {
        who: 'rosenblatt',
        text: 'And I can prove that the adjustment terminates. If a set of weights exists that separates the classes, this procedure finds one, in finite time, from any starting point. That is a theorem, not a hope.',
      },
      {
        text: 'The press is in the room. Somebody asks what it will be able to do.',
      },
      {
        who: 'archivist',
        text: 'This is the moment. What happens in the next ninety seconds sets the field\'s credit terms for twenty years.',
      },
    ],
    choices: [
      {
        text: 'Let him answer freely. The excitement is worth the exposure.',
        hint: 'Enormous funding. An enormous promise attached to it.',
        effects: [
          { kind: 'resource', key: 'attention', op: 'add', value: 28 },
          { kind: 'patron', patron: 'military', op: 'add', value: 16 },
          { kind: 'patron', patron: 'public', op: 'add', value: 12 },
          { kind: 'family', family: 'connectionist', field: 'momentum', op: 'add', value: 18 },
          { kind: 'paradigm', id: 'perceptron', op: 'progress', value: 18 },
          { kind: 'flag', flag: 'perceptronHype', op: 'set', value: true },
          { kind: 'log', text: 'The newspapers are told a machine will soon walk, talk, see and reproduce itself.', logKind: 'event' },
        ],
      },
      {
        text: 'Stand him down. State the theorem and nothing beyond it.',
        hint: 'The connectionists get less money and keep their reputation.',
        effects: [
          { kind: 'resource', key: 'attention', op: 'add', value: 6 },
          { kind: 'resource', key: 'credibility', op: 'add', value: 10 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 6 },
          { kind: 'family', family: 'connectionist', field: 'momentum', op: 'add', value: 8 },
          { kind: 'paradigm', id: 'perceptron', op: 'progress', value: 12 },
          { kind: 'character', id: 'rosenblatt', field: 'affinity', op: 'add', value: 15 },
          { kind: 'flag', flag: 'perceptronRestraint', op: 'set', value: true },
        ],
      },
      {
        text: 'Point the press at the hardware instead of the promise.',
        hint: 'Analog machines that learn. A different bet entirely.',
        effects: [
          { kind: 'resource', key: 'attention', op: 'add', value: 12 },
          { kind: 'family', family: 'substrate', field: 'momentum', op: 'add', value: 14 },
          { kind: 'family', family: 'substrate', field: 'insight', op: 'add', value: 8 },
          { kind: 'paradigm', id: 'neural-hardware', op: 'progress', value: 16 },
          { kind: 'patron', patron: 'corporate', op: 'add', value: 8 },
        ],
      },
    ],
  },

  {
    id: 'a1-lisp',
    act: 1,
    years: [1958, 1966],
    priority: 5,
    backdrop: 'terminal-room',
    when: all(mature('logic-theorist'), notMature('lisp')),
    lines: [
      {
        who: 'mccarthy',
        text: 'I wanted a notation for expressing programs that reason about programs. The awkward part was that the notation had to be a data structure, so that a program could take another program apart.',
      },
      {
        who: 'mccarthy',
        text: 'So the program *is* a list. The interpreter is thirty lines. My student implemented it as an actual running system while I was still describing it as a theoretical convenience.',
      },
      {
        who: 'mccarthy',
        text: 'What I actually care about is the next paper. A program with common sense — one that deduces for itself the consequences of what it is told, rather than being told each consequence separately. Without that, everything we build has to be told everything.',
      },
      { who: 'archivist', text: 'That paper is 1959. The problem it describes is not closed by 2050 in most of the branches I hold.' },
    ],
    choices: [
      {
        text: 'Fund the tools. A field with a good language moves faster.',
        effects: [
          { kind: 'paradigm', id: 'lisp', op: 'progress', value: 26 },
          { kind: 'family', family: 'symbolic', field: 'insight', op: 'add', value: 10 },
          { kind: 'resource', key: 'influence', op: 'add', value: 3 },
        ],
      },
      {
        text: 'Fund the common-sense programme. The hard problem, early.',
        effects: [
          { kind: 'paradigm', id: 'lisp', op: 'progress', value: 12 },
          { kind: 'family', family: 'symbolic', field: 'insight', op: 'add', value: 14 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 8 },
          { kind: 'character', id: 'mccarthy', field: 'affinity', op: 'add', value: 20 },
          { kind: 'flag', flag: 'commonSense', op: 'set', value: true },
        ],
      },
    ],
  },

  {
    id: 'a1-samuel',
    act: 1,
    years: [1958, 1966],
    priority: 6,
    backdrop: 'machine-room',
    when: notMature('self-play-learning'),
    lines: [
      {
        text: 'An engineer at a business-machine company has been running checkers on the night shift for six years.',
      },
      {
        who: 'samuel',
        text: 'The evaluation function has sixteen terms and I did not choose the weights. It played itself several thousand times and adjusted them according to whether the position it predicted was better than the position it got.',
      },
      {
        who: 'samuel',
        text: 'It beats me now. I am not a strong player, so do not make too much of that. But I did not teach it anything I know, because I do not know anything it uses.',
      },
      {
        who: 'samuel',
        text: 'I have been calling it machine learning, for want of a better phrase. The company would prefer I called it something with a shorter time horizon.',
      },
      {
        who: 'archivist',
        text: 'Note what is in that program. A learned value function. Bootstrapping a prediction from a later prediction. Self-play as a curriculum. It is 1959 and all three are sitting there in a few thousand words of memory, and it takes the field thirty years to come back for them.',
      },
    ],
    choices: [
      {
        text: 'This is the important result of the decade. Say so, loudly.',
        effects: [
          { kind: 'paradigm', id: 'self-play-learning', op: 'progress', value: 24 },
          { kind: 'family', family: 'cybernetic', field: 'insight', op: 'add', value: 12 },
          { kind: 'family', family: 'cybernetic', field: 'momentum', op: 'add', value: 12 },
          { kind: 'character', id: 'samuel', field: 'affinity', op: 'add', value: 25 },
          { kind: 'resource', key: 'attention', op: 'add', value: 8 },
        ],
      },
      {
        text: 'It is a game program. The field has more urgent business.',
        effects: [
          { kind: 'family', family: 'cybernetic', field: 'momentum', op: 'add', value: -8 },
          { kind: 'resource', key: 'influence', op: 'add', value: 4 },
          { kind: 'character', id: 'samuel', field: 'affinity', op: 'add', value: -12 },
        ],
      },
    ],
  },

  {
    id: 'a1-selfridge',
    act: 1,
    years: [1958, 1966],
    priority: 4,
    backdrop: 'lecture-hall',
    lines: [
      {
        who: 'selfridge',
        text: 'Picture a set of demons. Each one watches for a single feature and shrieks when it sees it, and the loudness of the shriek is its confidence.',
      },
      {
        who: 'selfridge',
        text: 'Above them, decision demons listen, each for a particular pattern of shrieking. Above those, one demon picks the loudest. No sequence. No supervisor. Everything at once, and the weights adjust based on who was useful.',
      },
      {
        who: 'selfridge',
        text: 'I call it Pandemonium. I am aware of how it sounds. It also works, which the sequential proposals in this room currently do not.',
      },
    ],
    choices: [
      {
        text: 'Parallel feature detection deserves its own programme.',
        effects: [
          { kind: 'family', family: 'connectionist', field: 'insight', op: 'add', value: 10 },
          { kind: 'family', family: 'connectionist', field: 'momentum', op: 'add', value: 8 },
          { kind: 'character', id: 'selfridge', field: 'affinity', op: 'add', value: 20 },
        ],
      },
      {
        text: 'Interesting metaphor, no theory. Ask for the mathematics first.',
        effects: [
          { kind: 'resource', key: 'understanding', op: 'add', value: 5 },
          { kind: 'family', family: 'statistical', field: 'momentum', op: 'add', value: 6 },
        ],
      },
    ],
  },

  {
    id: 'a1-widrow',
    act: 1,
    years: [1962, 1970],
    priority: 5,
    backdrop: 'workshop',
    when: notMature('adaline'),
    lines: [
      {
        who: 'widrow',
        text: 'The weight is a cell of electroplated graphite. You pass current one way to plate metal on, the other way to take it off, and the resistance is the weight. It is genuinely a piece of chemistry doing arithmetic.',
      },
      {
        who: 'widrow',
        text: 'The rule is simpler than Rosenblatt\'s and it has a cleaner justification: it descends the squared error. One sample at a time, no batch, no waiting.',
      },
      {
        who: 'widrow',
        text: 'And I will tell you where the money actually is, which is not in perception. It is in filtering. A long-distance telephone line has an echo, the echo changes, and this thing will track it and cancel it continuously.',
      },
      {
        who: 'archivist',
        text: 'He is right and the field ignores it, because adaptive filtering is not intelligence, it is signal processing. Thirty years of connectionism\'s only reliable industrial revenue is filed under a different heading entirely.',
      },
    ],
    choices: [
      {
        text: 'Push it into industry. Revenue survives fashion.',
        hint: 'A paradigm with a paying customer is very hard to kill.',
        effects: [
          { kind: 'paradigm', id: 'adaline', op: 'progress', value: 22 },
          { kind: 'patron', patron: 'corporate', op: 'add', value: 14 },
          { kind: 'resource', key: 'deployment', op: 'add', value: 7 },
          { kind: 'resource', key: 'credibility', op: 'add', value: 5 },
          { kind: 'flag', flag: 'connectionistRevenue', op: 'set', value: true },
        ],
      },
      {
        text: 'Keep it in the laboratory. Perception is the prize.',
        effects: [
          { kind: 'paradigm', id: 'perceptron', op: 'progress', value: 14 },
          { kind: 'family', family: 'connectionist', field: 'momentum', op: 'add', value: 6 },
        ],
      },
    ],
  },

  {
    id: 'a1-schism',
    act: 1,
    years: [1962, 1966],
    priority: 8,
    backdrop: 'committee',
    when: all({ kind: 'characterMet', id: 'rosenblatt' }, { kind: 'characterMet', id: 'minsky' }),
    title: 'Two Men Who Went to the Same School',
    lines: [
      {
        text: 'They were at the Bronx High School of Science a year apart. That fact will be reported for decades as though it explains something.',
      },
      {
        who: 'minsky',
        text: 'I built one of these. In 1951, out of valves and a surplus autopilot. I am not hostile to the idea; I am hostile to the claim that the idea is sufficient. There are functions a single layer of these cannot compute, and the set is not small, and nobody in your camp has told the funders that.',
      },
      {
        who: 'rosenblatt',
        text: 'Nobody in my camp has claimed a single layer suffices. I have written a book on multi-layer and back-coupled systems. What I do not have is a learning procedure for them, and neither do you, and the difference between us is that I am looking for one.',
      },
      {
        who: 'minsky',
        text: 'Then say that in public, in those words, instead of letting the newspapers print that the machine is conscious of its existence.',
      },
      {
        who: 'rosenblatt',
        text: 'And you might consider that a formal proof about the weakest version of a thing is not a proof about the thing.',
      },
      {
        who: 'archivist',
        text: 'Both of them are right. That is the difficulty. The argument is not settled by evidence, it is settled by who is still funded in 1972.',
      },
    ],
    choices: [
      {
        text: 'Back the connectionists. Find the multi-layer learning rule.',
        hint: 'It exists. It is roughly twelve years away and needs a machine nobody has yet.',
        effects: [
          { kind: 'family', family: 'connectionist', field: 'momentum', op: 'add', value: 16 },
          { kind: 'family', family: 'connectionist', field: 'insight', op: 'add', value: 10 },
          { kind: 'character', id: 'rosenblatt', field: 'affinity', op: 'add', value: 25 },
          { kind: 'character', id: 'minsky', field: 'affinity', op: 'add', value: -18 },
          { kind: 'flag', flag: 'backedConnectionists', op: 'add', value: 1 },
        ],
      },
      {
        text: 'Back the formalists. Prove what these things can and cannot do.',
        hint: 'The result is real and it is used as a weapon.',
        effects: [
          { kind: 'family', family: 'symbolic', field: 'momentum', op: 'add', value: 14 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 12 },
          { kind: 'character', id: 'minsky', field: 'affinity', op: 'add', value: 22 },
          { kind: 'character', id: 'rosenblatt', field: 'affinity', op: 'add', value: -15 },
          { kind: 'flag', flag: 'backedFormalists', op: 'add', value: 1 },
        ],
      },
      {
        text: 'Make them share a grant. Neither may publish without the other.',
        hint: 'Both will hate it. It is also the only move that keeps both alive.',
        cost: 5,
        effects: [
          { kind: 'family', family: 'bridge', field: 'insight', op: 'add', value: 14 },
          { kind: 'family', family: 'connectionist', field: 'momentum', op: 'add', value: 6 },
          { kind: 'family', family: 'symbolic', field: 'momentum', op: 'add', value: 6 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 8 },
          { kind: 'flag', flag: 'forcedTruce', op: 'set', value: true },
          { kind: 'log', text: 'A joint grant nobody wanted. It holds for four years.', logKind: 'choice' },
        ],
      },
    ],
  },

  {
    id: 'a1-eastern',
    act: 1,
    years: [1954, 1962],
    priority: 5,
    backdrop: 'corridor',
    lines: [
      {
        who: 'archivist',
        text: 'A note on the other half of the world, since the record is thin and people assume that means nothing happened.',
      },
      {
        who: 'archivist',
        text: 'Cybernetics is denounced in the Soviet Union as a reactionary pseudoscience in the service of imperialism. This lasts until roughly 1955, at which point it is reversed so completely that it becomes state doctrine for planning the economy.',
      },
      {
        who: 'archivist',
        text: 'The theory that follows is often excellent. The hardware is not, and cannot be, and that gap decides the outcome far more than any argument about representation does.',
      },
      { who: 'archivist', text: 'Remember that when you are deciding what to fund. The substrate has a vote.' },
    ],
    choices: [
      {
        text: 'Open a channel. Ideas should cross the line even if machines cannot.',
        cost: 4,
        effects: [
          { kind: 'actor', id: 'eastern-cybernetics', field: 'stance', op: 'add', value: 0.4 },
          { kind: 'family', family: 'cybernetic', field: 'insight', op: 'add', value: 8 },
          { kind: 'family', family: 'collective', field: 'insight', op: 'add', value: 6 },
          { kind: 'flag', flag: 'eastChannel', op: 'set', value: true },
        ],
      },
      {
        text: 'Noted. Keep the work where the machines are.',
        effects: [{ kind: 'patron', patron: 'military', op: 'add', value: 5 }],
      },
    ],
  },

  {
    id: 'a1-translation',
    act: 1,
    years: [1958, 1966],
    priority: 6,
    backdrop: 'committee',
    lines: [
      {
        text: 'Machine translation has been funded generously since 1954 on the strength of a demonstration involving sixty carefully chosen Russian sentences.',
      },
      {
        who: 'archivist',
        text: 'The demonstration worked. The generalisation did not. It turns out that translating a sentence requires knowing what the sentence is about, and nobody has any idea how to give a machine that.',
      },
      {
        who: 'archivist',
        text: 'The committees are beginning to notice the gap between the sixty sentences and everything else. There is a review coming.',
      },
    ],
    choices: [
      {
        text: 'Get ahead of it. Publish the honest assessment yourselves.',
        hint: 'Painful now. Considerably less painful in 1966.',
        effects: [
          { kind: 'resource', key: 'credibility', op: 'add', value: 12 },
          { kind: 'resource', key: 'attention', op: 'add', value: -10 },
          { kind: 'flag', flag: 'honestOnMT', op: 'set', value: true },
          { kind: 'log', text: 'The field says out loud that machine translation is not close.', logKind: 'choice' },
        ],
      },
      {
        text: 'Keep the contracts. Another demonstration will buy two more years.',
        effects: [
          { kind: 'patron', patron: 'military', op: 'add', value: 10 },
          { kind: 'resource', key: 'attention', op: 'add', value: 8 },
          { kind: 'flag', flag: 'mtPromises', op: 'add', value: 1 },
        ],
      },
      {
        text: 'Redirect the money to statistical methods on real corpora.',
        hint: 'Correct by about thirty years. Nobody will thank you.',
        effects: [
          { kind: 'family', family: 'statistical', field: 'insight', op: 'add', value: 14 },
          { kind: 'family', family: 'statistical', field: 'momentum', op: 'add', value: 10 },
          { kind: 'resource', key: 'credibility', op: 'add', value: -5 },
          { kind: 'flag', flag: 'earlyStatisticalNLP', op: 'set', value: true },
        ],
      },
    ],
  },

  {
    id: 'a1-student',
    act: 1,
    years: [1958, 1970],
    priority: 4,
    once: false,
    backdrop: 'corridor',
    lines: [
      {
        text: 'A graduate student stops you in a corridor. They have an offer from two laboratories and three weeks to decide.',
      },
      {
        who: 'archivist',
        text: 'This happens roughly four thousand times a year and each one is invisible. In aggregate it is the single largest force in this simulation, and you get to touch it about twice a decade.',
      },
    ],
    choices: [
      {
        text: '"Go where the machines are."',
        effects: [
          { kind: 'family', family: 'substrate', field: 'talent', op: 'add', value: 0.03 },
          { kind: 'family', family: 'symbolic', field: 'talent', op: 'add', value: 0.02 },
        ],
      },
      {
        text: '"Go where nobody else is going."',
        hint: 'Terrible career advice. Occasionally decisive.',
        effects: [
          { kind: 'resource', key: 'understanding', op: 'add', value: 6 },
          { kind: 'flag', flag: 'keptFaith', op: 'add', value: 1 },
          { kind: 'family', family: 'bridge', field: 'talent', op: 'add', value: 0.025 },
        ],
      },
      {
        text: '"Go where the argument is loudest."',
        effects: [
          { kind: 'resource', key: 'attention', op: 'add', value: 5 },
          { kind: 'resource', key: 'influence', op: 'add', value: 3 },
        ],
      },
    ],
  },

  {
    id: 'a1-analog-question',
    act: 1,
    years: [1950, 1962],
    priority: 4,
    backdrop: 'machine-room',
    /*
     * The differential analyser is not a research programme anyone has to fund into existence —
     * it is already downstairs and already working in 1950. The live question is whether the
     * tradition keeps any people once someone starts building hardware specifically to learn on,
     * which is what closes this scene.
     */
    when: all(mature('analog-computing'), notMature('neural-hardware')),
    lines: [
      {
        text: 'In the next building there is a machine that solves differential equations by being one. Voltages for variables, capacitors for integrals, answers at the speed of electricity.',
      },
      {
        who: 'archivist',
        text: 'It is faster than anything digital in this building, it uses a fraction of the power, and it is being decommissioned, because you cannot get the same answer twice and you cannot program it without a soldering iron.',
      },
      {
        who: 'archivist',
        text: 'The field is about to spend seventy years assuming that computation means discrete symbols on reliable hardware. It is a defensible assumption. It is also a choice, and almost nobody making it notices they are making it.',
      },
    ],
    choices: [
      {
        text: 'Keep an analog programme alive somewhere.',
        hint: 'It comes back. It takes until the 2020s.',
        cost: 4,
        effects: [
          { kind: 'family', family: 'substrate', field: 'insight', op: 'add', value: 16 },
          { kind: 'family', family: 'substrate', field: 'talent', op: 'add', value: 0.02 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 4 },
          { kind: 'flag', flag: 'analogKept', op: 'set', value: true },
        ],
      },
      {
        text: 'Let it go. Digital is repeatable and repeatable wins.',
        effects: [
          { kind: 'family', family: 'substrate', field: 'momentum', op: 'add', value: 9 },
          { kind: 'resource', key: 'capability', op: 'add', value: 3 },
          { kind: 'patron', patron: 'corporate', op: 'add', value: 3 },
        ],
      },
    ],
  },

  {
    id: 'a1-first-anomaly',
    act: 1,
    years: [1962, 1962],
    priority: 7,
    backdrop: 'archive',
    when: { kind: 'turn', min: 3 },
    lines: [
      { system: true, text: 'RECORD CONSISTENCY CHECK — INTERVAL 1958-1962' },
      {
        who: 'archivist',
        text: 'A small thing. Probably nothing. There is an entry in the record for this interval that neither of us made.',
      },
      { system: true, text: 'ENTRY 0041: "he was right about the child machine and we did not listen"' },
      {
        who: 'archivist',
        text: 'It is in my hand. It is dated correctly. I did not write it and I would remember writing it, because I do not editorialise.',
      },
      { who: 'archivist', text: 'I will keep an eye on it. Carry on.' },
    ],
    onEnter: [{ kind: 'flag', flag: 'anomalies', op: 'add', value: 1 }],
  },

  {
    id: 'a1-close',
    act: 1,
    years: [1962, 1962],
    priority: 5,
    backdrop: 'lecture-hall',
    when: { kind: 'turn', min: 3 },
    lines: [
      {
        who: 'archivist',
        text: 'Twelve years. Look at what is on the table: logical inference, learning machines, feedback control, evolution, information theory, adaptive hardware, and a man in Berkeley about to argue that "tall" is not a proposition.',
      },
      {
        who: 'archivist',
        text: 'Every school this century will have is already here in some form. What happens next is not discovery. It is narrowing.',
      },
      {
        who: 'archivist',
        text: 'The narrowing is not a conspiracy either. It is committees, and hiring, and which conference will take your paper, and a thousand people each making a locally reasonable decision.',
      },
    ],
    choices: [
      {
        text: 'Then spend the next act keeping the losing schools alive.',
        effects: [
          { kind: 'flag', flag: 'pluralist', op: 'add', value: 1 },
          { kind: 'family', family: 'bridge', field: 'insight', op: 'add', value: 8 },
          { kind: 'character', id: 'archivist', field: 'affinity', op: 'add', value: 15 },
        ],
      },
      {
        text: 'Narrowing is how a field makes progress. Pick a winner and push.',
        effects: [
          { kind: 'resource', key: 'influence', op: 'add', value: 8 },
          { kind: 'flag', flag: 'focused', op: 'add', value: 1 },
        ],
      },
    ],
  },

  // A cheap recurring beat so a quiet turn is never empty.
  {
    id: 'a1-ambient-committee',
    act: 1,
    priority: 3,
    once: false,
    backdrop: 'committee',
    when: not(resource('influence', '<', 6)),
    lines: [
      {
        text: 'A funding panel, a slide rule, and four men deciding the shape of a discipline on the basis of a twenty-minute presentation.',
      },
      {
        who: 'archivist',
        text: 'Most of the century looks like this. The dramatic scenes are what survives into the histories; this is what actually allocates the money.',
      },
    ],
    choices: [
      {
        text: 'Argue for breadth.',
        effects: [
          { kind: 'family', family: 'bridge', field: 'insight', op: 'add', value: 4 },
          { kind: 'resource', key: 'understanding', op: 'add', value: 3 },
        ],
      },
      {
        text: 'Argue for depth.',
        effects: [
          { kind: 'resource', key: 'influence', op: 'add', value: 4 },
          { kind: 'resource', key: 'credibility', op: 'add', value: 2 },
        ],
      },
    ],
  },


];

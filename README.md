# AI Timelines

**A visual novel about a hundred years of argument over what a mind is — and your hand on where
the money, the people and the attention go.**

**▶ Play it: https://m1omg.github.io/ai-timelines/**

1950 to 2050, in twenty-six four-year turns. Eight schools of thought. A hundred and five ideas,
every one of them real. You do not get to decide what is true. You decide what gets funded, who
gets defended, and what the field says about itself in public — and then four years pass and the
world reacts on its own terms.

Or run it locally:

```bash
npm install
npm run dev      # play at http://localhost:5173
```

No runtime dependencies. No downloaded assets. Every portrait, backdrop and sound in the game is
generated in the browser from a seed.

---

## What you are actually playing

Underneath the story is a real simulation, and the story is mostly a window onto it.

**Eight schools, ninety-plus years apart.** Symbolic, connectionist, statistical and Bayesian,
evolutionary, collective and swarm, cybernetic and embodied, substrate, and the bridge work that
joins them. Each is a different answer to what a mind *is*, not a different technique — which is
why the field's arguments were so unusually bitter for so unusually long.

**Ideas arrive when they can, not when you pay for them.** Every paradigm has an earliest year,
a set of prerequisites, and a compute requirement. Back reservoir computing in 1960 and you will
spend a decade looking like a fool; the idea is correct and no machine that exists can
demonstrate it. Several of the century's biggest arguments were settled by hardware nobody in
them had asked for.

**Winters are not scripted.** There is no calendar entry for 1974 or 1987. There is a rule: when
the field's outstanding promises outrun what it has actually delivered, for long enough, the
money leaves — and whichever school was loudest at the time takes the blame, not whichever was
wrong. Play carefully and the winters that happened in reality never happen. Talk the field up
and you can arrange four of them.

**You are not the only hand on the wheel.** Fourteen institutions — funding agencies, university
laboratories, national programmes, corporate research arms, and later some invented successors —
pursue their own tastes every turn whether you engage or not.

**Understanding and capability are separate quantities**, and the gap between them is the thing
the whole game is really about. Capability is what the field can do. Understanding is its grip on
*why*. Nothing forces them to advance together, and almost every serious failure in the real
history lives in the space between.

**The bridges cost you a portfolio.** The deepest nodes require genuine insight in two or three
schools at once. A player who backs one winner will find an entire column of the tree permanently
locked — which is the argument the game is making.

---

## Playing it

| | |
|---|---|
| **Click, space or enter** | advance dialogue (again to skip the typing) |
| **Back** | appears once you have made a choice: undoes it and plays that moment again, rolling back anything spent since. One step only, and it goes away when the turn advances |
| **Paradigms** | the full tree — click any entry for what the idea actually is, and why it is blocked |
| **Codex** | an encyclopedia that unlocks as you reach things: every idea, every person you have met, with sources |
| **Record** | what happened, in order |
| **Menu** | save, export a save code, sound on/off |

A run is fully determined by its seed plus your choices, so an exported save code replays
exactly. Sound is synthesised in the browser, on by default, and the toggle in the menu is
remembered.

The interface ages with the century. Seven acts, seven eras, and the whole skin changes at each
act break — teleprinter, storage tube, colour adapter, browser, panel, and two more. That is
diegetic, and it is worth watching for.

---

## Repository

```
src/engine/     the simulation — state, seeded RNG, the condition/effect DSL, the yearly tick,
                autonomous actors, the scene scheduler, endings, save/load
src/content/    everything authored: paradigms (8 files, one per school), scenes (7 acts),
                characters, actors, directives, codex essays, endings
src/art/        procedural SVG — scanline portraits, 16 backdrops, seven era palettes
src/ui/         theme, synthesised audio, the novel renderer, directive board, tree, codex
tools/          the content linter and the Monte Carlo playtest harness
tests/          Vitest suites for the engine and content
```

Two design decisions are load-bearing and worth knowing before you change anything:

1. **Content is typed TypeScript, never JSON.** A misspelled paradigm id is a compile error.
2. **Conditions and effects are declarative data, not predicate functions.** That costs a little
   expressiveness and buys static analysability — `tools/lint-content.ts` walks the same trees
   the engine evaluates, which is the only reason it can detect an unreachable scene, a gate on
   a flag nothing sets, or an ending that can never fire.

### Depicting real people

Everyone through the 2020s is a real historical figure, and the rules are written into the header
of `src/content/characters.ts` and enforced by the linter: documented professional roles only,
every line a paraphrase of a position the person took in print, mandatory sources, no invented
private life, and nothing said about events they did not live to see. Everyone appearing after
2026 is invented. Portraits are deliberately abstract scanline figures — diagrams of a person,
not likenesses.

---

## Verifying it

```bash
npm run verify     # typecheck + content lint + tests + playtest
```

- **`npm run lint:content`** fails the build on a choice pointing at a missing scene, a scene
  gated on a flag nothing ever sets, a prerequisite cycle, an ending that cannot fire, a year in
  which no scene can play, a paradigm nothing can reach, a real person speaking outside their
  documented span or after the record ends, and a dozen other things.
- **`npm run playtest`** plays about four thousand bot games across fifteen policies — random,
  greedy, hoarder, loudmouth, accelerationist, broad, synthesis, and one per school — and reports
  crashes, stalls, the ending distribution, unreached content, and whether every school is
  actually viable as a primary strategy. A paradigm nobody can win with is a design bug, and this
  is how it gets found.
- **`npm test`** covers the winter rule, talent migration, prerequisite gating, save round-trips,
  RNG determinism and condition evaluation.

The balance constants at the top of `src/engine/sim.ts` were all set from playtest output rather
than by eye. If you move one, re-run the harness: it has sanity bands on winter frequency, node
count and the end-of-century compute frontier, and it will tell you when the century has stopped
being about trade-offs.

---

## Licence

GPL-2.0-only. See `LICENSE`.

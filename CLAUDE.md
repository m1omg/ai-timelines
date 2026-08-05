# Working on AI Timelines

A century-scale visual novel with a real simulation under it. Read `README.md` first for what the
game is; this file is about how to change it without breaking it.

## Commands

```bash
npm run dev            # play at localhost:5173
npm run verify         # typecheck + content lint + tests + playtest — run before any commit
npm run lint:content   # coherence checks (unreachable scenes, dead gates, anachronisms)
npm run playtest       # ~4000 bot games; balance and reachability
npm test               # Vitest
npm run build          # static site into dist/
```

`npm run verify` is the gate. Everything below exists because one of those checks caught it.

## Two rules that shape everything

1. **Content is typed TypeScript, never JSON.** Paradigms, scenes, characters, endings and
   directives are all typed modules under `src/content/`. A misspelled paradigm id is a compile
   error rather than a silent no-op at play time.

2. **Conditions and effects are declarative data, not predicate functions.** See the `Condition`
   and `Effect` unions in `src/engine/types.ts`. This is deliberate and it is the reason
   `tools/lint-content.ts` can answer questions a type system cannot: is this scene reachable, is
   this flag ever set, can this ending fire at all. If you are tempted to add
   `when: (s) => ...`, add a new condition kind instead — and teach the linter about it.

## Where things live

| Area | Path | Notes |
|---|---|---|
| Simulation | `src/engine/sim.ts` | The yearly tick. Balance constants at the top. |
| State shape | `src/engine/types.ts` | Single source of truth for the whole vocabulary. |
| Conditions | `src/engine/conditions.ts` | Evaluator plus the builders content uses (`all`, `mature`, `ratio`, …). |
| Effects | `src/engine/effects.ts` | Applier plus resource ceilings. |
| Scene selection | `src/engine/scheduler.ts` | Trigger-and-priority, not a playlist. |
| Paradigms | `src/content/paradigms/*.ts` | One file per school; `index.ts` concatenates. |
| Scenes | `src/content/acts/act1..7.ts` | `scenes.ts` concatenates; act 0 is the opening, played explicitly by `main.ts`. |
| Art | `src/art/` | All procedural SVG. No binary assets ship, ever. |

## Adding content

**A new paradigm** — add it to the right file in `src/content/paradigms/`. It needs an
`earliest` year, `prereqs`, a `computeNeed` in log10 FLOPs, a real `anchor`, and a `codex` entry
that says what the idea actually is and why it did or did not win. Then run `npm run playtest`:
the harness fails if any paradigm can never mature under any policy.

**A new scene** — add it to the act file whose year range contains it. `years` must overlap the
act's own range or the linter rejects it as unfireable. Give it a `priority`; anything at 1–2
competes with a lot and may never be picked, which the playtest will tell you.

**A new ending** — endings resolve highest-priority-first, so a broad ending at high priority
silently shadows every specific one below it. The linter catches unconditional endings above
priority 0; only the playtest catches an ending that is merely *too easy*. Check its share in the
distribution afterwards.

**A real person** — read the depiction rules in the header of `src/content/characters.ts`. They
are enforced: `sources` is mandatory, spans are bounded by documented activity, and no historical
figure may speak in act 6 or later or in any ending. Everyone past 2026 is invented.

## Balance

The constants at the top of `src/engine/sim.ts` were set from playtest output, not by eye. The
harness has sanity bands on winter frequency, nodes matured, and the end-of-century compute
frontier; if you move a constant and the century stops being about trade-offs, it will say so.

The most sensitive number by far is the compute growth rate in `advanceTurn`. It decides which
paradigms are demonstrable at all, so a small change there cascades into everything: maturation
rate, winter frequency, and which endings are reachable.

## Things that have already gone wrong once

- **Bypassing the resource ceilings.** The tick writes `capability` and `understanding`
  directly rather than through `applyEffect`, so it has to clamp them itself. It does; keep it
  that way, or the ending thresholds stop meaning anything.
- **`notMature(x)` reading as an anachronism.** The linter tracks negation context precisely
  because a requirement that something has *not* happened is satisfiable in any year.
- **Two endings with near-identical gates.** The lower-priority one simply never fires. Give
  them a distinguishing condition, not just a different priority.
- **Scene text advancing a paradigm that cannot exist yet.** The linter warns; move the scene to
  a later act rather than widening the paradigm's era.

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

## Shipping

Changes go live by default. Once `npm run verify` is clean, merge to `main` and let the Pages
workflow deploy — do not stop at a pushed branch waiting to be asked. The one thing worth doing
after a deploy is checking the built assets on `gh-pages` actually contain the change, because a
green workflow only proves the build ran.

Two sites live on `gh-pages`: the root, published from `main`, and
[`/ai-timelines-dev`](https://m1omg.github.io/ai-timelines/ai-timelines-dev/), published from any
`claude/**` branch — a real URL for a century in progress that does not touch the one people are
given. Publishing updates one subtree and leaves the other alone. It used to force-push a fresh
orphan branch, which silently deleted the dev copy on the next push to main; if you change that
step, keep it non-destructive.

Rebuild the single-file copy after a deploy, too, so the offline version never lags the site.
It is one HTML file with the bundle, the stylesheet and all six plates inlined as data URIs —
no server, no network, nothing to install. Build it with a throwaway config, never by editing
`vite.config.ts`: that file sets `assetsInlineLimit: 0` on purpose, and inlining the plates
into the hosted build would cost ~38 kB of gzip and stop them being cached or loaded per act.

```ts
// vite.single.config.ts — build, send, delete. Do not commit.
import { defineConfig } from 'vite';
export default defineConfig({
  base: './',
  build: {
    target: 'es2022', outDir: '<somewhere outside the repo>', emptyOutDir: true,
    cssCodeSplit: false, assetsInlineLimit: 100_000_000,
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
} as never);
```

Then fold the emitted `.js` and `.css` into `dist-single/index.html` — escaping `</script` in
the bundle, or a string in the content closes the tag early — and check it from a `file://`
open with every non-file request blocked. Saves are per-origin, so a century saved in the file
never appears on the site; the per-slot **Copy code** button is how a run moves between them.

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
| Art | `src/art/` | Procedural SVG. The era plates in `src/art/plates/` are the *only* binary assets; nothing else may be. |
| Score | `src/ui/score.ts` | Pure composition — one voice per era, one composer per school. `synth.ts` plays it, `music.ts` schedules it. |
| Era skins | `src/styles/base.css` | Everything above the `era skins` banner is palette-driven; below it, one block per era. |

## Adding content

**A new paradigm** — add it to the right file in `src/content/paradigms/`. It needs an
`earliest` year, `prereqs`, a `computeNeed` in log10 FLOPs, a real `anchor`, and a `codex` entry
that says what the idea actually is and why it did or did not win. Then run `npm run playtest`:
the harness fails if any paradigm can never mature under any policy.

**A new scene** — add it to the act file whose year range contains it. `years` must overlap the
act's own range or the linter rejects it as unfireable. Give it a `priority`; anything at 1–2
competes with a lot and may never be picked, which the playtest will tell you.

**A new line the player will see twice** — the narrator carries over half the text and several
scenes fire three or four times in one century, so a flat line is read aloud identically on every
run. Give it `alts` (alternative wordings of the *same* line, picked from seed + scene + turn) or
`when` (a different claim, gated on the run). For a historical figure every alternative must be
the same documented position phrased for a different situation — and gate them on what the field
*built*, not on `leadFamily`, unless you are willing to write all eight: `tests/content/coherence`
requires a scene that addresses the leading school to address whichever one it is.

**A new ending** — endings resolve highest-priority-first, so a broad ending at high priority
silently shadows every specific one below it. The linter catches unconditional endings above
priority 0; only the playtest catches an ending that is merely *too easy*. Check its share in the
distribution afterwards.

**A real person** — read the depiction rules in the header of `src/content/characters.ts`. They
are enforced: `sources` is mandatory, spans are bounded by documented activity, and no historical
figure may speak in act 6 or later or in any ending. Everyone past 2026 is invented.

**A new era plate** — edit the manifest at the top of `tools/plates/make-plates.py`, then
`pip install Pillow && python3 tools/plates/make-plates.py`. It rewrites `src/art/plates/` and
`src/art/plates.ts`, both committed; nothing in the normal build, test or deploy path needs
Python or a network. Set `tones` to 2 or 4 for an era whose display could not do better, or
leave it 0 for colour — the ladder from one bit to full colour is the point, so do not flatten
it. Commons rate-limits hard; the fetcher backs off, and the download cache means a re-run
after a treatment change costs nothing.
Two rules the manifest is holding: the source must be public domain or CC0, and it must be of a
machine or a room — a photograph of a real person would walk straight through the depiction
rules that the rest of the cast is held to. An era also needs a `plateRamp` in
`src/art/palette.ts`, darkest colour first, or the plate silently does not render.

**A new school or era voice for the music** — `src/ui/score.ts` holds an `EraVoice` per era id
and a composer per `FamilyId`, and both records are exhaustive, so adding either without the
other is a compile error. Keep composition pure: it returns notes and must never touch an audio
API, which is what lets `tests/ui/score.test.ts` check all fifty-six combinations and what lets
`renderPiece` bounce a bar offline to listen to. Anything that makes noise belongs in
`synth.ts`, and it takes a `BaseAudioContext` so the live game and the offline render run the
same code.

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

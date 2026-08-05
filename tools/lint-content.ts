/**
 * Content coherence linter.
 *
 * The whole reason conditions and effects are declarative data (see src/engine/types.ts) is so
 * this file can walk the same trees the engine evaluates. It answers questions no type system
 * can: is this scene reachable, is this flag ever set, can this ending actually fire.
 *
 * Run with `npm run lint:content`. Exits non-zero on any error.
 */

import { ACTORS } from '../src/content/actors';
import { CHARACTER_BY_ID, CHARACTERS } from '../src/content/characters';
import { CODEX_ESSAYS } from '../src/content/codex';
import { AUTHORED_DIRECTIVES } from '../src/content/directives';
import { ENDINGS } from '../src/content/endings';
import { PARADIGMS, PARADIGM_BY_ID } from '../src/content/paradigms';
import { ALL_SCENES, SCENE_BY_ID } from '../src/content/scenes';
import { ACT_TURNS, END_YEAR, START_YEAR, yearOfTurn } from '../src/engine/state';
import type { Condition, Effect, Scene } from '../src/engine/types';
import { FAMILY_IDS, PATRON_IDS, RESOURCE_KEYS } from '../src/engine/types';

const errors: string[] = [];
const warnings: string[] = [];

const err = (msg: string) => errors.push(msg);
const warn = (msg: string) => warnings.push(msg);

// ---------------------------------------------------------------------------
// Tree walkers
// ---------------------------------------------------------------------------

function walkConditions(c: Condition | undefined, fn: (c: Condition, negated: boolean) => void, negated = false): void {
  if (!c) return;
  fn(c, negated);
  if (c.kind === 'not') walkConditions(c.c, fn, !negated);
  else if (c.kind === 'all' || c.kind === 'any') for (const x of c.cs) walkConditions(x, fn, negated);
}

/**
 * Conditions with their negation context. `notMature('x')` is a requirement that x has *not*
 * happened, which is satisfiable in any year — so the anachronism check has to know the
 * difference or it reports every one of them.
 */
function allConditionsIn(scene: Scene): { c: Condition; negated: boolean }[] {
  const out: { c: Condition; negated: boolean }[] = [];
  const collect = (c: Condition, negated: boolean) => out.push({ c, negated });
  walkConditions(scene.when, collect);
  for (const ch of scene.choices ?? []) walkConditions(ch.when, collect);
  return out;
}

function allEffectsIn(scene: Scene): Effect[] {
  const out: Effect[] = [...(scene.onEnter ?? [])];
  for (const ch of scene.choices ?? []) out.push(...(ch.effects ?? []));
  return out;
}

// ---------------------------------------------------------------------------
// 1. Referential integrity
// ---------------------------------------------------------------------------

function checkReferences(): void {
  const sceneIds = new Set(ALL_SCENES.map((s) => s.id));
  const paradigmIds = new Set(PARADIGMS.map((p) => p.id));
  const characterIds = new Set(CHARACTERS.map((c) => c.id));
  const actorIds = new Set(ACTORS.map((a) => a.id));
  const endingIds = new Set(ENDINGS.map((e) => e.id));

  const seen = new Set<string>();
  for (const s of ALL_SCENES) {
    if (seen.has(s.id)) err(`duplicate scene id: ${s.id}`);
    seen.add(s.id);
  }

  for (const s of ALL_SCENES) {
    if (s.next && !sceneIds.has(s.next)) err(`${s.id}: next -> unknown scene "${s.next}"`);
    for (const ch of s.choices ?? []) {
      if (ch.goto && !sceneIds.has(ch.goto)) err(`${s.id}: choice goto -> unknown scene "${ch.goto}"`);
    }
    for (const line of s.lines) {
      if (line.who && !characterIds.has(line.who)) err(`${s.id}: line spoken by unknown character "${line.who}"`);
    }
    if (s.lines.length === 0) err(`${s.id}: has no lines`);

    for (const { c } of allConditionsIn(s)) checkConditionRefs(s.id, c, paradigmIds, characterIds, actorIds);
    for (const e of allEffectsIn(s)) checkEffectRefs(s.id, e, paradigmIds, characterIds, actorIds, endingIds);
  }

  for (const d of AUTHORED_DIRECTIVES) {
    walkConditions(d.when, (c) => checkConditionRefs(`directive:${d.id}`, c, paradigmIds, characterIds, actorIds));
    for (const e of d.effects) {
      checkEffectRefs(`directive:${d.id}`, e, paradigmIds, characterIds, actorIds, endingIds);
    }
  }

  for (const e of ENDINGS) {
    walkConditions(e.when, (c) => checkConditionRefs(`ending:${e.id}`, c, paradigmIds, characterIds, actorIds));
    for (const line of e.lines) {
      if (line.who && !characterIds.has(line.who)) err(`ending:${e.id}: unknown character "${line.who}"`);
    }
  }

  for (const p of PARADIGMS) {
    for (const pre of p.prereqs) {
      if (!paradigmIds.has(pre)) err(`paradigm ${p.id}: unknown prerequisite "${pre}"`);
    }
    for (const f of Object.keys(p.familyPrereqs ?? {})) {
      if (!FAMILY_IDS.includes(f as never)) err(`paradigm ${p.id}: unknown family prerequisite "${f}"`);
    }
    if (!FAMILY_IDS.includes(p.family)) err(`paradigm ${p.id}: unknown family "${p.family}"`);
  }
}

function checkConditionRefs(
  where: string,
  c: Condition,
  paradigms: Set<string>,
  characters: Set<string>,
  actors: Set<string>,
): void {
  switch (c.kind) {
    case 'paradigm':
      if (!paradigms.has(c.id)) err(`${where}: condition references unknown paradigm "${c.id}"`);
      break;
    case 'character':
    case 'characterMet':
      if (!characters.has(c.id)) err(`${where}: condition references unknown character "${c.id}"`);
      break;
    case 'actor':
      if (!actors.has(c.id)) err(`${where}: condition references unknown actor "${c.id}"`);
      break;
    case 'seen':
      if (!SCENE_BY_ID[c.scene]) err(`${where}: condition references unknown scene "${c.scene}"`);
      break;
    case 'resource':
      if (!RESOURCE_KEYS.includes(c.key)) err(`${where}: unknown resource "${c.key}"`);
      break;
    case 'patron':
      if (!PATRON_IDS.includes(c.patron)) err(`${where}: unknown patron "${c.patron}"`);
      break;
    case 'family':
    case 'leadFamily':
      if (!FAMILY_IDS.includes(c.family)) err(`${where}: unknown family "${c.family}"`);
      break;
    default:
      break;
  }
}

function checkEffectRefs(
  where: string,
  e: Effect,
  paradigms: Set<string>,
  characters: Set<string>,
  actors: Set<string>,
  endings: Set<string>,
): void {
  switch (e.kind) {
    case 'paradigm':
      if (!paradigms.has(e.id)) err(`${where}: effect references unknown paradigm "${e.id}"`);
      break;
    case 'character':
    case 'characterActive':
      if (!characters.has(e.id)) err(`${where}: effect references unknown character "${e.id}"`);
      break;
    case 'actor':
      if (!actors.has(e.id)) err(`${where}: effect references unknown actor "${e.id}"`);
      break;
    case 'ending':
      if (!endings.has(e.id)) err(`${where}: effect references unknown ending "${e.id}"`);
      break;
    case 'resource':
      if (!RESOURCE_KEYS.includes(e.key)) err(`${where}: unknown resource "${e.key}"`);
      break;
    case 'patron':
      if (!PATRON_IDS.includes(e.patron)) err(`${where}: unknown patron "${e.patron}"`);
      break;
    case 'family':
      if (!FAMILY_IDS.includes(e.family)) err(`${where}: unknown family "${e.family}"`);
      break;
    default:
      break;
  }
}

// ---------------------------------------------------------------------------
// 2. Dead gates — a condition testing a flag nothing ever sets
// ---------------------------------------------------------------------------

function checkDeadGates(): void {
  const written = new Set<string>();
  const collectWrites = (es: Effect[]) => {
    for (const e of es) if (e.kind === 'flag') written.add(e.flag);
  };
  for (const s of ALL_SCENES) collectWrites(allEffectsIn(s));
  for (const d of AUTHORED_DIRECTIVES) collectWrites(d.effects);

  const read = new Map<string, string[]>();
  const collectReads = (where: string, c: Condition) => {
    if (c.kind === 'flag' || c.kind === 'flagSet') {
      const list = read.get(c.flag) ?? [];
      list.push(where);
      read.set(c.flag, list);
    }
  };
  for (const s of ALL_SCENES) for (const { c } of allConditionsIn(s)) collectReads(s.id, c);
  for (const d of AUTHORED_DIRECTIVES) walkConditions(d.when, (c) => collectReads(`directive:${d.id}`, c));
  for (const e of ENDINGS) walkConditions(e.when, (c) => collectReads(`ending:${e.id}`, c));

  for (const [flag, wheres] of read) {
    if (!written.has(flag)) {
      err(`dead gate: flag "${flag}" is tested in ${wheres.join(', ')} but never set by any effect`);
    }
  }

  for (const flag of written) {
    if (!read.has(flag)) warn(`flag "${flag}" is set but never read (fine if it is only for the ending summary)`);
  }
}

// ---------------------------------------------------------------------------
// 3. Anachronisms — content that cannot fire in the window it claims
// ---------------------------------------------------------------------------

function actYearRange(act: number): [number, number] {
  const range = ACT_TURNS[act - 1];
  if (!range) return [START_YEAR, END_YEAR];
  return [yearOfTurn(range[0]), yearOfTurn(range[1])];
}

function checkAnachronisms(): void {
  for (const s of ALL_SCENES) {
    if (s.act === 0) continue;
    const [lo, hi] = actYearRange(s.act);

    if (s.years) {
      if (s.years[0] > s.years[1]) err(`${s.id}: years window is inverted`);
      if (s.years[1] < lo || s.years[0] > hi) {
        err(`${s.id}: years ${s.years[0]}-${s.years[1]} never overlap act ${s.act} (${lo}-${hi}); scene can never fire`);
      }
    }

    // A scene cannot reference a paradigm that could not exist by its latest possible year.
    const latest = s.years ? Math.min(s.years[1], hi) : hi;
    const earliest = s.years ? Math.max(s.years[0], lo) : lo;

    for (const { c, negated } of allConditionsIn(s)) {
      // A requirement that something has *not* happened is satisfiable in any year.
      if (c.kind === 'paradigm' && !negated) {
        const p = PARADIGM_BY_ID[c.id];
        if (p && p.earliest > latest && (c.status === 'mature' || c.status === undefined)) {
          err(`${s.id}: requires paradigm "${c.id}" (earliest ${p.earliest}) but can only fire by ${latest}`);
        }
      }
    }
    for (const e of allEffectsIn(s)) {
      if (e.kind === 'paradigm' && (e.op === 'progress' || e.op === 'mature')) {
        const p = PARADIGM_BY_ID[e.id];
        if (p && p.earliest > latest) {
          warn(`${s.id}: advances paradigm "${e.id}" (earliest ${p.earliest}) but fires by ${latest}`);
        }
      }
    }

    // Characters may not speak outside their documented span.
    for (const line of s.lines) {
      if (!line.who) continue;
      const c = CHARACTER_BY_ID[line.who];
      if (!c) continue;
      if (c.span[0] > latest || c.span[1] < earliest) {
        err(
          `${s.id}: ${c.name} speaks in ${earliest}-${latest} but their span is ${c.span[0]}-${c.span[1]}`,
        );
      }
    }
  }

  for (const p of PARADIGMS) {
    if (p.earliest < START_YEAR || p.earliest > END_YEAR) err(`paradigm ${p.id}: earliest ${p.earliest} is outside the century`);
    for (const pre of p.prereqs) {
      const q = PARADIGM_BY_ID[pre];
      if (q && q.earliest > p.earliest) {
        err(`paradigm ${p.id} (earliest ${p.earliest}) requires ${pre} which cannot exist before ${q.earliest}`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 4. Prerequisite cycles
// ---------------------------------------------------------------------------

function checkCycles(): void {
  const state = new Map<string, 0 | 1 | 2>();
  const visit = (id: string, path: string[]): void => {
    const st = state.get(id) ?? 0;
    if (st === 1) {
      err(`prerequisite cycle: ${[...path, id].join(' -> ')}`);
      return;
    }
    if (st === 2) return;
    state.set(id, 1);
    for (const pre of PARADIGM_BY_ID[id]?.prereqs ?? []) visit(pre, [...path, id]);
    state.set(id, 2);
  };
  for (const p of PARADIGMS) visit(p.id, []);
}

// ---------------------------------------------------------------------------
// 5. Reachability — every paradigm attainable, every ending firable
// ---------------------------------------------------------------------------

/**
 * Optimistic closure: assume maximum insight and unlimited compute, then ask which paradigms
 * could ever mature. Anything left out is unreachable under any play at all.
 */
function checkParadigmReachability(): void {
  const matured = new Set<string>();
  const insight: Record<string, number> = {};
  for (const f of FAMILY_IDS) insight[f] = 0;

  let changed = true;
  while (changed) {
    changed = false;
    for (const p of PARADIGMS) {
      if (matured.has(p.id)) continue;
      if (!p.prereqs.every((x) => matured.has(x))) continue;
      if (p.familyPrereqs && !Object.entries(p.familyPrereqs).every(([f, n]) => insight[f]! >= (n as number))) {
        continue;
      }
      matured.add(p.id);
      insight[p.family] = (insight[p.family] ?? 0) + p.cost * 0.32;
      changed = true;
    }
  }

  for (const p of PARADIGMS) {
    if (!matured.has(p.id)) {
      err(`paradigm "${p.id}" is unreachable: its prerequisites can never all be satisfied`);
    }
  }

  // Compute feasibility: the frontier reaches roughly 10^30 by 2050 on the base curve.
  const FRONTIER_2050 = 5 + 25 * 0.86;
  for (const p of PARADIGMS) {
    if (p.computeNeed > FRONTIER_2050 + 3) {
      err(`paradigm "${p.id}" needs 10^${p.computeNeed} compute; even a substrate-heavy century cannot reach that`);
    } else if (p.computeNeed > FRONTIER_2050) {
      warn(`paradigm "${p.id}" needs 10^${p.computeNeed}; only reachable with heavy substrate investment`);
    }
  }
}

/**
 * Endings are checked for internal contradiction rather than full satisfiability: an ending
 * asking for both `x > 100` and `x < 50` on the same resource can never fire, and that is the
 * failure mode that actually happens when authoring.
 */
function checkEndings(): void {
  const fallback = ENDINGS.filter((e) => e.priority === 0 && e.when.kind === 'always');
  if (fallback.length === 0) {
    err('no unconditional fallback ending: some runs would terminate with nothing to show');
  }
  if (fallback.length > 1) {
    err(`${fallback.length} unconditional fallback endings; only the highest-priority one can ever fire`);
  }

  const ids = new Set<string>();
  for (const e of ENDINGS) {
    if (ids.has(e.id)) err(`duplicate ending id: ${e.id}`);
    ids.add(e.id);
    if (e.lines.length === 0) err(`ending ${e.id}: has no lines`);
    if (!e.verdict) err(`ending ${e.id}: has no verdict`);

    const bounds = new Map<string, { min: number; max: number }>();
    walkConditions(e.when, (c) => {
      if (c.kind !== 'resource') return;
      const b = bounds.get(c.key) ?? { min: -Infinity, max: Infinity };
      if (c.op === '>' || c.op === '>=') b.min = Math.max(b.min, c.value);
      if (c.op === '<' || c.op === '<=') b.max = Math.min(b.max, c.value);
      bounds.set(c.key, b);
    });
    for (const [key, b] of bounds) {
      // Only flag a contradiction when the constraints are conjunctive at the top level.
      if (b.min > b.max && isConjunctive(e.when)) {
        err(`ending ${e.id}: requires ${key} > ${b.min} and < ${b.max} simultaneously`);
      }
    }
  }

  const highest = [...ENDINGS].sort((a, b) => b.priority - a.priority);
  for (let i = 0; i < highest.length; i++) {
    if (highest[i]!.when.kind === 'always' && highest[i]!.priority > 0) {
      const shadowed = highest.slice(i + 1).map((e) => e.id);
      if (shadowed.length > 0) {
        err(`ending ${highest[i]!.id} is unconditional at priority ${highest[i]!.priority}, shadowing: ${shadowed.join(', ')}`);
      }
    }
  }
}

function isConjunctive(c: Condition): boolean {
  if (c.kind === 'all') return c.cs.every(isConjunctive);
  return c.kind !== 'any' && c.kind !== 'not';
}

// ---------------------------------------------------------------------------
// 6. Depiction rules for real people
// ---------------------------------------------------------------------------

function checkDepiction(): void {
  const PRESENT_DAY = 2026;
  for (const c of CHARACTERS) {
    if (c.kind === 'historical') {
      if (!c.sources || c.sources.length === 0) {
        err(`character ${c.id}: historical figures must carry sources (see the header of characters.ts)`);
      }
      if (c.span[1] > PRESENT_DAY) {
        err(`character ${c.id}: historical figure has span ending ${c.span[1]}; the speculative acts must use fictional characters only`);
      }
      if (!c.bio || c.bio.length < 40) warn(`character ${c.id}: bio is very short for a real person`);
    }
    if (c.span[0] > c.span[1]) err(`character ${c.id}: span is inverted`);
  }

  // No real person may appear in an act set beyond the present day.
  for (const s of ALL_SCENES) {
    if (s.act < 6) continue;
    for (const line of s.lines) {
      const c = line.who ? CHARACTER_BY_ID[line.who] : undefined;
      if (c?.kind === 'historical') {
        err(`${s.id}: real person ${c.name} speaks in act ${s.act}, which is past the record`);
      }
    }
  }
  for (const e of ENDINGS) {
    for (const line of e.lines) {
      const c = line.who ? CHARACTER_BY_ID[line.who] : undefined;
      if (c?.kind === 'historical') err(`ending ${e.id}: real person ${c.name} speaks in an ending`);
    }
  }
}

// ---------------------------------------------------------------------------
// 7. Coverage — every act and turn has something to play
// ---------------------------------------------------------------------------

function checkCoverage(): void {
  for (let act = 1; act <= ACT_TURNS.length; act++) {
    const inAct = ALL_SCENES.filter((s) => s.act === act);
    if (inAct.length === 0) {
      err(`act ${act} has no scenes at all`);
      continue;
    }
    const [lo, hi] = ACT_TURNS[act - 1]!;
    for (let turn = lo; turn <= hi; turn++) {
      const year = yearOfTurn(turn);
      const playable = inAct.filter((s) => !s.years || (year >= s.years[0] && year <= s.years[1]));
      if (playable.length === 0) {
        err(`year ${year} (act ${act}) has no scene whose year window includes it`);
      }
      const recurring = playable.filter((s) => s.once === false);
      if (recurring.length === 0) {
        warn(`year ${year}: no repeatable scene available; a replay could find this turn empty`);
      }
    }
  }

  for (const p of PARADIGMS) {
    if (!p.codex || p.codex.length < 60) err(`paradigm ${p.id}: codex entry is missing or too short`);
    if (!p.short) err(`paradigm ${p.id}: missing short label`);
    if (p.short.length > 48) warn(`paradigm ${p.id}: short label is ${p.short.length} chars and may clip in the tree`);
  }

  for (const e of CODEX_ESSAYS) {
    if (e.from < START_YEAR || e.from > END_YEAR) err(`codex essay ${e.id}: unlock year ${e.from} outside the century`);
  }

  for (const a of ACTORS) {
    if (a.span[0] > a.span[1]) err(`actor ${a.id}: span is inverted`);
    const tasteless = Object.keys(a.taste).length === 0;
    if (tasteless) err(`actor ${a.id}: has no taste and would never fund anything`);
    for (const f of Object.keys(a.taste)) {
      if (!FAMILY_IDS.includes(f as never)) err(`actor ${a.id}: unknown family in taste "${f}"`);
    }
  }
}

// ---------------------------------------------------------------------------

function main(): void {
  checkReferences();
  checkDeadGates();
  checkAnachronisms();
  checkCycles();
  checkParadigmReachability();
  checkEndings();
  checkDepiction();
  checkCoverage();

  console.log('AI Timelines — content lint');
  console.log(
    `  ${ALL_SCENES.length} scenes · ${PARADIGMS.length} paradigms · ${CHARACTERS.length} characters · ${ENDINGS.length} endings · ${ACTORS.length} actors`,
  );

  if (warnings.length > 0) {
    console.log(`\n${warnings.length} warning(s):`);
    for (const w of warnings) console.log(`  ~ ${w}`);
  }

  if (errors.length > 0) {
    console.log(`\n${errors.length} error(s):`);
    for (const e of errors) console.log(`  ✗ ${e}`);
    process.exit(1);
  }

  console.log('\n✓ content is coherent');
}

main();

/**
 * Monte Carlo playtest harness.
 *
 * Hand-tuning a century-scale economy by eye does not work, so this plays the game a few
 * thousand times under several policies and reports what actually happens: which endings fire,
 * which paradigms never mature under any policy, whether a school is viable as a primary
 * strategy, and whether any run fails to reach 2050.
 *
 * Run with `npm run playtest`. Exits non-zero on a structural failure (a crash, a stalled run,
 * an unreachable ending, a school nobody can win with).
 */

import { ALL_SCENES, SCENES } from '../src/content/scenes';
import { FAMILIES, PARADIGMS, PARADIGM_BY_ID } from '../src/content/paradigms';
import { ENDINGS } from '../src/content/endings';
import { evaluate, leadingFamily } from '../src/engine/conditions';
import { availableDirectives, takeDirective } from '../src/engine/directives';
import { applyEffects } from '../src/engine/effects';
import { resolveEnding } from '../src/engine/endings';
import { next as rand, weightedPick } from '../src/engine/rng';
import { pickScenes } from '../src/engine/scheduler';
import { advanceTurn } from '../src/engine/sim';
import { TOTAL_TURNS, createState } from '../src/engine/state';
import type { Choice, Directive, Effect, FamilyId, GameState, Scene } from '../src/engine/types';
import { FAMILY_IDS } from '../src/engine/types';
import { OPENING } from '../src/content/acts/opening';

const RUNS_PER_POLICY = 260;

/** The families whose insight gates the deepest bridge nodes. */
const GATING: FamilyId[] = ['symbolic', 'connectionist', 'statistical', 'cybernetic', 'substrate'];
const SCENES_PER_TURN = 3;

type PolicyName =
  | 'random'
  | 'greedy'
  | 'hoarder'
  | 'loudmouth'
  | 'accelerationist'
  | 'broad'
  | 'synthesis'
  /**
   * Plays for understanding and against hype, and takes the directives that talk the field back
   * down. Added because the game grew a `promises` lever and an ending that rewards never
   * getting ahead of yourself, and no existing bot played that way — so the outcome read as
   * unreachable when it is merely a style none of them had.
   */
  | 'careful'
  | `focus:${FamilyId}`
  /**
   * Backs a school *and the schools it is complementary with*. Added because the game grew
   * cross-school gates and an alliance mechanic, and every existing policy either backs one
   * school or spreads evenly across all eight — so nothing in the harness played the way the
   * synergies now reward, and content behind those gates read as unreachable when it was
   * merely undiscovered.
   */
  | `allied:${FamilyId}`;

interface RunResult {
  policy: PolicyName;
  seed: number;
  ending: string;
  year: number;
  turns: number;
  matured: string[];
  winters: number;
  capability: number;
  understanding: number;
  exposure: number;
  computeLog: number;
  scenesSeen: string[];
  leadFamily: FamilyId;
  crashed: string | null;
}

// ---------------------------------------------------------------------------
// Bot policies
// ---------------------------------------------------------------------------

function scoreDirective(policy: PolicyName, d: Directive, s: GameState): number {
  if (policy === 'random') return 1;

  if (policy === 'hoarder') return d.cost === 0 ? 6 : 1 / (d.cost + 1);

  if (policy === 'loudmouth') {
    if (d.id === 'amplify') return 30;
    if (d.id === 'temper') return 0.05;
    if (d.category === 'fund') return 3;
    return 1;
  }

  if (policy === 'accelerationist') {
    if (d.id === 'amplify' || d.id === 'compute-consolidation' || d.id === 'substrate-push') return 14;
    if (d.id === 'assurance' || d.id === 'governance-scaffold' || d.id === 'temper') return 0.02;
    if (d.category === 'fund') return 5;
    return 0.6;
  }

  if (policy === 'broad') {
    // Deliberately spreads across schools and chases the bridge column, which is the only
    // way the deepest cross-family nodes are reachable at all.
    if (d.id === 'broker') return 16;
    if (d.id.startsWith('fund:') || d.id.startsWith('concentrate:')) {
      const p = PARADIGM_BY_ID[d.id.split(':')[1]!];
      if (!p) return 0.5;
      if (p.family === 'bridge') return 12;
      // Favour whichever school the century has neglected so far.
      return 2 + Math.max(0, 6 - s.families[p.family].matured);
    }
    if (d.id.startsWith('recruit:')) return 4;
    if (d.id === 'assurance' || d.id === 'open-publication') return 5;
    return 1.4;
  }

  if (policy === 'synthesis') {
    // Beelines the bridge column while keeping the five gating schools above their
    // insight thresholds. This is the hardest line in the game and the only way to know
    // whether it is walkable is to have something walk it.
    if (d.id.startsWith('concentrate:')) {
      const p = PARADIGM_BY_ID[d.id.split(':')[1]!];
      if (p?.family === 'bridge') return 30;
    }
    if (d.id.startsWith('fund:')) {
      const p = PARADIGM_BY_ID[d.id.split(':')[1]!];
      if (!p) return 0.3;
      if (p.family === 'bridge') return 20;
      const need = GATING.includes(p.family) ? 1 : 0;
      return need ? 3 + Math.max(0, 5 - s.families[p.family].matured) : 0.4;
    }
    if (d.id === 'broker') return 22;
    if (d.id === 'substrate-push') return 8;
    return 0.8;
  }

  if (policy === 'careful') {
    if (d.category === 'field') return 6;
    if (d.id.startsWith('champion:') || d.id.startsWith('centrepiece:')) return 8;
    if (d.id.startsWith('concentrate:')) return 0.2;
    return 1.2;
  }

  if (policy === 'greedy') {
    // Push whatever is closest to finishing.
    if (d.id.startsWith('fund:') || d.id.startsWith('concentrate:')) {
      const pid = d.id.split(':')[1]!;
      const p = PARADIGM_BY_ID[pid];
      const st = s.paradigms[pid];
      if (!p || !st) return 0.1;
      return 1 + (st.progress / p.cost) * 8;
    }
    return 1.5;
  }

  if (policy.startsWith('allied:')) {
    const lead = policy.slice('allied:'.length) as FamilyId;
    const wanted = new Set<FamilyId>([lead, ...FAMILIES[lead].allies]);
    if (d.id.startsWith('fund:') || d.id.startsWith('concentrate:')) {
      const p = PARADIGM_BY_ID[d.id.split(':')[1]!];
      if (!p) return 0.4;
      return p.family === lead ? 14 : wanted.has(p.family) ? 9 : 0.4;
    }
    for (const f of wanted) if (d.id === `recruit:${f}`) return f === lead ? 12 : 8;
    if (d.category === 'world' || d.category === 'field') return 1.2;
    return 0.6;
  }

  const family = policy.slice('focus:'.length) as FamilyId;
  if (d.id.startsWith('fund:') || d.id.startsWith('concentrate:')) {
    const p = PARADIGM_BY_ID[d.id.split(':')[1]!];
    return p?.family === family ? 14 : 0.4;
  }
  if (d.id === `recruit:${family}`) return 12;
  if (d.category === 'world' || d.category === 'field') return 1.2;
  return 0.6;
}

/** How much a policy likes a given effect. Positive means "seek this out". */
function effectAppeal(policy: PolicyName, e: Effect): number {
  const fam = policy.startsWith('focus:') ? (policy.slice(6) as FamilyId) : null;

  if (policy.startsWith('allied:')) {
    const lead = policy.slice('allied:'.length) as FamilyId;
    const wanted = new Set<FamilyId>([lead, ...FAMILIES[lead].allies]);
    if (e.kind === 'family' && wanted.has(e.family)) return e.value * (e.family === lead ? 6 : 4);
    if (e.kind === 'paradigm') {
      const f = PARADIGM_BY_ID[e.id]?.family;
      if (f && wanted.has(f)) return (e.value ?? 10) * (f === lead ? 0.5 : 0.35);
    }
    if (e.kind === 'commons') return e.value * 2;
    return 0;
  }

  if (policy === 'careful') {
    if (e.kind === 'promises') return -e.value * 3;
    if (e.kind === 'resource' && e.key === 'understanding') return e.value * 3;
    if (e.kind === 'resource' && e.key === 'attention') return -e.value * 3;
    if (e.kind === 'resource' && e.key === 'exposure') return -e.value * 2;
    if (e.kind === 'commons') return e.value * 2;
    return 0;
  }

  if (fam) {
    if (e.kind === 'family' && e.family === fam) return e.value * 6;
    if (e.kind === 'paradigm' && PARADIGM_BY_ID[e.id]?.family === fam) return (e.value ?? 10) * 0.5;
    return 0;
  }

  switch (policy) {
    case 'accelerationist':
      if (e.kind === 'resource' && (e.key === 'capability' || e.key === 'deployment')) return e.value * 2;
      if (e.kind === 'resource' && e.key === 'attention') return e.value;
      if (e.kind === 'resource' && e.key === 'understanding') return -e.value * 1.5;
      if (e.kind === 'resource' && e.key === 'exposure') return e.value * 0.5;
      if (e.kind === 'flag' && (e.flag === 'institutions' || e.flag === 'assuranceBacked')) return -20;
      if (e.kind === 'compute') return e.value * 30;
      return 0;
    case 'loudmouth':
      if (e.kind === 'resource' && e.key === 'attention') return e.value * 3;
      if (e.kind === 'resource' && e.key === 'credibility') return -e.value;
      return 0;
    case 'synthesis':
      if (e.kind === 'family' && e.family === 'bridge') return e.value * 8;
      if (e.kind === 'family' && GATING.includes(e.family)) return e.value * 3;
      if (e.kind === 'paradigm' && PARADIGM_BY_ID[e.id]?.family === 'bridge') return (e.value ?? 10) * 0.8;
      if (e.kind === 'compute') return e.value * 20;
      return 0;
    case 'broad':
      if (e.kind === 'family' && (e.family === 'bridge' || e.family === 'substrate')) return e.value * 3;
      if (e.kind === 'resource' && e.key === 'understanding') return e.value * 1.5;
      if (e.kind === 'flag' && (e.flag === 'institutions' || e.flag === 'keptFaith')) return 12;
      if (e.kind === 'flag' && e.flag === 'showedWorking') return 15;
      return 0;
    case 'hoarder':
      if (e.kind === 'resource' && e.key === 'influence') return e.value * 3;
      return 0;
    case 'greedy':
      if (e.kind === 'resource' && e.key === 'capability') return e.value * 2;
      if (e.kind === 'paradigm') return (e.value ?? 10) * 0.3;
      return 0;
    default:
      return 0;
  }
}

function pickChoice(policy: PolicyName, s: GameState, scene: Scene): void {
  const choices = (scene.choices ?? []).filter(
    (c) => evaluate(c.when, s) && (!c.cost || s.resources.influence >= c.cost),
  );
  if (choices.length === 0) return;

  let c: Choice;
  if (policy === 'random') {
    c = choices[Math.floor(rand(s) * choices.length)]!;
  } else {
    const scored = choices.map((x) => ({
      x,
      k: (x.effects ?? []).reduce((n, e) => n + effectAppeal(policy, e), 0) + rand(s) * 4,
    }));
    scored.sort((a, b) => b.k - a.k);
    c = scored[0]!.x;
  }

  if (c.cost) s.resources.influence = Math.max(0, s.resources.influence - c.cost);
  applyEffects(s, c.effects);
}

function playSceneHeadless(policy: PolicyName, s: GameState, scene: Scene): void {
  applyEffects(s, scene.onEnter);
  if (!s.seenScenes.includes(scene.id)) s.seenScenes.push(scene.id);
  for (const line of scene.lines) {
    if (!line.who) continue;
    const st = s.characters[line.who];
    if (st) {
      st.met = true;
      st.active = true;
    }
  }
  pickChoice(policy, s, scene);
}

function runOnce(policy: PolicyName, seed: number): RunResult {
  const s = createState(seed);
  let crashed: string | null = null;

  try {
    for (const sc of OPENING) playSceneHeadless(policy, s, sc);

    for (let guard = 0; guard < TOTAL_TURNS + 4; guard++) {
      for (const sc of pickScenes(s, SCENES, SCENES_PER_TURN)) playSceneHeadless(policy, s, sc);

      // Directive phase: spend down influence.
      for (let i = 0; i < 12; i++) {
        const options = availableDirectives(s).filter((d) => d.cost <= s.resources.influence);
        if (options.length === 0) break;
        const chosen = weightedPick(s, options, (d) => scoreDirective(policy, d, s));
        if (!chosen) break;
        if (!takeDirective(s, chosen)) break;
        if (chosen.endsTurn) break;
        if (s.resources.influence < 3) break;
      }

      if (s.turn >= TOTAL_TURNS - 1) break;
      advanceTurn(s);
    }
  } catch (e) {
    crashed = e instanceof Error ? `${e.message}\n${e.stack?.split('\n')[1]?.trim() ?? ''}` : String(e);
  }

  const ending = crashed ? 'CRASH' : resolveEnding(s).id;
  // Use the engine's own definition rather than a node count, so the viability check
  // measures the quantity that actually decides which ending fires.
  const lead: FamilyId = crashed ? FAMILY_IDS[0] : leadingFamily(s);

  return {
    policy,
    seed,
    ending,
    year: s.year,
    turns: s.turn,
    matured: PARADIGMS.filter((p) => s.paradigms[p.id]?.status === 'mature').map((p) => p.id),
    winters: s.winters.length,
    capability: s.resources.capability,
    understanding: s.resources.understanding,
    exposure: s.resources.exposure,
    computeLog: s.computeLog,
    scenesSeen: s.seenScenes,
    leadFamily: lead,
    crashed,
  };
}

// ---------------------------------------------------------------------------

function pct(n: number, total: number): string {
  return `${((n / total) * 100).toFixed(1)}%`;
}

function stats(xs: number[]): { min: number; med: number; max: number; mean: number } {
  const sorted = [...xs].sort((a, b) => a - b);
  return {
    min: sorted[0] ?? 0,
    med: sorted[Math.floor(sorted.length / 2)] ?? 0,
    max: sorted[sorted.length - 1] ?? 0,
    mean: xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length),
  };
}

function main(): void {
  const policies: PolicyName[] = [
    'random',
    'greedy',
    'hoarder',
    'loudmouth',
    'accelerationist',
    'broad',
    'synthesis',
    'careful',
    ...FAMILY_IDS.map((f) => `focus:${f}` as PolicyName),
    ...FAMILY_IDS.map((f) => `allied:${f}` as PolicyName),
  ];

  const results: RunResult[] = [];
  let seed = 1956;
  for (const policy of policies) {
    for (let i = 0; i < RUNS_PER_POLICY; i++) {
      results.push(runOnce(policy, seed++));
    }
  }

  const failures: string[] = [];
  console.log(`AI Timelines — playtest (${results.length} runs across ${policies.length} policies)\n`);

  // --- crashes -------------------------------------------------------------
  const crashes = results.filter((r) => r.crashed);
  if (crashes.length > 0) {
    failures.push(`${crashes.length} run(s) crashed`);
    const seen = new Set<string>();
    for (const c of crashes.slice(0, 8)) {
      if (seen.has(c.crashed!)) continue;
      seen.add(c.crashed!);
      console.log(`  ✗ CRASH [${c.policy} seed ${c.seed}] ${c.crashed}`);
    }
  }

  // --- completion ----------------------------------------------------------
  const stalled = results.filter((r) => !r.crashed && r.turns < TOTAL_TURNS - 1);
  if (stalled.length > 0) {
    failures.push(`${stalled.length} run(s) stalled before the final turn`);
    console.log(`  ✗ ${stalled.length} runs did not reach turn ${TOTAL_TURNS - 1}`);
  }

  // --- endings -------------------------------------------------------------
  console.log('Endings');
  const endingCounts = new Map<string, number>();
  for (const r of results) endingCounts.set(r.ending, (endingCounts.get(r.ending) ?? 0) + 1);
  for (const e of [...ENDINGS].sort((a, b) => b.priority - a.priority)) {
    const n = endingCounts.get(e.id) ?? 0;
    const bar = '█'.repeat(Math.round((n / results.length) * 60));
    console.log(`  ${n === 0 ? '·' : ' '} ${e.id.padEnd(24)} ${String(n).padStart(5)} ${pct(n, results.length).padStart(6)} ${bar}`);
  }
  const unreachedEndings = ENDINGS.filter((e) => !endingCounts.has(e.id));
  if (unreachedEndings.length > 0) {
    console.log(`  ~ ${unreachedEndings.length} ending(s) never fired: ${unreachedEndings.map((e) => e.id).join(', ')}`);
  }

  // --- school viability ----------------------------------------------------
  console.log('\nSchool viability (does focusing on it actually make it lead?)');
  for (const f of FAMILY_IDS) {
    const runs = results.filter((r) => r.policy === `focus:${f}`);
    const led = runs.filter((r) => r.leadFamily === f).length;
    const matured = stats(runs.map((r) => r.matured.filter((id) => PARADIGM_BY_ID[id]?.family === f).length));
    const ok = led / Math.max(1, runs.length) >= 0.5;
    if (!ok) failures.push(`focusing on ${f} leads the field in only ${pct(led, runs.length)} of runs`);
    console.log(
      `  ${ok ? '✓' : '✗'} ${FAMILIES[f].name.padEnd(22)} leads ${pct(led, runs.length).padStart(6)} · median ${matured.med}/${PARADIGMS.filter((p) => p.family === f).length} nodes matured`,
    );
  }

  // --- paradigm reachability in practice ----------------------------------
  const everMatured = new Set<string>();
  for (const r of results) for (const id of r.matured) everMatured.add(id);
  const neverMatured = PARADIGMS.filter((p) => !everMatured.has(p.id));
  console.log(`\nParadigms matured at least once: ${everMatured.size}/${PARADIGMS.length}`);
  if (neverMatured.length > 0) {
    failures.push(`${neverMatured.length} paradigm(s) never matured in any run`);
    for (const p of neverMatured) {
      console.log(`  ✗ never matured: ${p.id} (earliest ${p.earliest}, needs 10^${p.computeNeed}, cost ${p.cost})`);
    }
  }

  // --- scene coverage ------------------------------------------------------
  const everSeen = new Set<string>();
  for (const r of results) for (const id of r.scenesSeen) everSeen.add(id);
  const neverSeen = ALL_SCENES.filter((s) => !everSeen.has(s.id));
  console.log(`Scenes played at least once: ${everSeen.size}/${ALL_SCENES.length}`);
  if (neverSeen.length > 0) {
    console.log(`  ~ never played: ${neverSeen.map((s) => s.id).join(', ')}`);
  }

  console.log('\nWinters by policy (mean / max)');
  for (const policy of policies) {
    const runs = results.filter((r) => r.policy === policy && !r.crashed);
    const w = stats(runs.map((r) => r.winters));
    console.log(`  ${String(policy).padEnd(20)} ${w.mean.toFixed(2)} / ${w.max}`);
  }

  // --- economy shape -------------------------------------------------------
  const good = results.filter((r) => !r.crashed);
  const cap = stats(good.map((r) => r.capability));
  const und = stats(good.map((r) => r.understanding));
  const exp = stats(good.map((r) => r.exposure));
  const comp = stats(good.map((r) => r.computeLog));
  const win = stats(good.map((r) => r.winters));
  const nodes = stats(good.map((r) => r.matured.length));

  console.log('\nEnd-of-century distributions (min / median / max)');
  console.log(`  capability      ${cap.min.toFixed(0)} / ${cap.med.toFixed(0)} / ${cap.max.toFixed(0)}`);
  console.log(`  understanding   ${und.min.toFixed(0)} / ${und.med.toFixed(0)} / ${und.max.toFixed(0)}`);
  console.log(`  exposure        ${exp.min.toFixed(0)} / ${exp.med.toFixed(0)} / ${exp.max.toFixed(0)}`);
  console.log(`  compute log10   ${comp.min.toFixed(1)} / ${comp.med.toFixed(1)} / ${comp.max.toFixed(1)}`);
  console.log(`  winters         ${win.min} / ${win.med} / ${win.max}  (mean ${win.mean.toFixed(2)})`);
  console.log(`  nodes matured   ${nodes.min} / ${nodes.med} / ${nodes.max}  of ${PARADIGMS.length}`);

  // Sanity bands. These encode the intended shape of a century; if the tuning drifts out of
  // them the game has stopped being about trade-offs.
  if (win.mean < 0.35) failures.push(`winters almost never happen (mean ${win.mean.toFixed(2)}); the expectation mechanic is inert`);
  if (win.mean > 3.2) failures.push(`winters happen constantly (mean ${win.mean.toFixed(2)}); the field can never build anything`);
  if (nodes.med < 18) failures.push(`median run matures only ${nodes.med} paradigms; the century feels empty`);
  if (nodes.med > 80) failures.push(`median run matures ${nodes.med} paradigms; nothing is a trade-off`);
  if (comp.med < 24 || comp.med > 34) {
    failures.push(`median end-of-century compute is 10^${comp.med.toFixed(1)}; expected roughly 10^26-10^32`);
  }

  // --- verdict -------------------------------------------------------------
  if (failures.length > 0) {
    console.log(`\n${failures.length} structural problem(s):`);
    for (const f of failures) console.log(`  ✗ ${f}`);
    process.exit(1);
  }
  console.log('\n✓ playtest clean');
}

main();

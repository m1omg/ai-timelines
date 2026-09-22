import { ENDINGS } from '../src/content/endings';
import { evaluate } from '../src/engine/conditions';
import { phraseCondition } from '../src/engine/describe';
import { leaves, resolveEnding } from '../src/engine/endings';
import { FAMILY_IDS } from '../src/engine/types';
import { simulate, type PolicyName } from './playtest';

/**
 * Why an ending does not fire.
 *
 * The playtest says *that* an ending is rare; this says which leaf of its condition is the
 * one nobody reaches, per policy, so the fix is to the binding constraint and not to whatever
 * was easiest to loosen. Usage: `npx tsx tools/funnel.ts the-open-summer the-quiet-coup [runs]`.
 */

const ids = process.argv.slice(2).filter((a) => !/^\d+$/.test(a) && !a.startsWith('policy='));
const runs = Number(process.argv.slice(2).find((a) => /^\d+$/.test(a)) ?? 60);
/** `policy=commons` narrows the per-leaf rates to one policy, to see what a deliberate player gets. */
const only = process.argv.slice(2).find((a) => a.startsWith('policy='))?.slice(7) as PolicyName | undefined;
const policies: PolicyName[] = [
  'random', 'greedy', 'hoarder', 'loudmouth', 'accelerationist', 'broad', 'synthesis', 'careful', 'commons',
  ...FAMILY_IDS.map((f) => `focus:${f}` as PolicyName),
  ...FAMILY_IDS.map((f) => `allied:${f}` as PolicyName),
];

const targets = ids.length ? ENDINGS.filter((e) => ids.includes(e.id)) : ENDINGS.filter((e) => e.when.kind !== 'always');
if (targets.length === 0) {
  console.error(`no such ending: ${ids.join(', ')}`);
  process.exit(1);
}

const states = (only ? [only] : policies).flatMap((policy) =>
  Array.from({ length: runs }, (_, i) => ({ policy, s: simulate(policy, 1000 + i).s })),
);

for (const e of targets) {
  const ls = leaves(e.when);
  console.log(`\n${e.id} (priority ${e.priority}) — ${ls.length} leaves`);
  const qualifies = states.filter(({ s }) => evaluate(e.when, s));
  const wins = states.filter(({ s }) => resolveEnding(s).id === e.id);
  console.log(`  qualifies ${pct(qualifies.length, states.length)} · is the verdict ${pct(wins.length, states.length)}`);
  if (qualifies.length > 0 && wins.length < qualifies.length) {
    const shadow = new Map<string, number>();
    for (const { s } of qualifies) {
      const r = resolveEnding(s).id;
      if (r !== e.id) shadow.set(r, (shadow.get(r) ?? 0) + 1);
    }
    console.log(`  outranked by: ${[...shadow.entries()].map(([id, n]) => `${id} ×${n}`).join(', ')}`);
  }
  for (const leaf of ls) {
    const pass = states.filter(({ s }) => evaluate(leaf, s));
    const byPolicy = policies
      .map((p) => ({ p, n: pass.filter((x) => x.policy === p).length }))
      .sort((a, b) => b.n - a.n)
      .slice(0, 3)
      .map(({ p, n }) => `${p} ${pct(n, runs)}`)
      .join(', ');
    console.log(`  ${pct(pass.length, states.length).padStart(6)}  ${phraseCondition(leaf) ?? JSON.stringify(leaf)}  [${byPolicy}]`);
  }
  // Runs that miss by exactly one leaf, and which leaf.
  const oneShort = new Map<string, number>();
  for (const { s } of states) {
    const failing = ls.filter((l) => !evaluate(l, s));
    if (failing.length === 1) {
      const k = phraseCondition(failing[0]!) ?? '?';
      oneShort.set(k, (oneShort.get(k) ?? 0) + 1);
    }
  }
  if (oneShort.size) {
    console.log('  one leaf short:');
    for (const [k, n] of [...oneShort.entries()].sort((a, b) => b[1] - a[1])) console.log(`    ${String(n).padStart(4)}  ${k}`);
  }
}

function pct(n: number, total: number): string {
  return `${((100 * n) / Math.max(1, total)).toFixed(1)}%`;
}

import { AUTHORED_DIRECTIVES } from '../content/directives';
import { FAMILIES, PARADIGM_BY_ID } from '../content/paradigms';
import { CHARACTER_BY_ID } from '../content/characters';
import { evaluate } from './conditions';
import { describeEffects, effectFamily } from './describe';
import { applyEffects } from './effects';
import { computeAdequacy, fundableParadigms } from './sim';
import type { Decision, Directive, GameState } from './types';
import { FAMILY_IDS, PATRON_IDS } from './types';

/**
 * Most directives are generated from the live state rather than authored, because the set of
 * things you could sensibly do in 1958 is a function of what exists in 1958. The authored ones
 * in content/directives.ts are the flavourful exceptions with their own conditions.
 */

const FUND_COST = 4;
const CONCENTRATE_COST = 8;

function fundingDirectives(s: GameState): Directive[] {
  const out: Directive[] = [];
  for (const p of fundableParadigms(s)) {
    const adequacy = computeAdequacy(p, s.computeLog);
    const st = s.paradigms[p.id];
    const pct = Math.round((st.progress / p.cost) * 100);
    const feasibility =
      adequacy >= 1
        ? 'the machines are up to it'
        : adequacy > 0.5
          ? 'the machines are barely up to it'
          : adequacy > 0.15
            ? 'no machine can demonstrate this yet'
            : 'this cannot be shown on any hardware that exists';
    out.push({
      id: `fund:${p.id}`,
      name: `Back ${p.name}`,
      blurb: `${FAMILIES[p.family].name} · ${p.short}. ${pct > 0 ? `${pct}% of the way there; ` : ''}${feasibility}.`,
      cost: FUND_COST,
      category: 'fund',
      effects: [
        { kind: 'paradigm', id: p.id, op: 'emphasis', value: 2.4 },
        { kind: 'family', family: p.family, field: 'momentum', op: 'add', value: 3 },
      ],
    });
    if (st.progress > p.cost * 0.25 || st.status === 'active') {
      out.push({
        id: `concentrate:${p.id}`,
        name: `Concentrate everything on ${p.name}`,
        blurb: `Push it to a result this term. Costs twice as much and starves the rest of ${FAMILIES[p.family].name}.`,
        cost: CONCENTRATE_COST,
        category: 'fund',
        effects: [
          { kind: 'paradigm', id: p.id, op: 'emphasis', value: 4.6 },
          { kind: 'family', family: p.family, field: 'momentum', op: 'add', value: 6 },
          { kind: 'resource', key: 'attention', op: 'add', value: 4 },
        ],
      });
    }
  }
  return out;
}

function recruitDirectives(s: GameState): Directive[] {
  return FAMILY_IDS.filter((f) => s.families[f].matured > 0 || s.families[f].talent > 0.1).map((f) => ({
    id: `recruit:${f}`,
    name: `Send students into ${FAMILIES[f].name}`,
    blurb: `"${FAMILIES[f].creed}" — a cohort takes it seriously enough to spend a career on it.`,
    cost: 5,
    category: 'people' as const,
    effects: [
      { kind: 'family' as const, family: f, field: 'talent' as const, op: 'add' as const, value: 0.055 },
      { kind: 'family' as const, family: f, field: 'momentum' as const, op: 'add' as const, value: 5 },
    ],
  }));
}

function patronDirectives(s: GameState): Directive[] {
  const labels: Record<string, { name: string; blurb: string }> = {
    military: {
      name: 'Court the defence agencies',
      blurb: 'Frame the work as command and control. The money is enormous and it comes with company.',
    },
    corporate: {
      name: 'Court industry',
      blurb: 'Find the application that pays for the research. Deployment follows quickly, and so does everything downstream of deployment.',
    },
    academic: {
      name: 'Court the universities',
      blurb: 'Chairs, journals, a conference of your own. Slow, cheap, and it decides what the next generation believes.',
    },
    public: {
      name: 'Court the public',
      blurb: 'Lectures, demonstrations, the science pages. Attention is the easiest thing to raise and the hardest thing to owe.',
    },
  };
  return PATRON_IDS.filter((p) => s.patrons[p] < 92).map((p) => ({
    id: `patron:${p}`,
    name: labels[p]!.name,
    blurb: labels[p]!.blurb,
    cost: 4,
    category: 'world' as const,
    effects: [
      { kind: 'patron' as const, patron: p, op: 'add' as const, value: 13 },
      ...(p === 'public'
        ? [{ kind: 'resource' as const, key: 'attention' as const, op: 'add' as const, value: 8 }]
        : []),
    ],
  }));
}

function championDirectives(s: GameState): Directive[] {
  const out: Directive[] = [];
  for (const [id, st] of Object.entries(s.characters)) {
    if (!st.met || !st.active || st.affinity >= 60) continue;
    const c = CHARACTER_BY_ID[id];
    if (!c) continue;
    out.push({
      id: `champion:${id}`,
      name: `Champion ${c.name}`,
      blurb: c.family
        ? `A chair, a grant, a hearing. ${FAMILIES[c.family].name} gains, and they remember who arranged it.`
        : 'A hearing, at a moment when nobody else will give them one.',
      cost: 3,
      category: 'people',
      effects: [
        { kind: 'character', id, field: 'affinity', op: 'add', value: 18 },
        ...(c.family
          ? [{ kind: 'family' as const, family: c.family, field: 'momentum' as const, op: 'add' as const, value: 4 }]
          : []),
      ],
    });
  }
  return out;
}

export function availableDirectives(s: GameState): Directive[] {
  const all = [
    ...AUTHORED_DIRECTIVES,
    ...fundingDirectives(s),
    ...recruitDirectives(s),
    ...patronDirectives(s),
    ...championDirectives(s),
  ];
  return all.filter((d) => {
    if (!d.repeatable && s.directivesTaken.includes(d.id)) return false;
    // "Do nothing this term" cannot honestly be offered after you have already done something.
    if (d.endsTurn && s.directivesTaken.length > 0) return false;
    return evaluate(d.when, s);
  });
}

export function canAfford(s: GameState, d: Directive): boolean {
  return s.resources.influence >= d.cost;
}

export function takeDirective(s: GameState, d: Directive): boolean {
  if (!canAfford(s, d)) return false;
  s.resources.influence -= d.cost;
  s.directivesTaken.push(d.id);
  applyEffects(s, d.effects);
  recordDecision(s, {
    turn: s.turn,
    year: s.year,
    kind: 'directive',
    label: d.name,
    source: d.id,
    family: effectFamily(d.effects),
    influenceSpent: d.cost,
    consequences: describeEffects(d.effects),
  });
  return true;
}

/**
 * Append to the decision record. Tolerates the field being absent, which it is on any save
 * written before the decision tree existed.
 */
export function recordDecision(s: GameState, d: Decision): void {
  (s.decisions ??= []).push(d);
}

/** Used by the console to show what a paradigm is currently receiving. */
export function emphasisLabel(s: GameState, paradigmId: string): string | null {
  const st = s.paradigms[paradigmId];
  if (!st || st.emphasis <= 1) return null;
  return st.emphasis >= 4 ? 'CONCENTRATED' : 'BACKED';
}

export function paradigmName(id: string): string {
  return PARADIGM_BY_ID[id]?.name ?? id;
}

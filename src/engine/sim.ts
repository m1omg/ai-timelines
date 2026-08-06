import { ACTORS } from '../content/actors';
import { FAMILIES, PARADIGMS, PARADIGM_BY_ID } from '../content/paradigms';
import { recordSnapshot } from './describe';
import { leadingFamily } from './conditions';
import { applyEffect, normaliseTalent } from './effects';
import { next as rand } from './rng';
import { INSIGHT_FROM_MATURITY, actOfTurn, yearOfTurn } from './state';
import type { FamilyId, GameState, Paradigm, WinterRecord } from './types';
import { FAMILY_IDS, PATRON_IDS } from './types';

// Tuning constants. Every one of these was moved at least once by tools/playtest.ts;
// see docs/BALANCE.md for what each knob does to the shape of a run.
const PROGRESS_BASE = 4.6;
const ACTOR_BUDGET = 2.1;
const EMPHASIS_SUPPORT = 2.2;
const IDLE_SUPPORT = 0.12;
const PROMISE_DECAY = 0.75;
const ATTENTION_DECAY = 0.82;
/*
 * How far promises may outrun delivery before the gap starts counting against you, and how many
 * consecutive turns of that it takes to break the funding.
 *
 * Lowered from 9. At 9 the median century had roughly one collapse in a hundred years, which
 * made a winter feel like bad luck rather than the standing risk of working in a field that
 * lives on expectation. The point of the rule is that it should be in the back of your mind
 * every time you talk the work up.
 */
const WINTER_STRAIN = 7;
const WINTER_STREAK = 2;

export interface TickReport {
  year: number;
  matured: string[];
  unlocked: string[];
  dormant: string[];
  winterStarted: WinterRecord | null;
  winterEnded: boolean;
  capabilityGain: number;
  computeGain: number;
  notes: string[];
}

/**
 * How well the frontier can actually demonstrate an idea. Below the requirement it degrades
 * fast — this is the mechanism by which a correct paradigm can be backed for thirty years and
 * look like a failure the whole time.
 */
export function computeAdequacy(p: Paradigm, computeLog: number): number {
  if (computeLog >= p.computeNeed) {
    return Math.min(1.15, 1 + (computeLog - p.computeNeed) * 0.03);
  }
  return Math.max(0, 1 - (p.computeNeed - computeLog) * 0.42);
}

/** Average patron support, on the same 0..100 scale as the individual patrons. */
export function fundingLevel(s: GameState): number {
  let total = 0;
  for (const p of PATRON_IDS) total += s.patrons[p];
  return total / PATRON_IDS.length;
}

export function prereqsMet(s: GameState, p: Paradigm): boolean {
  for (const id of p.prereqs) {
    if (s.paradigms[id]?.status !== 'mature') return false;
  }
  if (p.familyPrereqs) {
    for (const [f, need] of Object.entries(p.familyPrereqs)) {
      if (s.families[f as FamilyId].insight < (need as number)) return false;
    }
  }
  return true;
}

/** Everything a player could plausibly put weight behind this turn. */
export function fundableParadigms(s: GameState): Paradigm[] {
  return PARADIGMS.filter((p) => {
    const st = s.paradigms[p.id];
    return st.status === 'available' || st.status === 'active' || st.status === 'dormant';
  });
}

function refreshUnlocks(s: GameState, report: TickReport): void {
  for (const p of PARADIGMS) {
    const st = s.paradigms[p.id];
    if (st.status !== 'locked') continue;
    if (s.year < p.earliest) continue;
    if (!prereqsMet(s, p)) continue;
    st.status = 'available';
    report.unlocked.push(p.id);
  }
}

/**
 * Autonomous actors spend their weight whether or not the player engages. Each picks the
 * three available paradigms that best match its taste and splits its budget between them.
 */
function actorSupport(s: GameState): Record<string, number> {
  const support: Record<string, number> = {};
  const candidates = fundableParadigms(s);

  for (const def of ACTORS) {
    const st = s.actors[def.id];
    if (!st.active || st.weight <= 0) continue;

    const scored: { p: Paradigm; score: number }[] = [];
    for (const p of candidates) {
      const taste = def.taste[p.family] ?? 0;
      if (taste <= 0) continue;
      const adequacy = computeAdequacy(p, s.computeLog);
      if (adequacy < 0.15) continue;
      // Institutions chase what is fashionable and what is nearly finished.
      const nearness = s.paradigms[p.id].progress / p.cost;
      const fashion = 1 + s.families[p.family].momentum / 60;
      const score = taste * adequacy * (0.6 + nearness) * Math.max(0.2, fashion) * (0.75 + 0.5 * rand(s));
      scored.push({ p, score });
    }
    if (scored.length === 0) {
      st.focus = null;
      continue;
    }
    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, 3);
    const totalScore = top.reduce((n, x) => n + x.score, 0);
    const budget = st.weight * ACTOR_BUDGET;
    for (const x of top) {
      support[x.p.id] = (support[x.p.id] ?? 0) + (budget * x.score) / totalScore;
    }
    st.focus = top[0]!.p.id;
  }

  return support;
}

function advanceResearch(s: GameState, report: TickReport): number {
  const support = actorSupport(s);

  for (const p of PARADIGMS) {
    const st = s.paradigms[p.id];
    if (st.emphasis > 1 && (st.status === 'available' || st.status === 'active' || st.status === 'dormant')) {
      support[p.id] = (support[p.id] ?? 0) + (st.emphasis - 1) * EMPHASIS_SUPPORT;
    }
  }

  const funding = fundingLevel(s);
  const fundingFactor = Math.min(1.3, 0.35 + (0.85 * funding) / 60);
  let capabilityGain = 0;

  for (const p of PARADIGMS) {
    const st = s.paradigms[p.id];
    if (st.status === 'mature' || st.status === 'locked') continue;

    let sup = support[p.id] ?? 0;
    if (st.status === 'active' && sup === 0) sup = IDLE_SUPPORT;

    if (sup <= 0) {
      // Nobody is working on it. Dormant work rots slowly; available work simply waits.
      if (st.status === 'dormant') st.progress = Math.max(0, st.progress * 0.97);
      continue;
    }

    if (st.status !== 'active') st.status = 'active';

    const adequacy = computeAdequacy(p, s.computeLog);
    const talentFactor = s.families[p.family].talent * FAMILY_IDS.length;
    const insightFactor = 1 + s.families[p.family].insight / 340;
    const rate = PROGRESS_BASE * sup * talentFactor * adequacy * fundingFactor * insightFactor;
    st.progress += rate;

    if (st.progress >= p.cost) {
      st.status = 'mature';
      st.progress = p.cost;
      st.maturedYear = s.year;
      if (!st.driver) {
        st.driver = st.emphasis > 1 ? 'player' : (mostInterestedActor(s, p) ?? 'university-labs');
      }
      report.matured.push(p.id);

      const fam = s.families[p.family];
      fam.matured += 1;
      fam.insight += p.cost * INSIGHT_FROM_MATURITY;
      fam.momentum += 10;

      /*
       * General-purpose infrastructure pays everybody. The stored-program machine and the
       * integrated circuit were not entries in the argument about what a mind is; they are the
       * floor every school stands on, and a school that spent nothing on them still got them.
       * Paid as a commons so it lands hardest on whoever is furthest behind.
       */
      if (p.dividend) applyEffect(s, { kind: 'commons', value: p.dividend });

      const delivered = p.capability * Math.min(1.15, adequacy);
      s.resources.capability += delivered;
      capabilityGain += delivered;
      s.resources.understanding += p.understanding * 0.5;
      s.resources.attention = Math.min(100, s.resources.attention + p.hype * 0.5);
      s.promises += p.hype * p.brittleness;

      if (p.tags?.includes('governance')) s.resources.exposure = Math.max(0, s.resources.exposure - 8);
      if (p.tags?.includes('interpretable')) s.resources.understanding += 4;
    }
  }

  return capabilityGain;
}

function mostInterestedActor(s: GameState, p: Paradigm): string | null {
  let best: string | null = null;
  let bestScore = 0;
  for (const def of ACTORS) {
    const st = s.actors[def.id];
    if (!st.active) continue;
    const score = (def.taste[p.family] ?? 0) * st.weight;
    if (score > bestScore) {
      bestScore = score;
      best = def.id;
    }
  }
  return best;
}

function updateMomentumAndTalent(s: GameState, matured: string[]): void {
  const freshByFamily: Record<string, number> = {};
  for (const id of matured) {
    const f = PARADIGM_BY_ID[id]!.family;
    freshByFamily[f] = (freshByFamily[f] ?? 0) + 1;
  }

  const before: Record<string, number> = {};
  for (const f of FAMILY_IDS) before[f] = s.families[f].momentum;

  /*
   * Two graphs, pulling in opposite directions and not the inverse of each other.
   *
   * A rival in the ascendant costs you standing: it takes the hiring lines, the programme
   * committees and the funders' attention, and none of that is about whether either of you is
   * right. An ally in the ascendant lifts you, more weakly, because their results make your
   * problems easier — and separately feeds you insight, which is the part a change of fashion
   * cannot take away again.
   */
  const insightBefore: Record<string, number> = {};
  for (const f of FAMILY_IDS) insightBefore[f] = s.families[f].insight;

  for (const f of FAMILY_IDS) {
    const def = FAMILIES[f];
    let rivalPressure = 0;
    for (const r of def.rivals) rivalPressure += Math.max(0, before[r]!) * 0.25;
    let allyLift = 0;
    for (const a of def.allies) allyLift += Math.max(0, before[a]!) * 0.10;
    const fresh = freshByFamily[f] ?? 0;
    s.families[f].momentum = s.families[f].momentum * 0.65 + fresh * 9 - rivalPressure + allyLift;
    s.families[f].momentum = Math.max(-50, Math.min(100, s.families[f].momentum));

    /*
     * The insight side takes the *weakest* ally, not the sum. Complementary work pays for the
     * join, and a join is only as good as its thinnest side: neurosymbolic integration needs
     * both halves, and a century with world-class networks and no logic gets nothing from it.
     *
     * Summing was wrong in a way the linter could not see and the playtest could — one strong
     * neighbour was enough to float a school that had done nothing, which quietly made the
     * bridge column free and left the scene about a narrow century unable to fire at all.
     */
    if (def.allies.length > 0) {
      let weakest = Infinity;
      for (const a of def.allies) weakest = Math.min(weakest, insightBefore[a]!);
      s.families[f].insight += weakest * 0.022;
    }
  }

  // Researchers follow fashion, with a lag. The lag is what makes bandwagons and hangovers.
  const targets: number[] = [];
  let sum = 0;
  for (const f of FAMILY_IDS) {
    const st = s.families[f];
    const t = Math.exp((st.momentum + st.insight * 0.12) / 22);
    targets.push(t);
    sum += t;
  }
  FAMILY_IDS.forEach((f, i) => {
    const target = targets[i]! / sum;
    s.families[f].talent += (target - s.families[f].talent) * 0.3;
  });
  normaliseTalent(s);
}

function checkWinter(s: GameState, capabilityGain: number, report: TickReport): void {
  if (s.inWinter) {
    const rec = s.winters[s.winters.length - 1]!;
    const elapsed = s.year - rec.startYear;
    if (s.resources.credibility > 42 || elapsed >= 12) {
      s.inWinter = false;
      rec.endYear = s.year;
      report.winterEnded = true;
      report.notes.push('Funding is moving again. Nobody says the word "winter" out loud.');
    }
    return;
  }

  const delivered = capabilityGain * 1.6;
  const tolerance = 5 + s.resources.credibility * 0.1;
  const strain = s.promises - delivered - tolerance;

  if (strain > WINTER_STRAIN) {
    s.gapStreak += 1;
  } else {
    s.gapStreak = Math.max(0, s.gapStreak - 1);
  }

  if (s.gapStreak < WINTER_STREAK) return;

  // Blame lands on whichever school was loudest, not whichever was wrong.
  let blamed: FamilyId = FAMILY_IDS[0];
  let bestScore = -Infinity;
  for (const f of FAMILY_IDS) {
    const score = s.families[f].momentum + s.families[f].talent * 60;
    if (score > bestScore) {
      bestScore = score;
      blamed = f;
    }
  }

  const severity = Math.min(1, strain / 40);
  const rec: WinterRecord = { startYear: s.year, endYear: null, blamed, severity };
  s.winters.push(rec);
  s.inWinter = true;
  s.gapStreak = 0;
  report.winterStarted = rec;

  s.resources.credibility = Math.max(0, s.resources.credibility - (22 + severity * 18));
  s.resources.attention *= 0.3;
  s.promises *= 0.2;
  s.patrons.military *= 0.5;
  s.patrons.corporate *= 0.45;
  s.patrons.academic *= 0.75;
  s.patrons.public *= 0.5;

  for (const p of PARADIGMS) {
    if (p.family !== blamed) continue;
    const st = s.paradigms[p.id];
    if (st.status === 'active') {
      st.status = 'dormant';
      report.dormant.push(p.id);
    }
  }
  s.families[blamed].momentum = -35;
  s.families[blamed].talent *= 0.45;
  normaliseTalent(s);

  report.notes.push(
    `The money stops. ${FAMILIES[blamed].name} work is the first thing cancelled everywhere at once.`,
  );
}

function updateResources(s: GameState, capabilityGain: number): void {
  // The tick adds to capability and understanding directly, so it has to respect the same
  // ceilings applyEffect() enforces — otherwise the ending thresholds stop meaning anything.
  s.resources.capability = Math.min(400, s.resources.capability);
  s.resources.understanding = Math.min(300, s.resources.understanding);

  // Theory is not forgotten — but what this tracks is how much of the *current* frontier
  // the theory actually covers, and the frontier keeps moving. Left alone, a body of
  // understanding explains a steadily smaller fraction of what is being built, which is
  // why keeping this number up takes continuous investment rather than one good decade.
  s.resources.understanding *= 0.9;
  // Standing excitement is itself a debt: a field that stays loud owes more every year,
  // whether or not any single result over-promised. This is what makes `amplify` costly.
  s.promises += s.resources.attention * 0.05;
  s.resources.attention *= ATTENTION_DECAY;
  s.promises *= PROMISE_DECAY;

  const credTarget =
    36 +
    s.resources.capability * 0.14 +
    s.resources.understanding * 0.1 -
    s.resources.exposure * 0.22 +
    capabilityGain * 1.2;
  s.resources.credibility += (Math.max(0, Math.min(100, credTarget)) - s.resources.credibility) * 0.28;

  const deployTarget = Math.min(100, s.resources.capability * 0.55 * (0.3 + s.patrons.corporate / 70));
  s.resources.deployment += (deployTarget - s.resources.deployment) * 0.22;

  const opacity = 1 - Math.min(1, s.resources.understanding / Math.max(1, s.resources.capability));
  s.resources.exposure = Math.max(
    0,
    s.resources.exposure * 0.97 + s.resources.deployment * 0.045 * (0.4 + opacity),
  );

  const targets: Record<string, number> = {
    military: 40 + s.resources.capability * 0.13 - s.resources.exposure * 0.1,
    corporate: 4 + s.resources.deployment * 0.62 + s.resources.capability * 0.08,
    academic: 28 + s.resources.understanding * 0.24 + s.resources.credibility * 0.16,
    public: 4 + s.resources.deployment * 0.34 + s.resources.attention * 0.26 - s.resources.exposure * 0.42,
  };
  const rate = s.inWinter ? 0.12 : 0.28;
  for (const p of PATRON_IDS) {
    s.patrons[p] += (Math.max(0, Math.min(100, targets[p]!)) - s.patrons[p]) * rate;
    s.patrons[p] = Math.max(0, Math.min(100, s.patrons[p]));
  }

  s.resources.influence = Math.min(
    60,
    s.resources.influence + 8 + s.resources.credibility * 0.055 + s.turn * 0.16,
  );
}

function updateActors(s: GameState): void {
  for (const def of ACTORS) {
    const st = s.actors[def.id];
    const inSpan = s.year >= def.span[0] && s.year <= def.span[1];
    if (inSpan && !st.active) {
      st.active = true;
      st.weight = Math.max(st.weight, def.startWeight * 0.6);
    } else if (!inSpan && st.active) {
      st.active = false;
      st.weight = 0;
      st.focus = null;
    }
    if (!st.active) continue;

    // An institution grows when the schools it likes are doing well.
    let alignment = 0;
    let tasteTotal = 0;
    for (const [f, t] of Object.entries(def.taste)) {
      alignment += (t as number) * s.families[f as FamilyId].momentum;
      tasteTotal += t as number;
    }
    alignment = tasteTotal > 0 ? alignment / tasteTotal : 0;
    const target = Math.max(0.02, Math.min(0.45, def.startWeight * (1 + alignment / 55)));
    st.weight += (target - st.weight) * 0.25;
    if (s.inWinter) st.weight *= 0.85;
  }
}

/**
 * Advance the world by one turn (four years). Narrative scene selection happens outside this
 * function — the simulation does not know the story exists.
 */
export function advanceTurn(s: GameState): TickReport {
  s.turn += 1;
  s.year = yearOfTurn(s.turn);
  s.act = actOfTurn(s.turn);
  s.directivesTaken = [];

  const report: TickReport = {
    year: s.year,
    matured: [],
    unlocked: [],
    dormant: [],
    winterStarted: null,
    winterEnded: false,
    capabilityGain: 0,
    computeGain: 0,
    notes: [],
  };

  /*
   * The frontier is what a single leading experiment can command, not the world's total
   * silicon, and it moves for two independent reasons.
   *
   * The floor is Moore's law: transistors get cheaper on a schedule that has nothing to do
   * with anybody's theory of mind, and it lifts every school at once. Nothing a player does
   * stops it, which is why a century with no interest in scale still ends far above where it
   * started.
   *
   * On top of that sits concentration — how much of that cheap hardware anyone actually
   * assembles in one place, which depends entirely on what the leading school is trying to do.
   * A frontier training run and a theorem prover are not the same customer. This is where the
   * connectionist century pulls away, and it is the honest version of the thing the previous
   * comment here was trying to avoid: the LLM appetite for compute is not the yardstick for
   * everyone, but it is emphatically the yardstick for them.
   */
  const substrateBonus = s.families.substrate.matured * 0.020;
  const industryBonus = (s.patrons.corporate / 100) * 0.12;
  const moore = 0.58 + substrateBonus + industryBonus * 0.4;

  const appetite = FAMILIES[leadingFamily(s)].computeAppetite;
  const lateEraBonus = Math.max(0, (s.turn - 12) * 0.012);
  const concentration = (0.14 + lateEraBonus) * appetite + industryBonus * 0.6;

  const computeGain = Math.max(0.25, moore + concentration - (s.inWinter ? 0.14 : 0));
  s.computeLog += computeGain;
  report.computeGain = computeGain;

  updateActors(s);
  refreshUnlocks(s, report);

  const capabilityGain = advanceResearch(s, report);
  report.capabilityGain = capabilityGain;

  updateMomentumAndTalent(s, report.matured);
  updateResources(s, capabilityGain);
  checkWinter(s, capabilityGain, report);
  refreshUnlocks(s, report);

  // Emphasis is a per-turn instruction, not a standing order.
  for (const id of Object.keys(s.paradigms)) s.paradigms[id]!.emphasis = 1;

  for (const id of report.matured) {
    const p = PARADIGM_BY_ID[id]!;
    s.log.push({
      year: s.year,
      text: `${p.name} — ${p.short}.`,
      kind: 'breakthrough',
    });
  }
  if (report.winterStarted) {
    s.log.push({
      year: s.year,
      text: `Funding collapse. ${FAMILIES[report.winterStarted.blamed].name} takes the blame.`,
      kind: 'crisis',
    });
  }

  recordSnapshot(s);
  return report;
}

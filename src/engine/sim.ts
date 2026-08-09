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

/*
 * The two inter-school graphs, exported because the Balance panel shows the player what they are
 * currently worth and must not carry its own copy of the numbers. A display that drifts from the
 * rule it describes is worse than no display: it teaches the wrong model of the game.
 */
/** Momentum a school loses per point of an ascendant rival's momentum. */
export const RIVAL_PRESSURE = 0.25;
/** Momentum a school gains per point of an ascendant ally's momentum. Weaker than rivalry. */
export const ALLY_LIFT = 0.1;
/** Insight per turn from the *weakest* ally's insight — a join is only as good as its thin side. */
export const ALLY_INSIGHT = 0.022;

/*
 * The compute frontier, in log10 FLOPs per turn (four years). These are the most sensitive
 * numbers in the file — see the header of advanceTurn's growth block for what each one means.
 *
 * Calibrated against the record rather than by eye. Frontier training compute tracked hardware
 * at roughly 1.3-1.5x a year until the early 2010s, then ran at something like 4-5x a year for
 * over a decade once the field started buying scale rather than waiting for it. Those are two
 * different mechanisms and the model now has both.
 */
/**
 * The floor: the largest machine a single experiment can command, absent any AI boom.
 *
 * Not per-chip Moore, which is slower. What this tracks is the biggest assembled machine — the
 * Top500 kind of number, bought for weather, physics and genomics by people with no opinion
 * about minds at all. No school and no winter stops it.
 *
 * It decays, because it did. That curve ran at roughly 2x a year through the nineties and
 * flattened towards 1.3x as Dennard scaling ended and the easy parallelism was spent. Holding it
 * constant across a century was the other unrealistic thing here: compounded over twenty-five
 * turns a flat floor put a century that never trained anything at 10^32.
 */
const MOORE_EARLY = 0.68;
const MOORE_LATE = 0.4;
const MOORE_DECAY = 0.014;
/** Scale-up per turn at full appetite and full funding, once scale has been demonstrated. */
const SCALEUP_RATE = 1.15;
/** Concentration available before anyone has shown that scale pays. Deliberately small. */
const PRE_BOOM_RATE = 0.16;
/** Any of these maturing is a century showing that assembled scale pays. */
const SCALE_DEMONSTRATIONS = ['gpu-scale', 'massively-parallel', 'gpu-general-compute'];
/** Where power and capital start to bite, in log10 FLOPs. */
const POWER_WALL_FROM = 24;
/** Drag at one order of magnitude past the wall, before substrate relief. */
const POWER_WALL_RATE = 0.15;
/**
 * How the drag grows with each further order of magnitude. Above 1 it is superlinear, which is
 * what makes the wall a wall.
 *
 * It used to be exactly 1 — drag proportional to the excess — and that is not a wall, it is a
 * headwind. Growth stayed roughly constant per turn while the drag rose in step behind it, so
 * the two never met: a substrate century finished at 10^39.8 against 10^27 for everyone else,
 * and the harness's own band recorded a run at 10^43.9. That is 10^13 times the largest machine
 * anybody else built, from one school's advantage, and past any bound physics would recognise.
 * Superlinear drag means there is always a frontier at which the next order of magnitude costs
 * more than the century can pay, which is the thing being modelled.
 */
const POWER_WALL_CURVE = 1.7;
/**
 * The most, in orders of magnitude, that substrate work can push the wall back.
 *
 * Relief was unbounded and grew with every node and every point of insight, so the school that
 * moves the wall could eventually move it further than the wall ever advanced. Cheaper
 * operations are a real and large effect and they are not a repeal: approached asymptotically,
 * so early substrate work buys nearly all of its face value and the twentieth node buys very
 * little.
 */
const POWER_WALL_RELIEF_MAX = 5;

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
    for (const r of def.rivals) rivalPressure += Math.max(0, before[r]!) * RIVAL_PRESSURE;
    let allyLift = 0;
    for (const a of def.allies) allyLift += Math.max(0, before[a]!) * ALLY_LIFT;
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
      s.families[f].insight += weakest * ALLY_INSIGHT;
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
   * On top of that sits scale-up — how much of that cheap hardware anyone actually assembles in
   * one place, which depends on what the leading school is trying to do and on who is paying.
   * A frontier training run and a theorem prover are not the same customer.
   *
   * Scale-up has two regimes, because the record does. Until somebody demonstrates that buying
   * more of it pays, the frontier tracks the hardware and very little else; a lab does not
   * spend a national research budget on a single run to prove a point nobody has proved. Once
   * it has been shown — `gpu-scale` maturing is that demonstration — the money arrives and the
   * frontier detaches from Moore entirely. That is the difference between ~1.4x a year before
   * the early 2010s and ~4x a year after it, and modelling both as one smooth curve was the
   * single least true thing in this function.
   *
   * Against that runs the wall. A frontier run eventually needs its own generating capacity,
   * and past that point every further order of magnitude costs disproportionately more in power
   * and capital. Substrate work is the only thing that moves the wall, which is what that school
   * is *for* — it is the difference between a century that stalls at its own power budget and
   * one that keeps going because it made the operations cheaper.
   */
  const substrateBonus = s.families.substrate.matured * 0.020;
  const industryBonus = (s.patrons.corporate / 100) * 0.12;
  // Decelerating, and never below the late-century floor.
  const mooreNow = Math.max(MOORE_LATE, MOORE_EARLY - s.turn * MOORE_DECAY);
  const moore = mooreNow + substrateBonus + industryBonus * 0.4;

  const appetite = FAMILIES[leadingFamily(s)].computeAppetite;
  const lateEraBonus = Math.max(0, (s.turn - 12) * 0.012);
  // Scale is bought, so it is bounded by who is paying. Industry buys the most of it; defence
  // buys a great deal and asks for delivery sooner.
  const money = (s.patrons.corporate * 0.65 + s.patrons.military * 0.35) / 100;
  /*
   * Has this century demonstrated that assembling hardware in one place pays?
   *
   * Keyed on gpu-scale alone this was a connectionist question, so no other school could ever
   * have a boom and the floor had to be inflated to compensate — which put a century that never
   * trained anything at 10^32. Massively parallel machines and general-purpose accelerators are
   * the same demonstration made by the substrate school, and a century that built either has
   * every bit as much right to the money that follows.
   */
  const scaleProven = SCALE_DEMONSTRATIONS.some((id) => s.paradigms[id]?.status === 'mature');
  const scaleUp = scaleProven
    ? appetite * money * (SCALEUP_RATE + lateEraBonus) * (s.inWinter ? 0.15 : 1)
    : appetite * (PRE_BOOM_RATE + lateEraBonus) + industryBonus * 0.8;

  /*
   * Power and capital. Substrate insight is the relief, and it is the only relief — but it is
   * bounded, and the drag past the wall is superlinear, so every century has a frontier it
   * cannot afford. Which frontier is the substrate school's whole contribution.
   */
  const reliefRaw = s.families.substrate.insight * 0.02 + s.families.substrate.matured * 0.3;
  const relief = POWER_WALL_RELIEF_MAX * (1 - Math.exp(-reliefRaw / POWER_WALL_RELIEF_MAX));
  const excess = Math.max(0, s.computeLog - POWER_WALL_FROM - relief);
  const wall = POWER_WALL_RATE * Math.pow(excess, POWER_WALL_CURVE);

  const computeGain = Math.max(0.18, moore + scaleUp - wall - (s.inWinter ? 0.14 : 0));
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

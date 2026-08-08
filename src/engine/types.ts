/**
 * Core type vocabulary for AI Timelines.
 *
 * Two rules govern this file:
 *
 *  1. Content is authored as typed TypeScript, never as loose JSON, so the compiler
 *     catches a misspelled paradigm id or an unknown flag before the game ever runs.
 *  2. Conditions and effects are *declarative data*, not predicate functions. That costs
 *     a little expressiveness and buys static analysability: tools/lint-content.ts walks
 *     the same trees the engine evaluates, which is what makes the coherence checks
 *     (dead gates, unreachable scenes, unsatisfiable endings) possible at all.
 */

// ---------------------------------------------------------------------------
// Paradigms
// ---------------------------------------------------------------------------

export const FAMILY_IDS = [
  'symbolic',
  'connectionist',
  'statistical',
  'evolutionary',
  'collective',
  'cybernetic',
  'substrate',
  'bridge',
] as const;

export type FamilyId = (typeof FAMILY_IDS)[number];

export interface FamilyDef {
  id: FamilyId;
  name: string;
  /** The one-sentence thesis of the school, in its own voice. */
  creed: string;
  /** Hue used everywhere this family is drawn: tree, charts, scene accents. */
  hue: number;
  /** Families whose dominance actively costs this one talent and standing. */
  rivals: FamilyId[];
  /**
   * Families this one is genuinely complementary with — where each school's results make the
   * other's work easier rather than harder.
   *
   * Deliberately not the inverse of `rivals`, and a pair may be both. Connectionism and the
   * statistical school spent the 2000s fighting over hiring lines and programme committees
   * while sharing their entire mathematical basis: a language model is trained by minimising
   * cross-entropy, which is Shannon's quantity, against an objective Shannon posed in 1951.
   * Rivalry moves momentum, which is fashion. Alliance moves insight, which is not.
   */
  allies: FamilyId[];
  /**
   * How much compute this school wants when it holds the field, as a multiplier. Hardware
   * improves on its own schedule; this is how much of it anyone bothers to assemble in one
   * place, which is a property of what the leading school is trying to do. A frontier training
   * run and a theorem prover are not the same customer.
   */
  computeAppetite: number;
}

export type ParadigmStatus =
  /** Prerequisites or era not yet met; invisible on the tree. */
  | 'locked'
  /** Could be worked on. Nobody is. */
  | 'available'
  /** Under active development by someone (player or an autonomous actor). */
  | 'active'
  /** Delivered. Contributes capability and understanding from here on. */
  | 'mature'
  /** Was active, lost its people. Keeps its progress, decays slowly, can revive. */
  | 'dormant';

export interface Paradigm {
  id: string;
  family: FamilyId;
  name: string;
  /** Shown on the tree node — must fit in roughly forty characters. */
  short: string;
  /** No amount of funding surfaces this before its year. Ideas have prerequisites in time. */
  earliest: number;
  /** Paradigm ids that must be `mature` before this becomes available. */
  prereqs: string[];
  /** Requires maturity in *all* these families at the given insight level. */
  familyPrereqs?: Partial<Record<FamilyId, number>>;
  /** Research-points needed to mature. Roughly: bigger idea, bigger number. */
  cost: number;
  /** log10 FLOPS at which this idea can actually be demonstrated. */
  computeNeed: number;
  /** Capability delivered once mature, before compute and synergy multipliers. */
  capability: number;
  /** How much genuine theoretical grip it confers. Some powerful ideas confer none. */
  understanding: number;
  /** Excitement generated on maturing. High hype with low capability is how winters start. */
  hype: number;
  /** How badly it over-promises: scales the expectation gap it opens. 0..1 */
  brittleness: number;
  /** Historical anchor. `who` may be empty for post-2026 speculative nodes. */
  anchor: { year: number; who: string };
  /** Codex entry: what the idea actually is, and why it did or did not win. */
  codex: string;
  /**
   * Insight this pays to the whole field on maturing, over and above its own school's share.
   * Reserved for genuinely general-purpose infrastructure: a stored-program machine or an
   * integrated circuit is not a programme competing with the others, it is the floor all of
   * them stand on, and it should lift the schools that were not funding it.
   */
  dividend?: number;
  /** Free-form markers used by scenes and endings, e.g. 'hardware', 'agentic'. */
  tags?: string[];
}

// ---------------------------------------------------------------------------
// Resources
// ---------------------------------------------------------------------------

export const PATRON_IDS = ['military', 'corporate', 'academic', 'public'] as const;
export type PatronId = (typeof PATRON_IDS)[number];

export const RESOURCE_KEYS = [
  /** Spent on directives each turn. The player's only real currency. */
  'influence',
  /** How much the field has delivered. Drives everything downstream. */
  'capability',
  /** Theory, interpretability, knowing *why* it works. Decoupled from capability on purpose. */
  'understanding',
  /** Public and institutional excitement. Cheap to raise, expensive to owe. */
  'attention',
  /** The field's standing with the people holding the chequebooks. */
  'credibility',
  /** How far the technology has actually spread into the world. */
  'deployment',
  /** Accumulated unaddressed consequence. Mostly hidden from the player. */
  'exposure',
] as const;

export type ResourceKey = (typeof RESOURCE_KEYS)[number];

export type Resources = Record<ResourceKey, number>;

export interface FamilyState {
  /** Accumulated understanding *of this school's own methods*. Never decays to zero. */
  insight: number;
  /** Share of the world's researchers, 0..1 across all families. */
  talent: number;
  /** Short-horizon fashion. Drives talent migration with a lag. */
  momentum: number;
  /** Count of matured nodes, cached for conditions and endings. */
  matured: number;
}

export interface ParadigmState {
  status: ParadigmStatus;
  /** 0..cost */
  progress: number;
  /** Year it matured, or null. */
  maturedYear: number | null;
  /** Who drove it: 'player' or an actor id. Used by the endings. */
  driver: string | null;
  /** Player-applied multiplier on progress rate. 1 = neutral. */
  emphasis: number;
}

export interface ActorState {
  /** 0..1, how much of the world's research budget this actor commands. */
  weight: number;
  /** How the actor feels about the player's programme, -1..1. */
  stance: number;
  active: boolean;
  /** Paradigm currently being pushed, for display. */
  focus: string | null;
}

export interface CharacterState {
  /** -100..100. Backing someone's work early is remembered for decades. */
  affinity: number;
  /** Has appeared on screen at least once. */
  met: boolean;
  /** Still part of the story this turn. */
  active: boolean;
}

// ---------------------------------------------------------------------------
// Game state
// ---------------------------------------------------------------------------

export type FlagValue = number | boolean | string;

export interface WinterRecord {
  startYear: number;
  endYear: number | null;
  /** Which family took the blame. */
  blamed: FamilyId;
  severity: number;
}

export interface LogEntry {
  year: number;
  text: string;
  kind: 'event' | 'breakthrough' | 'crisis' | 'choice' | 'system';
}

export interface GameState {
  version: number;
  seed: number;
  /** Mutable PRNG cursor; saving and restoring this makes runs reproducible. */
  rng: number;

  year: number;
  turn: number;
  act: number;

  resources: Resources;
  patrons: Record<PatronId, number>;
  /** log10 of the frontier's usable FLOPS. Grows on its own; substrate work bends the curve. */
  computeLog: number;

  families: Record<FamilyId, FamilyState>;
  paradigms: Record<string, ParadigmState>;
  actors: Record<string, ActorState>;
  characters: Record<string, CharacterState>;

  flags: Record<string, FlagValue>;
  seenScenes: string[];
  log: LogEntry[];

  winters: WinterRecord[];
  /**
   * Outstanding excitement not yet backed by delivery. Rises when hyped, brittle paradigms
   * mature or when the player talks the field up; decays on its own. The winter rule reads
   * this against the capability actually shipped, which is why winters are emergent here
   * rather than scripted.
   */
  promises: number;
  /** Consecutive turns the expectation gap has been open. */
  gapStreak: number;
  /** Set while a winter is in progress. */
  inWinter: boolean;

  /** Directives already taken this turn, by id. */
  directivesTaken: string[];
  /** Set once an ending has been reached. */
  ending: string | null;

  /**
   * One row per completed turn, for the balance-of-power chart. Kept in the save because a
   * chart that starts blank every time you reload is not a record of anything. Optional so
   * that saves written before it existed still load; `migrate` backfills an empty array.
   */
  history?: TurnSnapshot[];
  /**
   * Every choice and every directive the player has taken, with what it did. This is the raw
   * material for the decision tree, and the reason it is stored rather than recomputed: the
   * effect of a decision depends on the state it landed in, which is gone by the time you
   * look at it. Optional for the same save-compatibility reason as `history`.
   */
  decisions?: Decision[];
}

/** A reading of where the field stood at the end of one turn. */
export interface TurnSnapshot {
  turn: number;
  year: number;
  /** Each school's share of the field's standing, 0–1, summing to 1. */
  shares: Record<FamilyId, number>;
  /** Who was paying, 0–100 each. Optional: snapshots written before it was recorded lack it. */
  patrons?: Record<PatronId, number>;
  capability: number;
  understanding: number;
  computeLog: number;
  inWinter: boolean;
}

export interface Decision {
  turn: number;
  year: number;
  /** A line in a scene, or a card on the directive board. */
  kind: 'choice' | 'directive';
  /** What the player clicked. */
  label: string;
  /** Scene id or directive id, for grouping. */
  source: string;
  /** The school this decision favoured, where it favoured one. */
  family?: FamilyId;
  influenceSpent: number;
  /** What it did, already in words — see engine/describe.ts. */
  consequences: string[];
}

// ---------------------------------------------------------------------------
// Conditions — declarative so they can be both evaluated and analysed
// ---------------------------------------------------------------------------

export type CmpOp = '<' | '<=' | '==' | '!=' | '>=' | '>';

export type Condition =
  | { kind: 'always' }
  | { kind: 'year'; min?: number; max?: number }
  | { kind: 'act'; is: number }
  | { kind: 'turn'; min?: number; max?: number }
  | { kind: 'flag'; flag: string; op: CmpOp; value: FlagValue }
  | { kind: 'flagSet'; flag: string }
  | { kind: 'resource'; key: ResourceKey; op: CmpOp; value: number }
  /**
   * One resource measured against another. The endings care whether understanding kept
   * *pace* with capability, which an absolute threshold cannot express: 60 understanding is
   * excellent beside 90 capability and negligible beside 300.
   */
  | { kind: 'ratio'; num: ResourceKey; den: ResourceKey; op: CmpOp; value: number }
  | { kind: 'patron'; patron: PatronId; op: CmpOp; value: number }
  | { kind: 'compute'; op: CmpOp; value: number }
  /**
   * The two stored quantities the winter rule reads. `promises` is outstanding excitement not
   * yet backed by delivery; `gapStreak` is how many consecutive turns that gap has been open.
   *
   * Exposed as a condition so the historical funding reviews can be gated on the field actually
   * having over-promised, rather than on the calendar. A review that happens in a century which
   * delivered is not a review, it is scenery.
   */
  | { kind: 'strain'; field: 'promises' | 'gapStreak'; op: CmpOp; value: number }
  | { kind: 'paradigm'; id: string; status?: ParadigmStatus | ParadigmStatus[]; minProgress?: number }
  | { kind: 'family'; family: FamilyId; field: keyof FamilyState; op: CmpOp; value: number }
  | { kind: 'leadFamily'; family: FamilyId }
  | { kind: 'character'; id: string; field: 'affinity'; op: CmpOp; value: number }
  | { kind: 'characterMet'; id: string }
  | { kind: 'actor'; id: string; field: 'weight' | 'stance'; op: CmpOp; value: number }
  | { kind: 'seen'; scene: string }
  | { kind: 'inWinter'; is: boolean }
  | { kind: 'winterCount'; op: CmpOp; value: number }
  | { kind: 'not'; c: Condition }
  | { kind: 'all'; cs: Condition[] }
  | { kind: 'any'; cs: Condition[] };

// ---------------------------------------------------------------------------
// Effects
// ---------------------------------------------------------------------------

export type Effect =
  | { kind: 'flag'; flag: string; op: 'set' | 'add'; value: FlagValue }
  | { kind: 'resource'; key: ResourceKey; op: 'add' | 'mul' | 'set'; value: number }
  | { kind: 'patron'; patron: PatronId; op: 'add' | 'mul' | 'set'; value: number }
  | { kind: 'compute'; op: 'add' | 'mul'; value: number }
  | { kind: 'family'; family: FamilyId; field: 'insight' | 'momentum' | 'talent'; op: 'add' | 'mul'; value: number }
  | { kind: 'paradigm'; id: string; op: 'unlock' | 'progress' | 'mature' | 'emphasis' | 'dormant'; value?: number }
  | { kind: 'character'; id: string; field: 'affinity'; op: 'add' | 'set'; value: number }
  | { kind: 'characterActive'; id: string; value: boolean }
  | { kind: 'actor'; id: string; field: 'weight' | 'stance'; op: 'add' | 'set'; value: number }
  | { kind: 'log'; text: string; logKind?: LogEntry['kind'] }
  /**
   * Insight paid into the field as a whole rather than to one school, distributed *inversely*
   * to how much of the field each school already holds. This is what work that belongs to
   * nobody actually does: a result framed as a question rather than a programme is picked up
   * hardest where there is least going on. Mechanically it is the one counterweight to the
   * momentum → talent → maturity → momentum loop that otherwise makes a lead self-reinforcing.
   */
  | { kind: 'commons'; value: number }
  /**
   * Outstanding excitement not yet backed by delivery — the quantity the winter rule reads.
   * Content can only ever have moved it indirectly, by generating hype; this lets something
   * deliberately talk the field back down.
   */
  | { kind: 'promises'; op: 'add'; value: number }
  | { kind: 'ending'; id: string };

// ---------------------------------------------------------------------------
// Narrative
// ---------------------------------------------------------------------------

/** Procedural backdrop selectors. Every one is drawn in src/art/backdrops.ts. */
export type BackdropId =
  | 'void'
  | 'lab-valve'
  | 'lecture-hall'
  | 'machine-room'
  | 'workshop'
  | 'corridor'
  | 'committee'
  | 'terminal-room'
  | 'cleanroom'
  | 'server-floor'
  | 'city-night'
  | 'datacenter-vast'
  | 'observatory'
  | 'ruins'
  | 'garden'
  | 'archive';

export interface Line {
  /** Character id, or omitted for narration. */
  who?: string;
  text: string;
  /**
   * Show this line only when the run warrants it.
   *
   * Scenes make factual assertions about the state of the field — "no school is dominant",
   * "neural networks had been unfundable for fifteen years" — which are true of the historical
   * path and can be flatly false of the century the player actually built. Gating at the line
   * rather than duplicating whole scenes keeps one scene one beat, and lets the historical text
   * stay exactly as written for the run that earned it.
   *
   * A scene must never end up with no lines: give every conditional group an unconditional or
   * complementary fallback, which the linter checks.
   */
  when?: Condition;
  /** Overrides the scene backdrop from this line on. */
  backdrop?: BackdropId;
  /** Procedural sound cue id, see src/ui/audio.ts. */
  sfx?: string;
  /** Renders this line in the interface's own voice rather than as speech. */
  system?: boolean;
}

export interface Choice {
  text: string;
  /** Short parenthetical shown under the option — tone, not outcome. */
  hint?: string;
  when?: Condition;
  cost?: number;
  effects?: Effect[];
  goto?: string;
}

export interface Scene {
  id: string;
  /**
   * The act this scene belongs to, or `'any'` for a scene whose timing is a property of the
   * run rather than of the story's structure. An `'any'` scene must carry `years`, which then
   * does all the work the act would have done — including bounding the linter's anachronism
   * checks. Use it sparingly: a scene that could happen at any point usually means it has not
   * been decided what it is about.
   */
  act: number | 'any';
  /** Fires only in a turn whose year falls in this window. */
  years?: [number, number];
  /** Higher wins when several scenes are eligible in the same turn. */
  priority?: number;
  /** Default true. False means it can recur. */
  once?: boolean;
  when?: Condition;
  title?: string;
  backdrop?: BackdropId;
  lines: Line[];
  choices?: Choice[];
  /** Unconditional follow-on scene, played immediately. */
  next?: string;
  onEnter?: Effect[];
  /** Marks scenes the scheduler must play the moment they become eligible. */
  pinned?: boolean;
  /**
   * A scene reachable only by being named in another scene's `next` or a choice's `goto` — a
   * reply, not an episode. The scheduler never selects one, exactly as it never selects act 0.
   *
   * Without this a reply is schedulable on its own, and the answer to a question turns up in a
   * turn where nobody asked it. It is `linkOnly` rather than a condition because "is this
   * reachable from the story" is a structural fact, not a fact about game state — and the
   * linter checks the corresponding obligation, that something actually links here.
   */
  linkOnly?: boolean;
  tags?: string[];
}

export interface Character {
  id: string;
  name: string;
  /** How they are labelled in the dialogue box, if different from `name`. */
  title?: string;
  /** Real historical figure, composite, or wholly invented. Drives the depiction rules. */
  kind: 'historical' | 'composite' | 'fictional';
  family: FamilyId | null;
  /**
   * People change their minds, and the ones who changed them hardest are the ones this game is
   * most about. An entry here overrides `family` from `from` onward, so a figure's allegiance
   * moves with the record: Minsky built a forty-synapse learning machine in 1951, co-wrote the
   * book that bounded what one-layer networks could do in 1969, and proposed mind as a society
   * of mindless agents in 1986 — connectionist, symbolic and collective, in that order, and he
   * meant all three.
   *
   * Only for shifts that are documented in the person's own published work. `family` remains
   * the affiliation before the first entry.
   */
  affiliations?: { from: number; family: FamilyId | null }[];
  /**
   * The framing device rather than a person in the field. Narrators are met and active for the
   * whole century, which without this made the board offer to fund them a research chair.
   */
  narrator?: true;
  /** Years the character can appear on screen. */
  span: [number, number];
  /** Seeds the procedural portrait. */
  portraitSeed: number;
  /** Portrait styling hints. */
  look: {
    era: number;
    build?: 'slim' | 'broad' | 'round';
    hair?: 'short' | 'long' | 'bald' | 'wild' | 'tied';
    facial?: 'none' | 'beard' | 'moustache';
    glasses?: boolean;
    accent?: string;
  };
  /** One paragraph for the Codex. For historical figures, strictly documented material. */
  bio: string;
  /** Sources backing the depiction. Required for `historical`, enforced by the linter. */
  sources?: string[];
}

export interface Ending {
  id: string;
  name: string;
  /** Ordering when several endings qualify: most specific first. */
  priority: number;
  when: Condition;
  epigraph: string;
  lines: Line[];
  /** Shown in the post-game summary. */
  verdict: string;
}

export interface Directive {
  id: string;
  name: string;
  blurb: string;
  cost: number;
  when?: Condition;
  effects: Effect[];
  /** Repeatable within a single turn. Default false. */
  repeatable?: boolean;
  /**
   * Taking this ends the term immediately. Such a directive is only offered while nothing else
   * has been taken, so it stays a real commitment rather than a free bonus on top of a full
   * turn of spending.
   */
  endsTurn?: boolean;
  category: 'fund' | 'people' | 'field' | 'world';
}

export interface ActorDef {
  id: string;
  name: string;
  short: string;
  span: [number, number];
  /** Relative appetite per family, 0..1. Drives what they fund unprompted. */
  taste: Partial<Record<FamilyId, number>>;
  startWeight: number;
  blurb: string;
}

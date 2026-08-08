import type { Condition, FamilyId } from '../engine/types';

/**
 * What the field is actually being used for, in the century the player built.
 *
 * The tree says what has been proved. This says what it is doing on a Tuesday, which is a
 * different question and usually a duller answer — the schools that reached ordinary life
 * earliest are not the ones that won the argument, and the gap between the two lists is most of
 * what the game is about. Fuzzy control was in rice cookers and subway brakes for a decade while
 * the people who built it were losing every methodological argument they entered.
 *
 * Three rules the entries hold to:
 *
 *   1. **Gated on the paradigm actually maturing.** These are consequences, not scenery. A
 *      century that never proved convolution does not get medical imaging, and the linter checks
 *      that every `paradigm` here is a real id.
 *   2. **`from` is deployment, not invention.** It is when the thing reached people who had no
 *      idea what was inside it, which is often fifteen years after the paper.
 *   3. **Everything after 2026 is invented**, like the rest of the game past that line. Those
 *      entries are marked `projected` and the panel says so rather than implying a record.
 */
export interface Application {
  id: string;
  family: FamilyId;
  /** Must be mature for this to appear. */
  paradigm: string;
  /** Year it reaches ordinary life, which is not the year it was invented. */
  from: number;
  /** The use, in a few words. */
  what: string;
  /** Where it actually turns up. */
  where: string;
  /** Past the record: invented, and labelled as such. */
  projected?: boolean;
  /** Any further requirement — deployment reached, a rival school never having taken over. */
  when?: Condition;
}

export const APPLICATIONS: Application[] = [
  // --- Bridge & Hybrid. The school that reached ordinary life first and got least credit ------
  {
    id: 'app-fuzzy-consumer',
    family: 'bridge',
    paradigm: 'fuzzy-control',
    from: 1986,
    what: 'Consumer appliances that hold a setting without oscillating',
    where:
      'Rice cookers, washing machines that weigh their own load, camera autofocus, air conditioning, and a subway braking system smooth enough that standing passengers stopped noticing the stops.',
  },
  {
    id: 'app-neuro-fuzzy',
    family: 'bridge',
    paradigm: 'neuro-fuzzy',
    from: 1996,
    what: 'Controllers that tune their own rules',
    where: 'Industrial process control, lift scheduling, anti-lock braking.',
  },
  {
    id: 'app-world-models',
    family: 'bridge',
    paradigm: 'world-models',
    from: 2021,
    what: 'Machines rehearsed in simulation before they touch anything',
    where: 'Warehouse manipulation, surgical planning, driving policies trained on imagined roads.',
  },
  {
    id: 'app-neurosymbolic',
    family: 'bridge',
    paradigm: 'neurosymbolic',
    from: 2024,
    what: 'Systems that answer and show the derivation',
    where: 'Regulated decisions where "the model said so" is not an acceptable audit trail.',
  },

  // --- Symbolic --------------------------------------------------------------------------
  {
    id: 'app-expert-systems',
    family: 'symbolic',
    paradigm: 'expert-systems',
    from: 1980,
    what: 'Rule bases making decisions that used to need a specialist',
    where:
      'Configuring mainframe orders, credit approval, insurance underwriting, and diagnostic advice nobody was allowed to call diagnosis.',
  },
  {
    id: 'app-heuristic-search',
    family: 'symbolic',
    paradigm: 'heuristic-search',
    from: 1975,
    what: 'Route and schedule planning',
    where: 'Freight, airline crews, factory floors, and every journey planner since.',
  },
  {
    id: 'app-smt',
    family: 'symbolic',
    paradigm: 'smt',
    from: 2010,
    what: 'Proving a chip or a program cannot do a specific wrong thing',
    where: 'Silicon verification before tape-out, compiler correctness, security analysis at scale.',
  },
  {
    id: 'app-verified-systems',
    family: 'symbolic',
    paradigm: 'verified-systems',
    from: 2012,
    what: 'Kernels and compilers with machine-checked proofs',
    where: 'Avionics, medical devices, anything whose failure is a public inquiry.',
  },
  {
    id: 'app-knowledge-graphs',
    family: 'symbolic',
    paradigm: 'knowledge-graphs',
    from: 2013,
    what: 'Structured answers rather than a list of documents',
    where: 'Search result panels, product catalogues, clinical coding.',
  },

  // --- Connectionist ---------------------------------------------------------------------
  {
    id: 'app-convnet',
    family: 'connectionist',
    paradigm: 'convnet',
    from: 1996,
    what: 'Reading handwriting and, later, looking at photographs',
    where: 'Cheque clearing and postal sorting first; medical imaging triage two decades later.',
  },
  {
    id: 'app-gpu-scale',
    family: 'connectionist',
    paradigm: 'gpu-scale',
    from: 2013,
    what: 'Speech recognition that works for people with accents',
    where: 'Phone dictation, call routing, subtitles generated faster than a person could type them.',
  },
  {
    id: 'app-attention',
    family: 'connectionist',
    paradigm: 'attention',
    from: 2018,
    what: 'Translation good enough to read rather than to decode',
    where: 'Everything with a language pair, including pairs with almost no parallel text.',
  },
  {
    id: 'app-self-supervision',
    family: 'connectionist',
    paradigm: 'self-supervision',
    from: 2022,
    what: 'Text systems people talk to on purpose',
    where: 'Drafting, summarising, code completion, and a great deal of homework.',
  },

  // --- Statistical & Bayesian ------------------------------------------------------------
  {
    id: 'app-information-theory',
    family: 'statistical',
    paradigm: 'information-theory',
    from: 1958,
    what: 'Compression and error correction',
    where:
      'Modems, deep-space telemetry, optical discs, and eventually every file anyone ever sent. The most-used result in the century and nobody calls it artificial intelligence.',
  },
  {
    id: 'app-pattern-recognition',
    family: 'statistical',
    paradigm: 'statistical-pattern-recognition',
    from: 1965,
    what: 'Reading printed characters mechanically',
    where: 'Postcodes, cheques, utility bills, passport control.',
  },
  {
    id: 'app-em-latent',
    family: 'statistical',
    paradigm: 'em-latent',
    from: 1980,
    what: 'Speech systems trained on audio nobody transcribed by hand',
    where: 'Dictation, telephone menus, the first systems that worked at all over a phone line.',
  },
  {
    id: 'app-bayes-nets',
    family: 'statistical',
    paradigm: 'bayes-nets',
    from: 1992,
    what: 'Reasoning about causes when the evidence is incomplete',
    where: 'Fault diagnosis, spam filtering, clinical decision support, insurance pricing.',
  },
  {
    id: 'app-ensembles',
    family: 'statistical',
    paradigm: 'ensembles',
    from: 1999,
    what: 'Prediction on ordinary tabular data',
    where:
      'Credit risk, churn, fraud, demand forecasting. Quietly the most commercially valuable thing in the field for twenty years.',
  },
  {
    id: 'app-causal-inference',
    family: 'statistical',
    paradigm: 'causal-inference',
    from: 2006,
    what: 'Telling an effect from a correlation without running the experiment',
    where: 'Epidemiology, policy evaluation, trial design, advertising measurement.',
  },

  // --- Evolutionary ----------------------------------------------------------------------
  {
    id: 'app-genetic-algorithms',
    family: 'evolutionary',
    paradigm: 'genetic-algorithms',
    from: 1985,
    what: 'Search over designs nobody would have drawn',
    where: 'Timetabling, pipe networks, structural members, and a spacecraft antenna that looks like a bent paperclip and outperformed the hand-designed one.',
  },
  {
    id: 'app-evolvable-hardware',
    family: 'evolutionary',
    paradigm: 'evolvable-hardware',
    from: 2000,
    what: 'Circuits bred rather than specified',
    where: 'Analogue filters, antennas, fault-tolerant electronics for places nobody can visit.',
  },
  {
    id: 'app-neuroevolution',
    family: 'evolutionary',
    paradigm: 'neuroevolution',
    from: 2002,
    what: 'Behaviour for things that have to act without a training set',
    where: 'Game opponents, control policies, simulation agents.',
  },
  {
    id: 'app-quality-diversity',
    family: 'evolutionary',
    paradigm: 'quality-diversity',
    from: 2016,
    what: 'A repertoire of ways to do a thing, so a broken machine finds another',
    where: 'Walking robots that keep walking after losing a leg; design catalogues instead of a single optimum.',
  },

  // --- Collective & Swarm ----------------------------------------------------------------
  {
    id: 'app-market-mechanisms',
    family: 'collective',
    paradigm: 'market-mechanisms',
    from: 1997,
    what: 'Auctions clearing billions of times a day',
    where: 'Advertising, spectrum, electricity, cloud capacity.',
  },
  {
    id: 'app-ant-colony',
    family: 'collective',
    paradigm: 'ant-colony',
    from: 1998,
    what: 'Routing that reroutes itself',
    where: 'Telecoms networks, delivery fleets, port logistics.',
  },
  {
    id: 'app-human-computation',
    family: 'collective',
    paradigm: 'human-computation',
    from: 2007,
    what: 'Work split into pieces small enough to do while proving you are a person',
    where: 'Digitising old print, labelling images, moderating at a scale no employer could staff.',
  },
  {
    id: 'app-swarm-robotics',
    family: 'collective',
    paradigm: 'swarm-robotics',
    from: 2012,
    what: 'Many cheap machines instead of one expensive one',
    where: 'Warehouse floors, agricultural monitoring, inspection of things too large to scaffold.',
  },
  {
    id: 'app-federated',
    family: 'collective',
    paradigm: 'federated-learning',
    from: 2019,
    what: 'Learning from data that never leaves the device',
    where: 'Keyboard prediction, health monitoring, anywhere the data is too sensitive to collect.',
  },

  // --- Cybernetic & Embodied -------------------------------------------------------------
  {
    id: 'app-optimal-control',
    family: 'cybernetic',
    paradigm: 'optimal-control',
    from: 1965,
    what: 'Machines that hold a course without being told how',
    where: 'Autopilots, refinery control, guidance systems, lifts that arrive before you look up.',
  },
  {
    id: 'app-subsumption',
    family: 'cybernetic',
    paradigm: 'subsumption',
    from: 2002,
    what: 'Robots cheap enough to own, with no model of the room at all',
    where: 'Domestic floor cleaners, lawnmowers, and several million homes that would not describe themselves as owning a robot.',
  },
  {
    id: 'app-q-learning',
    family: 'cybernetic',
    paradigm: 'q-learning',
    from: 1998,
    what: 'Control policies learned from consequences rather than specified',
    where: 'Lift dispatch, traffic signals, inventory, later datacentre cooling.',
  },
  {
    id: 'app-deep-rl',
    family: 'cybernetic',
    paradigm: 'deep-rl',
    from: 2017,
    what: 'Learned control where the state is a camera rather than a number',
    where: 'Manipulation, plasma shaping, chip floorplanning, cooling plant.',
  },
  {
    id: 'app-developmental-robotics',
    family: 'cybernetic',
    paradigm: 'developmental-robotics',
    from: 2014,
    what: 'Machines that learn one particular building over years',
    where: 'Assistive robots in single households, care settings, and nowhere that needs them shipped identical.',
  },

  // --- Substrate. The floor everything else stands on -------------------------------------
  {
    id: 'app-integrated-circuits',
    family: 'substrate',
    paradigm: 'integrated-circuits',
    from: 1968,
    what: 'Computation cheap enough to put inside things that are not computers',
    where: 'Calculators, cars, tills, telephones, and every item on this list.',
  },
  {
    id: 'app-vlsi',
    family: 'substrate',
    paradigm: 'vlsi',
    from: 1983,
    what: 'A machine on a desk rather than in a building',
    where: 'Personal computers, controllers in appliances, the first hardware anyone owned privately.',
  },
  {
    id: 'app-massively-parallel',
    family: 'substrate',
    paradigm: 'massively-parallel',
    from: 1990,
    what: 'Problems solved by dividing them across thousands of processors',
    where: 'Weather, seismic survey, protein folding, nuclear stewardship — none of it about minds.',
  },
  {
    id: 'app-gpu-general',
    family: 'substrate',
    paradigm: 'gpu-general-compute',
    from: 2009,
    what: 'Graphics hardware doing arithmetic it was never sold for',
    where: 'Molecular dynamics, finance, climate models, and then everything the field did next.',
  },
  {
    id: 'app-neuromorphic',
    family: 'substrate',
    paradigm: 'neuromorphic-vlsi',
    from: 1998,
    what: 'Sensors that report change rather than frames',
    where: 'Cochlear processors, event cameras, always-on detection running on a coin cell.',
  },
  {
    id: 'app-photonic',
    family: 'substrate',
    paradigm: 'photonic-compute',
    from: 2024,
    what: 'Moving data between chips without heating the building',
    where: 'Interconnect in large machines, where the wires had become the limit.',
  },

  // --- Past the record. Invented, and labelled as such. ------------------------------------
  {
    id: 'app-embodied-general',
    family: 'cybernetic',
    paradigm: 'embodied-general',
    from: 2034,
    projected: true,
    what: 'Machines that have lived somewhere long enough to be missed',
    where: 'Households, care, small workshops. Not transferable, not copyable, and repaired rather than replaced.',
  },
  {
    id: 'app-continual-networks',
    family: 'connectionist',
    paradigm: 'continual-networks',
    from: 2032,
    projected: true,
    what: 'Systems that keep learning after deployment',
    where: 'Anything whose world moves faster than a release cycle — and every audit regime that assumed a frozen artefact.',
  },
  {
    id: 'app-institutional-alignment',
    family: 'collective',
    paradigm: 'institutional-alignment',
    from: 2036,
    projected: true,
    what: 'Governance with an architecture rather than a policy paper',
    where: 'Pooled compute commons, standards bodies with running code, disputes settled by protocol.',
  },
  {
    id: 'app-thermodynamic',
    family: 'substrate',
    paradigm: 'thermodynamic-compute',
    from: 2033,
    projected: true,
    what: 'Operations cheap enough that the power budget stops deciding',
    where: 'Frontier work outside the three organisations that could previously afford it.',
  },
  {
    id: 'app-verified-learning',
    family: 'bridge',
    paradigm: 'verified-learning',
    from: 2032,
    projected: true,
    what: 'Learned components with guarantees attached',
    where: 'Vehicles, clinical devices, infrastructure — wherever a statistical argument was never going to be enough.',
  },
  {
    id: 'app-automated-conjecture',
    family: 'symbolic',
    paradigm: 'automated-conjecture',
    from: 2042,
    projected: true,
    what: 'Machines proposing the question rather than checking the answer',
    where: 'Mathematics, materials, and an argument about authorship nobody has settled.',
  },
];

import { familyColour } from '../art/palette';
import { FAMILIES, PARADIGM_BY_ID } from '../content/paradigms';
import { leadingFamily } from '../engine/conditions';
import { familyShares, familyStanding } from '../engine/describe';
import { ALLY_INSIGHT, ALLY_LIFT, RIVAL_PRESSURE } from '../engine/sim';
import { END_YEAR, START_YEAR } from '../engine/state';
import type { Decision, FamilyId, GameState, TurnSnapshot } from '../engine/types';
import { FAMILY_IDS } from '../engine/types';
import { PATRONS } from './console';
import { currentEra } from './theme';
import { escapeHtml } from './vn';

type Tab = 'schools' | 'alliances' | 'decisions';

/**
 * Two views of the same question — who is winning, and what you did about it.
 *
 * Both read from state the engine records as it goes (`history`, `decisions`) rather than
 * recomputing from the present, because the effect of a decision depends on the state it landed
 * in, and that state is gone by the time anyone comes to look at it.
 */
export function renderBalance(root: HTMLElement, s: GameState, onClose: () => void): void {
  let tab: Tab = 'schools';
  const era = currentEra();
  const colour = (f: FamilyId) => familyColour(FAMILIES[f].hue, era);

  const draw = () => {
    root.innerHTML = `<div class="panel"><div class="wrap">
      <div style="display:flex;align-items:baseline;gap:14px">
        <h2>Balance</h2><span style="flex:1"></span><button id="bal-close">Close</button>
      </div>
      <div class="sub">${
        tab === 'schools'
          ? 'Standing is matured work first, then accumulated insight, share of the field and momentum. A school can hold the field for decades on insight alone and have nothing to show for it, which is most of what this chart is for.'
          : tab === 'alliances'
            ? 'Which schools make each other easier, and which take each other’s hiring lines. Two separate graphs — a pair can be on both, and the most consequential pair in the century is.'
            : 'Every choice and every directive you have taken, in order, with what each one did. Consequences that arrived later — an idea maturing, the money leaving — are attached to the term they landed in.'
      }</div>
      <div class="filterbar tabs">
        <button data-t="schools" class="${tab === 'schools' ? 'on' : ''}">Balance of power</button>
        <button data-t="alliances" class="${tab === 'alliances' ? 'on' : ''}">Alliances</button>
        <button data-t="decisions" class="${tab === 'decisions' ? 'on' : ''}">Decisions <span class="n">${(s.decisions ?? []).length}</span></button>
      </div>
      ${tab === 'schools' ? schoolsView() : tab === 'alliances' ? alliancesView() : decisionsView()}
      <div style="height:60px"></div>
    </div></div>`;

    root.querySelector('#bal-close')!.addEventListener('click', onClose);
    root.querySelectorAll<HTMLButtonElement>('[data-t]').forEach((b) =>
      b.addEventListener('click', () => {
        tab = b.dataset.t as Tab;
        draw();
      }),
    );
  };

  // ------------------------------------------------------------------ schools

  const schoolsView = (): string => {
    const history = (s.history ?? []).slice().sort((a, b) => a.turn - b.turn);
    const now = familyShares(s);
    const lead = leadingFamily(s);
    const ranked = FAMILY_IDS.slice().sort((a, b) => now[b] - now[a]);

    const bars = ranked
      .map((f) => {
        const st = s.families[f];
        const pct = now[f] * 100;
        return `<div class="standing" style="--fam:${colour(f)}">
          <span class="who">${escapeHtml(FAMILIES[f].name)}</span>
          <span class="track"><i style="width:${pct.toFixed(1)}%"></i></span>
          <span class="pct">${pct.toFixed(0)}%</span>
          <span class="breakdown">${st.matured} matured · insight ${Math.round(st.insight)} · ${(st.talent * 100).toFixed(0)}% of the field${
            st.momentum > 20 ? ' · ascendant' : st.momentum < -12 ? ' · out of favour' : ''
          }</span>
        </div>`;
      })
      .join('');

    const legend = ranked
      .map(
        (f) =>
          `<span class="key" style="--fam:${colour(f)}"><i></i>${escapeHtml(FAMILIES[f].name)}</span>`,
      )
      .join('');

    return `
      <div class="section-head">Who holds the field · ${s.year}</div>
      <p class="lede">The centre of gravity is <b style="color:${colour(lead)}">${escapeHtml(FAMILIES[lead].name)}</b>.</p>
      <div class="standings">${bars}</div>

      <div class="section-head">How that moved, 1950–${s.year}</div>
      ${
        history.length < 2
          ? `<p style="color:var(--dim)">${
              (s.history ?? []).length === 0
                ? 'Nothing recorded yet — this run predates the chart, so it starts from here.'
                : 'One reading so far. The shape appears once a few terms have passed.'
            }</p>`
          : `<div class="chart-wrap">${stackedAreaSvg(history, colour)}${axisHtml()}</div>
             <div class="legend">${legend}</div>
             <p class="chart-note">Each band is a school's share of the field. Shaded columns are the winters — note which school the money leaves and which one it does not come back to. The axis is the whole century, so the empty stretch on the right is how much of it you have left.</p>

             <div class="section-head">Who has been paying</div>
             <div class="chart-wrap">${patronSvg(history)}${axisHtml()}</div>
             <div class="legend">${PATRONS.map(
               (p, i) =>
                 `<span class="key patron-key p${i}"><i></i>${escapeHtml(p.label)} · ${Math.round(s.patrons[p.key])}</span>`,
             ).join('')}</div>
             <p class="chart-note">A winter takes all four down at once and they recover at different speeds — the universities barely flinch, industry is gone for a decade. Industry is the only one that speeds the hardware up, which is why a century funded entirely by defence money reaches 2050 with a slower machine.</p>

             <div class="section-head">What the field could do, and what it understood</div>
             <div class="chart-wrap">${capabilitySvg(history, era.accent)}${axisHtml()}</div>
             <div class="legend">
               <span class="key" style="--fam:${era.accent}"><i></i>capability — what has been built</span>
               <span class="key dashed"><i></i>understanding — how much of it anyone can explain</span>
             </div>
             <p class="chart-note">The gap between the two lines is where exposure comes from: consequence accumulating faster than the theory that would let anyone see it coming.</p>`
      }`;
  };

  // ---------------------------------------------------------------- alliances

  /**
   * The two graphs the tick applies every turn and the interface never showed.
   *
   * Every number here is recomputed from the live state with the tick's own exported
   * coefficients, so what the player reads is what the simulation is about to do — not a
   * restatement of the rule in prose, which would be free to drift away from it.
   *
   * The insight column is the interesting one. Allies pay from the *weakest* of them, so a
   * school with three allies and one neglected one is getting almost nothing, and naming that
   * bottleneck is the whole reason this view is worth a tab.
   */
  const alliancesView = (): string => {
    const rows = FAMILY_IDS.slice()
      .sort((a, b) => s.families[b].insight - s.families[a].insight)
      .map((f) => {
        const def = FAMILIES[f];

        const lift = def.allies.reduce(
          (n, a) => n + Math.max(0, s.families[a].momentum) * ALLY_LIFT,
          0,
        );
        const pressure = def.rivals.reduce(
          (n, r) => n + Math.max(0, s.families[r].momentum) * RIVAL_PRESSURE,
          0,
        );

        // The thin side of the join: whichever ally has the least insight to give.
        let weakest: FamilyId | null = null;
        for (const a of def.allies) {
          if (weakest === null || s.families[a].insight < s.families[weakest].insight) weakest = a;
        }
        const gain = weakest === null ? 0 : s.families[weakest].insight * ALLY_INSIGHT;

        const chip = (o: FamilyId, cls: string, note: string) =>
          `<span class="pact ${cls}" style="--fam:${colour(o)}" title="${escapeHtml(note)}">${escapeHtml(FAMILIES[o].name)}</span>`;

        const allies = def.allies.length
          ? def.allies
              .map((a) =>
                chip(
                  a,
                  a === weakest && def.allies.length > 1 ? 'ally thin' : 'ally',
                  a === weakest && def.allies.length > 1
                    ? `${FAMILIES[a].name} is the thinnest side of this join — the insight ${def.name} receives is set by this school alone.`
                    : `${FAMILIES[a].name} makes ${def.name}'s work easier.`,
                ),
              )
              .join('')
          : '<span class="pact none">stands alone</span>';

        const rivals = def.rivals.length
          ? def.rivals
              .map((r) =>
                chip(r, 'rival', `${FAMILIES[r].name} competes with ${def.name} for the field.`),
              )
              .join('')
          : '<span class="pact none">no rivals</span>';

        return `<div class="pactrow" style="--fam:${colour(f)}">
          <div class="pacthead">
            <span class="who">${escapeHtml(def.name)}</span>
            <span class="creed">${escapeHtml(def.creed)}</span>
          </div>
          <div class="pactline"><span class="tag">strengthened by</span><span class="chips">${allies}</span></div>
          <div class="pactline"><span class="tag">contested by</span><span class="chips">${rivals}</span></div>
          <div class="pactsum">
            <span class="${lift > 0.4 ? 'up' : 'flat'}">momentum ${lift > 0 ? '+' : ''}${lift.toFixed(1)} from allies</span>
            <span class="${pressure > 0.4 ? 'down' : 'flat'}">${pressure > 0 ? `−${pressure.toFixed(1)} from rivals` : 'nothing pulling against it'}</span>
            <span class="${gain > 0.15 ? 'up' : 'flat'}">insight +${gain.toFixed(2)}/turn${
              weakest !== null && def.allies.length > 1
                ? ` · capped by ${escapeHtml(FAMILIES[weakest].name)}`
                : ''
            }</span>
          </div>
        </div>`;
      })
      .join('');

    return `
      <div class="section-head">The two graphs · ${s.year}</div>
      <p class="lede">Alliance and rivalry are <b>not</b> opposites here, and a pair can sit on both lists. Rivalry moves <b>momentum</b>, which is fashion and can be taken back. Alliance moves <b>insight</b>, which cannot.</p>
      <div class="pacts">${rows}</div>
      <p class="chart-note">Rivals bite harder than allies lift — ${RIVAL_PRESSURE.toFixed(2)} against ${ALLY_LIFT.toFixed(2)} per point of the other school's momentum — so a century spent feuding runs down hill for everyone in it. Insight is paid from the <b>weakest</b> ally rather than the sum: backing one school of a pair and neglecting the other buys the join nothing, which is why the bridge column needs a portfolio and not a favourite.</p>`;
  };

  // ---------------------------------------------------------------- decisions

  const decisionsView = (): string => {
    const decisions = s.decisions ?? [];
    if (decisions.length === 0) {
      return '<p style="color:var(--dim)">You have not made a decision yet. This fills in as you go.</p>';
    }

    // Outcomes that arrived in a given term, so a decision can be read next to what followed it.
    const outcomesByYear = new Map<number, { text: string; kind: string }[]>();
    for (const l of s.log) {
      if (l.kind !== 'breakthrough' && l.kind !== 'crisis') continue;
      const list = outcomesByYear.get(l.year) ?? [];
      list.push({ text: l.text, kind: l.kind });
      outcomesByYear.set(l.year, list);
    }

    const turns = [...new Set(decisions.map((d) => d.turn))].sort((a, b) => a - b);

    const branches = turns
      .map((turn) => {
        const inTurn = decisions.filter((d) => d.turn === turn);
        const year = inTurn[0]!.year;
        // The consequences of a term's directives land in the tick that follows it.
        const outcomes = outcomesByYear.get(year + 4) ?? [];
        const spent = inTurn.reduce((n, d) => n + d.influenceSpent, 0);

        const twigs = inTurn
          .map((d) => twigHtml(d))
          .join('');

        const fruit = outcomes.length
          ? `<div class="fruit">${outcomes
              .map(
                (o) =>
                  `<div class="outcome ${o.kind}">${o.kind === 'crisis' ? '✕' : '✓'} ${escapeHtml(o.text)}</div>`,
              )
              .join('')}</div>`
          : '';

        return `<div class="branch">
          <div class="node-year">${year}<span>–${year + 3}${spent > 0 ? ` · ${spent} influence` : ''}</span></div>
          <div class="twigs">${twigs}${fruit}</div>
        </div>`;
      })
      .join('');

    return `<div class="dtree">${branches}</div>`;
  };

  const twigHtml = (d: Decision): string => {
    const fam = d.family;
    const style = fam ? ` style="--fam:${colour(fam)}"` : '';
    const scene = d.kind === 'choice' ? 'said' : 'ordered';
    return `<div class="twig ${d.kind}"${style}>
      <div class="what"><span class="kindtag">${scene}</span> ${escapeHtml(d.label)}</div>
      <div class="conseq">${
        d.consequences.length
          ? d.consequences.map((c) => `<i>${escapeHtml(c)}</i>`).join('')
          : '<i class="none">nothing you could measure at the time</i>'
      }</div>
      ${fam ? `<div class="favoured">favoured ${escapeHtml(FAMILIES[fam].name)}</div>` : ''}
    </div>`;
  };

  draw();
}

// ------------------------------------------------------------------- drawing

/*
 * Both charts stretch to whatever width the panel gives them, which means the SVG carries only
 * geometry — bands, lines, gridlines. Text inside a `preserveAspectRatio="none"` viewBox is
 * stretched by the same factor as the plot and comes out either squashed or illegibly small on
 * a phone, so every label is HTML positioned over the same percentage scale.
 */
const W = 1000;
const H = 300;

/** Position along the century, 0–1. The axis is always the full hundred years, never the data
 *  so far, so the chart does not silently rescale itself every four years. */
function xFrac(year: number): number {
  return (year - START_YEAR) / (END_YEAR - START_YEAR);
}

function xAt(year: number): number {
  return xFrac(year) * W;
}

/** Stacked share-of-the-field bands, one per school, across the century so far. */
function stackedAreaSvg(history: TurnSnapshot[], colour: (f: FamilyId) => string): string {
  // Bottom-up accumulation, so each band is drawn between the running total before and after it.
  const below = history.map(() => 0);
  const bands: string[] = [];
  for (const f of FAMILY_IDS) {
    const top = history.map((h, i) => below[i]! + h.shares[f]);
    const upper = history.map((h, i) => `${xAt(h.year).toFixed(1)},${((1 - top[i]!) * H).toFixed(1)}`);
    const lower = history
      .map((h, i) => `${xAt(h.year).toFixed(1)},${((1 - below[i]!) * H).toFixed(1)}`)
      .reverse();
    bands.push(
      `<polygon points="${upper.join(' ')} ${lower.join(' ')}" fill="${colour(f)}" fill-opacity="0.85"><title>${FAMILIES[f].name}</title></polygon>`,
    );
    for (let i = 0; i < history.length; i++) below[i] = top[i]!;
  }

  const winters = history
    .filter((h) => h.inWinter)
    .map((h) => {
      const x = xAt(h.year);
      const w = Math.max(4, xAt(h.year + 4) - x);
      return `<rect x="${x.toFixed(1)}" y="0" width="${w.toFixed(1)}" height="${H}" fill="var(--paper)" fill-opacity="0.5"/>
              <rect x="${x.toFixed(1)}" y="0" width="${w.toFixed(1)}" height="${H}" fill="none" stroke="var(--warn)" stroke-opacity="0.6" stroke-dasharray="4 5" vector-effect="non-scaling-stroke"/>`;
    })
    .join('');

  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" class="chart" role="img"
    aria-label="Each school's share of the field, stacked, from 1950 to ${history[history.length - 1]!.year}">
    ${bands.join('')}${winters}${gridlines()}
  </svg>`;
}

/** Capability against understanding — the gap between them is the game's central tension. */
function capabilitySvg(history: TurnSnapshot[], accent: string): string {
  const peak = Math.max(40, ...history.map((h) => Math.max(h.capability, h.understanding)));
  const y = (v: number) => (1 - v / peak) * H;
  const line = (pick: (h: TurnSnapshot) => number) =>
    history.map((h) => `${xAt(h.year).toFixed(1)},${y(pick(h)).toFixed(1)}`).join(' ');

  const capPts = line((h) => h.capability);
  const floor = history.map((h) => `${xAt(h.year).toFixed(1)},${H}`).reverse().join(' ');

  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" class="chart" role="img"
    aria-label="Capability and understanding from 1950 to ${history[history.length - 1]!.year}">
    ${gridlines()}
    <polygon points="${capPts} ${floor}" fill="${accent}" fill-opacity="0.16"/>
    <polyline points="${capPts}" fill="none" stroke="${accent}" stroke-width="2" vector-effect="non-scaling-stroke"/>
    <polyline points="${line((h) => h.understanding)}" fill="none" stroke="var(--ink)" stroke-width="2"
      stroke-dasharray="5 4" vector-effect="non-scaling-stroke"/>
  </svg>`;
}

/**
 * The four patrons over time, on a fixed 0–100 scale so the lines can be read against each
 * other. Drawn with CSS custom properties for colour rather than the family palette, since
 * these are not schools and should not borrow a school's identity.
 */
function patronSvg(history: TurnSnapshot[]): string {
  const y = (v: number) => (1 - Math.max(0, Math.min(100, v)) / 100) * H;
  const withPatrons = history.filter((h) => h.patrons);
  if (withPatrons.length < 2) {
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" class="chart">${gridlines()}
      <text x="${W / 2}" y="${H / 2}" text-anchor="middle" font-size="26" fill="var(--dim)">not recorded before this build</text>
    </svg>`;
  }

  const lines = PATRONS.map((p, i) => {
    const pts = withPatrons
      .map((h) => `${xAt(h.year).toFixed(1)},${y(h.patrons![p.key]).toFixed(1)}`)
      .join(' ');
    return `<polyline points="${pts}" fill="none" class="pline p${i}" stroke-width="2" vector-effect="non-scaling-stroke"/>`;
  }).join('');

  const winters = withPatrons
    .filter((h) => h.inWinter)
    .map((h) => {
      const x = xAt(h.year);
      const w = Math.max(4, xAt(h.year + 4) - x);
      return `<rect x="${x.toFixed(1)}" y="0" width="${w.toFixed(1)}" height="${H}" fill="var(--warn)" fill-opacity="0.1"/>`;
    })
    .join('');

  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" class="chart" role="img"
    aria-label="Support from defence, industry, the universities and the public, 1950 to ${withPatrons[withPatrons.length - 1]!.year}">
    ${gridlines()}${winters}${lines}
  </svg>`;
}

/** Decade rules, shared by both charts so they read as one timeline. */
function gridlines(): string {
  const out: string[] = [];
  for (let year = START_YEAR + 10; year < END_YEAR; year += 10) {
    const x = xAt(year).toFixed(1);
    out.push(
      `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="var(--paper)" stroke-opacity="0.3" stroke-width="1" vector-effect="non-scaling-stroke"/>`,
    );
  }
  return out.join('');
}

/** The decade scale, in HTML so the numbers are the interface's own type at its own size. */
function axisHtml(): string {
  const marks: string[] = [];
  for (let year = START_YEAR; year <= END_YEAR; year += 10) {
    const pct = (xFrac(year) * 100).toFixed(2);
    const align = year === START_YEAR ? ' start' : year === END_YEAR ? ' end' : '';
    marks.push(`<span class="tick${align}" style="left:${pct}%">${year}</span>`);
  }
  return `<div class="axis">${marks.join('')}</div>`;
}

/** Used by the report to name a paradigm without importing the whole content index. */
export function paradigmLabel(id: string): string {
  return PARADIGM_BY_ID[id]?.name ?? id;
}

/** Exported for tests: the standing definition the whole interface agrees on. */
export { familyStanding };

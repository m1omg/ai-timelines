import { familyColour } from '../art/palette';
import { APPLICATIONS } from '../content/applications';
import { FAMILIES, PARADIGMS, PARADIGM_BY_ID } from '../content/paradigms';
import { evaluate } from '../engine/conditions';
import { computeAdequacy, prereqsMet } from '../engine/sim';
import type { GameState, Paradigm } from '../engine/types';
import { FAMILY_IDS } from '../engine/types';
import { currentEra } from './theme';
import { escapeHtml } from './vn';

/**
 * Everything the century has actually put to work by now.
 *
 * Gated on the paradigm having matured in *this* run rather than on the year, so the list is a
 * consequence of what the player proved rather than a calendar. That is the whole point of the
 * tab: a century that never demonstrated convolution has no medical imaging, and a century that
 * backed fuzzy control has had it in kitchens since the eighties whatever else it was arguing
 * about.
 */
function inUse(s: GameState) {
  return APPLICATIONS.filter(
    (a) =>
      s.year >= a.from &&
      s.paradigms[a.paradigm]?.status === 'mature' &&
      evaluate(a.when, s),
  ).sort((a, b) => a.from - b.from);
}

/** Grouped by school, newest first within each, because the recent arrivals are the news. */
function useView(s: GameState, era: ReturnType<typeof currentEra>): string {
  const live = inUse(s);
  if (live.length === 0) {
    return `<p style="color:var(--dim);font-family:var(--font-body);font-size:15px;line-height:1.7;max-width:70ch">
      Nothing yet. In ${s.year} the field is entirely argument — the first thing on this list
      arrives when an idea finishes maturing and somebody outside the field finds a use for it,
      which is usually a decade or two after the paper that made it possible.
    </p>`;
  }

  const recent = live.filter((a) => a.from > s.year - 8);
  const groups = FAMILY_IDS.map((f) => {
    const mine = live.filter((a) => a.family === f);
    if (mine.length === 0) return '';
    const colour = familyColour(FAMILIES[f].hue, era);
    return `<div class="uses" style="--fam:${colour}">
      <h3>${escapeHtml(FAMILIES[f].name)} <span class="n">${mine.length}</span></h3>
      ${mine
        .slice()
        .reverse()
        .map(
          (a) => `<div class="use${a.projected ? ' projected' : ''}">
            <span class="yr">${a.from}</span>
            <span class="body">
              <b>${escapeHtml(a.what)}</b>
              <i>${escapeHtml(a.where)}</i>
            </span>
          </div>`,
        )
        .join('')}
    </div>`;
  }).join('');

  return `
    <div class="section-head">In ordinary use · ${s.year}</div>
    <p class="lede">${live.length} things the century has put to work${
      recent.length ? `, ${recent.length} of them within the last eight years` : ''
    }. Anything past 2026 is projection rather than record, and marked.</p>
    <div class="usegrid">${groups}</div>
    <p class="chart-note">The order here is not the order the argument was won in. A school can hold every chair in the field and appear on this list once; another can lose every methodological fight of the century and be in half the kitchens in the country. Both have happened.</p>`;
}

/**
 * The tree is the game's argument made visible: eight columns of ideas, most of them locked,
 * most of them locked because of something other than money.
 */
export function renderTree(root: HTMLElement, s: GameState, onClose: () => void): void {
  const era = currentEra();
  let tab: 'tree' | 'use' = 'tree';

  const draw = () => {
    drawInto(root, s, era, tab, onClose, (t) => {
      tab = t;
      draw();
    });
  };
  draw();
}

function drawInto(
  root: HTMLElement,
  s: GameState,
  era: ReturnType<typeof currentEra>,
  tab: 'tree' | 'use',
  onClose: () => void,
  onTab: (t: 'tree' | 'use') => void,
): void {
  const columns = FAMILY_IDS.map((f) => {
    const def = FAMILIES[f];
    const st = s.families[f];
    const colour = familyColour(def.hue, era);
    const nodes = PARADIGMS.filter((p) => p.family === f)
      .sort((a, b) => a.earliest - b.earliest)
      .map((p) => nodeHtml(s, p))
      .join('');
    return `<div class="fam" style="--fam:${colour}">
      <h3>${escapeHtml(def.name)}</h3>
      <div class="creed">${escapeHtml(def.creed)}</div>
      <div class="stats">${st.matured} matured · insight ${Math.round(st.insight)} · ${(st.talent * 100).toFixed(0)}% of the field${st.momentum > 20 ? ' · ascendant' : st.momentum < -12 ? ' · out of favour' : ''}</div>
      ${nodes}
    </div>`;
  }).join('');

  root.innerHTML = `<div class="panel"><div class="wrap">
    <div style="display:flex;align-items:baseline;gap:14px">
      <h2>Paradigms</h2><span class="spacer" style="flex:1"></span>
      <button id="tree-close">Close</button>
    </div>
    <div class="sub">${
      tab === 'tree'
        ? 'Every school in the field, and every idea in it that anyone has had yet. Greyed entries are not yet reachable — usually because their prerequisites are unproved, sometimes because no machine that exists could demonstrate them. Click any entry for what it actually is.'
        : 'What the field is doing on a Tuesday. Everything here follows from an idea your century actually proved, and the order it arrived in is rarely the order the argument was won in.'
    }</div>
    <div class="filterbar tabs">
      <button data-tab="tree" class="${tab === 'tree' ? 'on' : ''}">The tree</button>
      <button data-tab="use" class="${tab === 'use' ? 'on' : ''}">In use <span class="n">${inUse(s).length}</span></button>
    </div>
    ${tab === 'tree' ? `<div class="tree">${columns}</div>` : useView(s, era)}
    <div style="height:60px"></div>
  </div></div>
  <div id="node-detail"></div>`;

  root.querySelector('#tree-close')!.addEventListener('click', onClose);
  root.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach((b) =>
    b.addEventListener('click', () => onTab(b.dataset.tab as 'tree' | 'use')),
  );
  root.querySelectorAll<HTMLElement>('.node').forEach((el) => {
    el.addEventListener('click', () => {
      const p = PARADIGM_BY_ID[el.dataset.id!];
      if (p) showDetail(root.querySelector('#node-detail')!, s, p);
    });
  });
}

function nodeHtml(s: GameState, p: Paradigm): string {
  const st = s.paradigms[p.id];
  const pct = Math.min(100, (st.progress / p.cost) * 100);
  const cls = ['node', st.status].join(' ');
  const yr = st.maturedYear ?? p.earliest;
  const label = st.status === 'mature' ? `${yr}` : st.status === 'locked' ? `not before ${p.earliest}` : `from ${p.earliest}`;
  return `<div class="${cls}" data-id="${escapeHtml(p.id)}">
    <div class="n">${escapeHtml(p.name)}</div>
    <div class="y">${label}</div>
    ${st.status !== 'locked' && st.status !== 'mature' ? `<div class="p"><i style="width:${pct.toFixed(0)}%"></i></div>` : ''}
  </div>`;
}

function showDetail(host: HTMLElement, s: GameState, p: Paradigm): void {
  const st = s.paradigms[p.id];
  const adequacy = computeAdequacy(p, s.computeLog);
  const blockers: string[] = [];
  if (st.status === 'locked') {
    if (s.year < p.earliest) blockers.push(`Nobody has had this idea yet. Not before ${p.earliest}.`);
    for (const id of p.prereqs) {
      if (s.paradigms[id]?.status !== 'mature') {
        blockers.push(`Needs ${PARADIGM_BY_ID[id]?.name ?? id} to be established first.`);
      }
    }
    if (p.familyPrereqs) {
      for (const [f, need] of Object.entries(p.familyPrereqs)) {
        const have = s.families[f as keyof typeof s.families].insight;
        if (have < (need as number)) {
          blockers.push(
            `Needs ${FAMILIES[f as keyof typeof FAMILIES].name} insight of ${need} — the field has ${Math.round(have)}.`,
          );
        }
      }
    }
    if (blockers.length === 0 && !prereqsMet(s, p)) blockers.push('Prerequisites unmet.');
  }
  if (adequacy < 1) {
    blockers.push(
      adequacy <= 0
        ? `Requires roughly 10^${p.computeNeed} operations to demonstrate. The frontier is 10^${s.computeLog.toFixed(1)}. This cannot be shown at all yet.`
        : `Under-powered: wants 10^${p.computeNeed} operations, the frontier is 10^${s.computeLog.toFixed(1)}. Progress runs at ${(adequacy * 100).toFixed(0)}%.`,
    );
  }

  host.innerHTML = `<div class="detail"><div class="wrap">
    <div style="display:flex;align-items:baseline;gap:12px">
      <h2 style="margin:0">${escapeHtml(p.name)}</h2>
      <span style="color:var(--dim);font-size:12px">${escapeHtml(FAMILIES[p.family].name)} · ${p.anchor.year}${p.anchor.who ? ` · ${escapeHtml(p.anchor.who)}` : ''}</span>
      <span style="flex:1"></span>
      <button id="det-close">Close</button>
    </div>
    <p>${escapeHtml(p.codex)}</p>
    ${blockers.length ? `<p style="color:var(--warn);font-size:13px;font-family:var(--font-ui);line-height:1.7">${blockers.map(escapeHtml).join('<br>')}</p>` : ''}
    <p style="font-family:var(--font-ui);font-size:11px;color:var(--dim);letter-spacing:0.06em">
      status ${st.status} · progress ${Math.round(st.progress)}/${p.cost}${st.driver ? ` · driven by ${escapeHtml(st.driver)}` : ''}
    </p>
  </div></div>`;
  host.querySelector('#det-close')!.addEventListener('click', () => {
    host.innerHTML = '';
  });
}

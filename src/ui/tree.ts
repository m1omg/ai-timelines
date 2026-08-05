import { familyColour } from '../art/palette';
import { FAMILIES, PARADIGMS, PARADIGM_BY_ID } from '../content/paradigms';
import { computeAdequacy, prereqsMet } from '../engine/sim';
import type { GameState, Paradigm } from '../engine/types';
import { FAMILY_IDS } from '../engine/types';
import { currentEra } from './theme';
import { escapeHtml } from './vn';

/**
 * The tree is the game's argument made visible: eight columns of ideas, most of them locked,
 * most of them locked because of something other than money.
 */
export function renderTree(root: HTMLElement, s: GameState, onClose: () => void): void {
  const era = currentEra();

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
    <div class="sub">
      Every school in the field, and every idea in it that anyone has had yet. Greyed entries are
      not yet reachable — usually because their prerequisites are unproved, sometimes because no
      machine that exists could demonstrate them. Click any entry for what it actually is.
    </div>
    <div class="tree">${columns}</div>
    <div style="height:60px"></div>
  </div></div>
  <div id="node-detail"></div>`;

  root.querySelector('#tree-close')!.addEventListener('click', onClose);
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

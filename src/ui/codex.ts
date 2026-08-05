import { familyColour } from '../art/palette';
import { CHARACTERS } from '../content/characters';
import { FAMILIES, PARADIGMS } from '../content/paradigms';
import { CODEX_ESSAYS } from '../content/codex';
import type { GameState } from '../engine/types';
import { currentEra } from './theme';
import { escapeHtml } from './vn';

type Tab = 'ideas' | 'people' | 'essays';

/**
 * The Codex is the educational payload, and it only unlocks what the run has actually touched:
 * an idea appears once it is reachable, a person once you have met them. Playing differently
 * shows you a different encyclopedia, which is the point.
 */
export function renderCodex(root: HTMLElement, s: GameState, onClose: () => void): void {
  let tab: Tab = 'ideas';
  const era = currentEra();

  const draw = () => {
    root.innerHTML = `<div class="panel"><div class="wrap">
      <div style="display:flex;align-items:baseline;gap:14px">
        <h2>Codex</h2><span style="flex:1"></span><button id="cx-close">Close</button>
      </div>
      <div class="sub">Everything this run has surfaced. Entries appear as you reach them.</div>
      <div class="filterbar">
        <button data-t="ideas" class="${tab === 'ideas' ? 'on' : ''}">Ideas</button>
        <button data-t="people" class="${tab === 'people' ? 'on' : ''}">People</button>
        <button data-t="essays" class="${tab === 'essays' ? 'on' : ''}">On the field</button>
      </div>
      <div class="codex-list">${body()}</div>
      <div style="height:60px"></div>
    </div></div>`;

    root.querySelector('#cx-close')!.addEventListener('click', onClose);
    root.querySelectorAll<HTMLButtonElement>('[data-t]').forEach((b) =>
      b.addEventListener('click', () => {
        tab = b.dataset.t as Tab;
        draw();
      }),
    );
  };

  const body = (): string => {
    if (tab === 'ideas') {
      const visible = PARADIGMS.filter((p) => s.paradigms[p.id]?.status !== 'locked' || s.year >= p.earliest);
      if (visible.length === 0) return '<p style="color:var(--dim)">Nothing yet.</p>';
      return visible
        .sort((a, b) => a.anchor.year - b.anchor.year)
        .map((p) => {
          const colour = familyColour(FAMILIES[p.family].hue, era);
          const st = s.paradigms[p.id];
          return `<div class="entry" style="--fam:${colour}">
            <h4>${escapeHtml(p.name)}</h4>
            <div class="meta">${escapeHtml(FAMILIES[p.family].name)} · ${p.anchor.year}${p.anchor.who ? ` · ${escapeHtml(p.anchor.who)}` : ''}${st.status === 'mature' ? ` · established ${st.maturedYear}` : ''}</div>
            <p>${escapeHtml(p.codex)}</p>
          </div>`;
        })
        .join('');
    }

    if (tab === 'people') {
      const met = CHARACTERS.filter((c) => s.characters[c.id]?.met);
      if (met.length === 0) return '<p style="color:var(--dim)">You have not met anyone yet.</p>';
      return met
        .map((c) => {
          const colour = c.family ? familyColour(FAMILIES[c.family].hue, era) : era.accent;
          const aff = s.characters[c.id]!.affinity;
          const rel = aff > 40 ? 'owes you a great deal' : aff > 12 ? 'thinks well of you' : aff < -30 ? 'has not forgiven you' : aff < -10 ? 'is wary of you' : 'has no particular opinion';
          return `<div class="entry" style="--fam:${colour}">
            <h4>${escapeHtml(c.name)}</h4>
            <div class="meta">${c.kind === 'historical' ? 'historical figure' : c.kind} · ${c.span[0]}–${c.span[1]}${c.family ? ` · ${escapeHtml(FAMILIES[c.family].name)}` : ''} · ${rel}</div>
            <p>${escapeHtml(c.bio)}</p>
            ${c.sources?.length ? `<div class="src">Sources: ${c.sources.map(escapeHtml).join(' · ')}</div>` : ''}
          </div>`;
        })
        .join('');
    }

    return CODEX_ESSAYS.filter((e) => s.year >= e.from)
      .map(
        (e) => `<div class="entry" style="--fam:${era.accent}">
          <h4>${escapeHtml(e.title)}</h4>
          <div class="meta">${e.from}</div>
          <p>${e.body.split('\n\n').map((para) => escapeHtml(para)).join('</p><p>')}</p>
        </div>`,
      )
      .join('');
  };

  draw();
}

export function renderLog(root: HTMLElement, s: GameState, onClose: () => void): void {
  const lines = s.log
    .slice()
    .reverse()
    .map(
      (l) => `<div class="log-line ${l.kind}"><b>${l.year}</b><span>${escapeHtml(l.text)}</span></div>`,
    )
    .join('');
  root.innerHTML = `<div class="panel"><div class="wrap">
    <div style="display:flex;align-items:baseline;gap:14px">
      <h2>The Record</h2><span style="flex:1"></span><button id="lg-close">Close</button>
    </div>
    <div class="sub">What happened, in the order it happened. ${s.winters.length > 0 ? `${s.winters.length} funding collapse${s.winters.length === 1 ? '' : 's'} so far.` : 'No funding collapses so far.'}</div>
    <div class="log-list">${lines || '<p style="color:var(--dim)">Nothing recorded yet.</p>'}</div>
    <div style="height:60px"></div>
  </div></div>`;
  root.querySelector('#lg-close')!.addEventListener('click', onClose);
}

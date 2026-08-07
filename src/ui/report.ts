import { ERAS, eraForAct } from '../art/palette';
import { plateClass, plateCredit, plateUrl } from '../art/plate';
import { FAMILIES, PARADIGM_BY_ID } from '../content/paradigms';
import { leadingFamily } from '../engine/conditions';
import { resolveEnding } from '../engine/endings';
import { ACT_TITLES, ACT_TURNS, yearOfTurn } from '../engine/state';
import type { GameState, TickReportLike } from './types';
import { roman } from './console';
import { sfxActBreak, sfxBreakthrough, sfxCrisis } from './audio';
import { applyEra } from './theme';
import { escapeHtml } from './vn';
import { FAMILY_IDS } from '../engine/types';
import { playScene } from './vn';

/** Four years of consequences, written up. */
export function renderReport(root: HTMLElement, s: GameState, r: TickReportLike, onNext: () => void): void {
  if (r.winterStarted) sfxCrisis();
  else if (r.matured.length > 0) sfxBreakthrough();

  const items: string[] = [];

  for (const id of r.matured) {
    const p = PARADIGM_BY_ID[id];
    if (!p) continue;
    items.push(
      `<li><b style="color:var(--accent)">${escapeHtml(p.name)}</b> — ${escapeHtml(p.short)}. <span style="color:var(--dim)">${escapeHtml(FAMILIES[p.family].name)}${p.anchor.who ? `, in the line of ${escapeHtml(p.anchor.who)}` : ''}.</span></li>`,
    );
  }

  if (r.winterStarted) {
    items.push(
      `<li class="crisis"><b>The funding collapses.</b> ${escapeHtml(FAMILIES[r.winterStarted.blamed].name)} is blamed — not because it was the most wrong, but because it was the loudest. Programmes are cancelled mid-sentence and the students go into other fields.</li>`,
    );
  }
  if (r.winterEnded) {
    items.push(
      `<li><b>The money moves again.</b> Quietly, under other names, to people who spent the last decade insisting they were doing statistics.</li>`,
    );
  }
  for (const note of r.notes) items.push(`<li>${escapeHtml(note)}</li>`);

  const newlyPossible = r.unlocked
    .map((id) => PARADIGM_BY_ID[id])
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  if (newlyPossible.length > 0) {
    items.push(
      `<li style="color:var(--dim)">Newly thinkable: ${newlyPossible.map((p) => escapeHtml(p.name)).join(', ')}.</li>`,
    );
  }

  if (items.length === 0) {
    items.push(
      '<li style="color:var(--dim)">Four years of committee meetings, incremental papers and nothing anyone will remember. Most of the century looks like this.</li>',
    );
  }

  const lead = leadingFamily(s);
  const era = eraForAct(s.act);
  const plate = plateUrl(era);

  root.innerHTML = `<div class="panel"><div class="wrap report">
    ${
      plate
        ? `<figure class="plate-strip">
             <img class="${plateClass(era)}" src="${plate}" alt="">
             <figcaption>${escapeHtml(plateCredit(era) ?? '')}</figcaption>
           </figure>`
        : ''
    }
    <!-- The four years the previous directive board governed. Must not overlap the next
         board's own label, or it reads as allocating for the same year twice. -->
    <h2>${r.year - 4}–${r.year - 1}</h2>
    <div class="sub">The frontier reaches 10^${s.computeLog.toFixed(1)} operations. The field's centre of gravity is ${escapeHtml(FAMILIES[lead].name)}.</div>
    <ul>${items.join('')}</ul>
    <div style="margin:34px 0 60px"><button class="primary" id="rep-next">Continue ▸</button></div>
  </div></div>`;

  root.querySelector('#rep-next')!.addEventListener('click', onNext);
}

/** The act break: the interface itself changes generation. */
export function renderActBreak(host: HTMLElement, act: number, onDone: () => void): void {
  const era = eraForAct(act);
  const [lo, hi] = ACT_TURNS[act - 1]!;
  sfxActBreak(ERAS.indexOf(era));

  // The era's palette has to be live before the plate is painted: it is drawn in the theme's
  // own colours, and painting it against the outgoing act's ramp is the one order that looks
  // like a bug rather than a transition.
  applyEra(act);
  const plate = plateUrl(era);
  const credit = plateCredit(era);

  const el = document.createElement('div');
  el.className = 'actbreak';
  el.innerHTML = `
    ${plate ? `<div class="plate-bed"><img class="${plateClass(era)}" src="${plate}" alt=""></div>` : ''}
    <div class="numeral">${roman(act)}</div>
    <div class="rule"></div>
    <div class="title">${escapeHtml(ACT_TITLES[act - 1] ?? '')}</div>
    <div class="years">${yearOfTurn(lo)} — ${yearOfTurn(hi)}</div>
    <div class="device">${escapeHtml(era.device)}</div>
    ${credit ? `<div class="plate-credit">${escapeHtml(credit)}</div>` : ''}`;
  host.appendChild(el);

  // The auto-dismiss timer must be cancelled when the player dismisses it by hand, and finish()
  // must run exactly once. Without both, clicking through an act break in under 5.2s let the
  // timer fire later and call onDone() a second time — which re-entered the turn loop and
  // handed out a whole extra round of scenes and a second directive phase for the same period.
  let done = false;
  let timer = 0;

  const finish = () => {
    if (done) return;
    done = true;
    window.clearTimeout(timer);
    el.removeEventListener('click', finish);
    window.removeEventListener('keydown', onKey);
    el.remove();
    onDone();
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') finish();
  };
  el.addEventListener('click', finish);
  window.addEventListener('keydown', onKey);
  timer = window.setTimeout(finish, 5200);
}

/** Roll the ending, play its scene, then show the summary of the century. */
export async function renderEnding(
  stage: HTMLElement,
  root: HTMLElement,
  s: GameState,
  onRestart: () => void,
): Promise<void> {
  const ending = resolveEnding(s);
  s.ending = ending.id;

  await playScene(stage, s, {
    id: `ending:${ending.id}`,
    act: 7,
    backdrop: 'archive',
    lines: [{ system: true, text: ending.epigraph }, ...ending.lines],
  });

  const families = FAMILY_IDS.map((f) => {
    const st = s.families[f];
    return `<div class="log-line"><b>${st.matured}</b><span>${escapeHtml(FAMILIES[f].name)} — insight ${Math.round(st.insight)}, ${(st.talent * 100).toFixed(0)}% of the field at the close</span></div>`;
  }).join('');

  const winters = s.winters.length
    ? s.winters
        .map(
          (w) =>
            `<div class="log-line crisis"><b>${w.startYear}</b><span>Funding collapse, blamed on ${escapeHtml(FAMILIES[w.blamed].name)}${w.endYear ? `; recovered ${w.endYear}` : '; never recovered'}</span></div>`,
        )
        .join('')
    : '<div class="log-line"><b>—</b><span>No funding collapse in a hundred years. This is rare.</span></div>';

  root.innerHTML = `<div class="panel"><div class="wrap report">
    <h2>${escapeHtml(ending.name)}</h2>
    <div class="sub" style="font-family:var(--font-body);font-size:16px;line-height:1.7">${escapeHtml(ending.verdict)}</div>

    <div class="section-head">The century, in numbers</div>
    <div class="log-list">
      <div class="log-line"><b>${Math.round(s.resources.capability)}</b><span>capability at the close</span></div>
      <div class="log-line"><b>${Math.round(s.resources.understanding)}</b><span>understanding — the theory that kept pace, or did not</span></div>
      <div class="log-line"><b>${Math.round(s.resources.deployment)}</b><span>deployment — how far it reached into ordinary life</span></div>
      <div class="log-line ${s.resources.exposure > 45 ? 'crisis' : ''}"><b>${Math.round(s.resources.exposure)}</b><span>exposure — consequence nobody got round to addressing</span></div>
      <div class="log-line"><b>10^${s.computeLog.toFixed(1)}</b><span>the compute frontier you left behind</span></div>
    </div>

    <div class="section-head">The schools</div>
    <div class="log-list">${families}</div>

    <div class="section-head">Winters</div>
    <div class="log-list">${winters}</div>

    <div style="margin:34px 0 60px;display:flex;gap:10px;flex-wrap:wrap">
      <button class="primary" id="end-again">Run it again ▸</button>
      <span style="color:var(--dim);font-size:12px;align-self:center">A different seed gives a different century. So does a different portfolio.</span>
    </div>
  </div></div>`;

  root.querySelector('#end-again')!.addEventListener('click', onRestart);
}

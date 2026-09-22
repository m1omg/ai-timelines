import { FAMILIES } from '../content/paradigms';
import type { Decision, FamilyId, GameState } from '../engine/types';
import { escapeHtml } from './vn';

/**
 * The decision ledger, drawn as a tree: every choice and directive, by term, with what each did
 * and what landed in the term after it. Balance shows it during the century and the ending
 * shows it at the close, and they call the same function so the two never disagree about what
 * the player did.
 */
export function decisionsHtml(s: GameState, colour: (f: FamilyId) => string): string {
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
        .map((d) => twigHtml(d, colour))
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
}

function twigHtml(d: Decision, colour: (f: FamilyId) => string): string {
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
}

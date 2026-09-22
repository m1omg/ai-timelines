import { describe, expect, it } from 'vitest';
import { centuryCard } from '../../src/ui/report';
import { createState } from '../../src/engine/state';
import { flagSet } from '../../src/engine/conditions';

/**
 * The copyable card is the one part of the ending that leaves the game, so it is checked for
 * being short, complete, and free of markup — nobody wants seventy kilobytes of state or a
 * stray `<b>` in a chat message.
 */
describe('the century card', () => {
  it('is short plain text that names the verdict, the numbers and the seed', () => {
    const s = createState(1956);
    s.winters.push({ startYear: 1974, endYear: 1982, blamed: 'symbolic', severity: 1 });
    const card = centuryCard(
      s,
      { name: 'A Verdict', verdict: 'What it came to.' },
      ['a reason', 'another'],
      { ending: { name: 'Another Verdict' }, failed: flagSet('treaty') },
    );
    expect(card).toContain('seed 1956');
    expect(card).toContain('A VERDICT');
    expect(card).toContain('1974 (Symbolic blamed, recovered 1982)');
    expect(card).toContain('why this one: a reason; another');
    expect(card).toContain('one condition away: Another Verdict — needed a compute treaty was signed');
    expect(card).not.toMatch(/<[a-z]/);
    expect(card.length).toBeLessThan(1500);
  });
});

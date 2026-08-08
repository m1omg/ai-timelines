import { all, any, leadFamily, mature, not } from '../engine/conditions';
import { evaluate } from '../engine/conditions';
import { ACT_TITLES } from '../engine/state';
import type { Condition, GameState } from '../engine/types';

/**
 * What each act is called, given the century that actually happened.
 *
 * The fixed titles were written for the historical path, so a symbolic century that never
 * trained anything still had its 2014-2026 called "The Scaling Years", and a century that never
 * lost its funding was told it had lived through "The Long Retrenchment". An act break is the
 * game's loudest single assertion about what just happened; it should not be the one thing that
 * cannot be wrong.
 *
 * Two rules held throughout:
 *
 *   1. **The machines advance regardless.** Compute is on a Moore's-law floor that no school
 *      chooses and no winter stops — transistors got cheaper whatever the field believed about
 *      minds. So a century that did not scale is never "the years nothing happened"; it is the
 *      years the field did not spend what was on the table. The hardware is not the story, and
 *      it is also not absent from it.
 *   2. **A winter is a fact about the money, not about the ideas.** Winter titles name the
 *      funding leaving, never the work stopping, because the work demonstrably did not stop in
 *      any of the real ones.
 *
 * Conditions are declarative so the linter can walk them, as everywhere else. First match wins
 * and the last entry of each act carries no condition, which is what guarantees a title.
 */
export interface ActTitle {
  when?: Condition;
  title: string;
}

const inWinter: Condition = { kind: 'inWinter', is: true };
const hadWinter: Condition = { kind: 'winterCount', op: '>=', value: 1 };
/** The scaling path as a fact about the century rather than about one school's standing. */
const scaled: Condition = any(mature('gpu-scale'), mature('scaling-regime'));

export const ACT_TITLE_VARIANTS: ActTitle[][] = [
  // I · 1950-1962. Nobody has lost anything yet; the variation is in what the field thinks it is.
  [
    { when: leadFamily('cybernetic'), title: 'The Summer of the Steersman' },
    { when: leadFamily('connectionist'), title: 'The Summer of the Learning Machine' },
    { when: leadFamily('substrate'), title: 'The Summer of the Stored Program' },
    { title: 'The Summer of Definitions' },
  ],

  // II · 1966-1978. The original title assumes the money left. Most centuries it does; the ones
  // where it does not have earned a different name rather than an ironic one.
  [
    { when: inWinter, title: 'The Long Retrenchment' },
    { when: hadWinter, title: 'The Years After the Money' },
    { when: leadFamily('symbolic'), title: 'The Years of Written Rules' },
    { title: 'The Long Argument' },
  ],

  // III · 1982-1994. "The Rule and the Weight" is a two-school title, and four other schools can
  // hold this decade.
  [
    { when: inWinter, title: 'The Second Retrenchment' },
    { when: all(leadFamily('symbolic'), not(scaled)), title: 'The Rule and the Weight' },
    { when: leadFamily('connectionist'), title: 'The Rule and the Weight' },
    { when: leadFamily('evolutionary'), title: 'The Bred and the Built' },
    { when: leadFamily('cybernetic'), title: 'The Body and the Rule' },
    { when: leadFamily('substrate'), title: 'The Decade the Silicon Answered' },
    { when: leadFamily('collective'), title: 'The Decade of the Many' },
    { title: 'The Rule and the Weight' },
  ],

  // IV · 1998-2010. Quiet is right for the historical path and wrong for a century that spent it
  // shipping. Note the substrate title: the machines got cheap here whoever was arguing.
  [
    { when: inWinter, title: 'The Decade the Money Waited' },
    { when: leadFamily('substrate'), title: 'The Decade the Machines Got Cheap' },
    { when: leadFamily('statistical'), title: 'The Decade of Quiet Arithmetic' },
    { when: leadFamily('collective'), title: 'The Decade of the Crowd' },
    { title: 'The Quiet Decade' },
  ],

  /*
   * V · 2014-2026. The one that prompted this.
   *
   * The fallback is deliberately not a negation. The machines of this decade were cheap and
   * enormous in every century, because that is what the floor does; what differs is whether the
   * field pointed itself at them. A run that did not scale did not miss the hardware — it
   * declined the trade, which is a position and not an absence.
   */
  [
    { when: inWinter, title: 'The Years the Money Left' },
    { when: all(scaled, leadFamily('connectionist')), title: 'The Scaling Years' },
    { when: scaled, title: 'The Years of the Large Machine' },
    { when: leadFamily('symbolic'), title: 'The Years the Rules Held' },
    { when: leadFamily('cybernetic'), title: 'The Years of the Slow Body' },
    { when: leadFamily('collective'), title: 'The Years of the Many Hands' },
    { title: 'The Years of Cheap Machines' },
  ],

  // VI · 2030-2042. Past the record. "The Divergence" is about the frame rather than the field,
  // so it survives most centuries; a winter here is the projection's own crisis.
  [
    { when: inWinter, title: 'The Divergence, Interrupted' },
    { when: leadFamily('cybernetic'), title: 'The Divergence at Walking Pace' },
    { when: leadFamily('collective'), title: 'The Divergence Without a Centre' },
    { title: 'The Divergence' },
  ],

  // VII · 2046-2050. A settlement is what you get when there is something to settle.
  [
    { when: inWinter, title: 'The Reckoning' },
    { when: { kind: 'winterCount', op: '>=', value: 3 }, title: 'What Was Left' },
    { title: 'The Settlement' },
  ],
];

/** The act's name in this century. Falls back to the fixed title if anything is missing. */
export function actTitle(act: number, s: GameState): string {
  const variants = ACT_TITLE_VARIANTS[act - 1];
  const fixed = ACT_TITLES[act - 1] ?? '';
  if (!variants) return fixed;
  for (const v of variants) {
    if (evaluate(v.when, s)) return v.title;
  }
  return fixed;
}

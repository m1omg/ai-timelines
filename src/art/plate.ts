import type { EraTheme } from './palette';
import { PLATES, type Plate } from './plates';

/**
 * Getting at the era plates.
 *
 * The images themselves are built by tools/plates/make-plates.py and imported by plates.ts, so
 * there is very little to do here — but there are two things every caller would otherwise get
 * wrong. A dithered plate must be scaled with hard pixel edges or its dither smears into grey,
 * and a colour one must not be, or a 1920-pixel photograph acquires a staircase. And a plate
 * arrives from the network exactly when an act break is trying to be a moment, so they are
 * warmed in the background long before then.
 */

export function plateFor(era: EraTheme): Plate | null {
  return PLATES[era.id] ?? null;
}

export function plateUrl(era: EraTheme): string | null {
  return plateFor(era)?.url ?? null;
}

/**
 * Eras that do not lay their plate in as a full-bleed bed behind the title and the act break.
 *
 * Act I opts out. Its plate is a single bit of ink multiplied over paper lighter than itself,
 * which is the honest way to print it and exactly wrong at full bleed: the photograph stops
 * reading as a photograph and becomes a texture over the whole page. The teleprinter act should
 * open on bare paper, which is what it did before the plates arrived.
 *
 * The plate itself is untouched — act I still carries it beside each report and in the Codex,
 * where it is captioned and credited rather than serving as decoration.
 */
const NO_BED = new Set(['teletype']);

/** The plate to use as a background bed, or null for an era that opens on bare paper. */
export function plateBedUrl(era: EraTheme): string | null {
  return NO_BED.has(era.id) ? null : plateUrl(era);
}

/** Class list for an <img>: pixel-exact for the eras that were, smooth for the ones that were not. */
export function plateClass(era: EraTheme): string {
  const p = plateFor(era);
  return p && p.tones > 0 ? 'plate pixel' : 'plate';
}

/** One line of provenance: what it is, when, and who to thank. Shown wherever a plate is. */
export function plateCredit(era: EraTheme): string | null {
  const p = plateFor(era);
  return p ? `${p.caption}, ${p.year} · ${p.credit}` : null;
}

/**
 * Pull every plate into the browser cache while the player is reading. The later ones are a few
 * hundred kilobytes each and are wanted at an act break, which is the one moment in the game
 * that is purely presentational and cannot afford to wait for a decode.
 */
export function prefetchPlates(): void {
  if (typeof document === 'undefined') return;
  const warm = () => {
    for (const plate of Object.values(PLATES)) new Image().src = plate.url;
  };
  const idle = window.requestIdleCallback as typeof window.requestIdleCallback | undefined;
  if (idle) idle(warm, { timeout: 4000 });
  else window.setTimeout(warm, 1200);
}

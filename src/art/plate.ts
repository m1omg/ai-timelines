import type { EraTheme } from './palette';
import { PLATES, type Plate } from './plates';

/**
 * Painting the era plates.
 *
 * The plates are stored as palette indices rather than colours (see src/art/plates.ts), so the
 * colour decision happens here, at draw time, against whichever era theme is live. That is what
 * makes a photograph feel like it belongs to the interface it is sitting in: the same ENIAC
 * negative is ink on fanfold paper in act I and would be cyan on black in act III.
 *
 * Everything is done once per era and cached. A plate is 64,000 pixels; painting it on every
 * act break and every report screen would be visible.
 */

const urls = new Map<string, string>();

export function plateFor(era: EraTheme): Plate | null {
  return PLATES[era.id] ?? null;
}

/**
 * A data URL of the era's plate, in the era's colours, or null if this era has no plate or we
 * are somewhere without a DOM (the linter and the playtest harness both import this module's
 * neighbours).
 */
export function plateUrl(era: EraTheme): string | null {
  const cached = urls.get(era.id);
  if (cached) return cached;

  const plate = plateFor(era);
  const ramp = era.plateRamp;
  if (!plate || !ramp || typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = plate.w;
  canvas.height = plate.h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const colours = ramp.slice(0, plate.tones).map(rgba);
  const img = ctx.createImageData(plate.w, plate.h);
  const bytes = decode(plate.data);
  const perByte = 8 / plate.bits;
  const mask = (1 << plate.bits) - 1;

  for (let i = 0; i < plate.w * plate.h; i++) {
    const byte = bytes[Math.floor(i / perByte)] ?? 0;
    const shift = (perByte - 1 - (i % perByte)) * plate.bits;
    const colour = colours[(byte >> shift) & mask] ?? colours[0]!;
    img.data[i * 4] = colour[0];
    img.data[i * 4 + 1] = colour[1];
    img.data[i * 4 + 2] = colour[2];
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);

  const url = canvas.toDataURL('image/png');
  urls.set(era.id, url);
  return url;
}

/** One line of provenance: what it is, when, and who to thank. Shown wherever a plate is. */
export function plateCredit(era: EraTheme): string | null {
  const p = plateFor(era);
  return p ? `${p.caption}, ${p.year} · ${p.credit}` : null;
}

function decode(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function rgba(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

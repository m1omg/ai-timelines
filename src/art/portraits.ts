import { cursor, hashString, next, range } from '../engine/rng';
import type { Character } from '../engine/types';
import type { EraTheme } from './palette';

/**
 * Portraits are drawn as horizontal scanlines across a head-and-shoulders silhouette.
 *
 * This is a deliberate design decision rather than a shortcut. The game depicts real people,
 * and a raster-scan abstraction is unmistakably a diagram of a person rather than a picture of
 * one — there is no face to get wrong and no likeness to misrepresent. It also happens to be
 * exactly the right texture for an interface pretending to be a cathode ray tube, and the
 * scan pitch tightening from act to act is free thematic work.
 */

const W = 200;
const H = 240;

interface Shape {
  cx: number;
  headY: number;
  headR: number;
  jaw: number;
  neckY: number;
  shoulderY: number;
  shoulderW: number;
}

/** Silhouette half-width at a given y, or 0 outside the figure. */
function halfWidth(s: Shape, y: number, look: Character['look'], jitter: number): number {
  // Shoulders and torso.
  if (y >= s.shoulderY) {
    const t = (y - s.shoulderY) / (H - s.shoulderY);
    const broad = look.build === 'broad' ? 1.16 : look.build === 'round' ? 1.1 : 1;
    return s.shoulderW * broad * Math.min(1, 0.45 + Math.sqrt(t) * 1.05);
  }
  // Neck.
  if (y >= s.neckY) {
    const t = (y - s.neckY) / (s.shoulderY - s.neckY);
    return s.headR * (0.36 + t * 0.22);
  }
  // Head: an ellipse, narrowed toward the jaw.
  const dy = (y - s.headY) / (s.headR * s.jaw);
  if (Math.abs(dy) > 1) return 0;
  let w = s.headR * Math.sqrt(1 - dy * dy);
  if (dy > 0.25) w *= 1 - (dy - 0.25) * 0.32; // taper to the chin
  if (look.build === 'round') w *= 1.08;
  return w + jitter;
}

/** Extra mass for hair, drawn as a second silhouette that only exists near the crown. */
function hairWidth(s: Shape, y: number, look: Character['look'], rnd: () => number): number {
  const style = look.hair ?? 'short';
  if (style === 'bald') return 0;
  const top = s.headY - s.headR * s.jaw;
  const dy = y - top;
  if (dy < -6) return 0;

  const cap = s.headR * 1.12;
  switch (style) {
    case 'short':
      return dy < s.headR * 0.72 ? cap * (0.7 + 0.3 * Math.sin((dy / (s.headR * 0.72)) * Math.PI)) : 0;
    case 'tied':
      return dy < s.headR * 0.9 ? cap * 0.98 : 0;
    case 'long':
      return dy < s.headR * 2.4 ? cap * (dy < s.headR ? 1 : 0.86) : 0;
    case 'wild':
      return dy < s.headR * 1.05 ? cap * (1.05 + rnd() * 0.42) : 0;
    default:
      return 0;
  }
}

function facialWidth(s: Shape, y: number, look: Character['look']): number {
  const kind = look.facial ?? 'none';
  if (kind === 'none') return 0;
  const chin = s.headY + s.headR * s.jaw;
  if (kind === 'moustache') {
    return y > s.headY + s.headR * 0.24 && y < s.headY + s.headR * 0.42 ? s.headR * 0.44 : 0;
  }
  if (y < s.headY + s.headR * 0.18 || y > chin + 10) return 0;
  const t = (y - (s.headY + s.headR * 0.18)) / (chin + 10 - (s.headY + s.headR * 0.18));
  return s.headR * (0.86 - t * 0.34);
}

export function portraitSvg(c: Character, era: EraTheme, size = 200): string {
  const rc = cursor(hashString(c.id) ^ Math.round(c.portraitSeed * 977));
  const rnd = () => next(rc);

  const accent = c.look.accent ?? era.accent;
  const shape: Shape = {
    cx: W / 2 + range(rc, -4, 4),
    headY: 82,
    headR: 40 + range(rc, -3, 4),
    jaw: 1.2,
    neckY: 82 + 40 * 1.2 - 6,
    shoulderY: 148,
    shoulderW: 72 + range(rc, -5, 8),
  };

  const step = Math.max(1.0, era.scan);
  const lines: string[] = [];
  const hairLines: string[] = [];

  for (let y = 18; y < H; y += step) {
    const jitter = (rnd() - 0.5) * (era.grain * 4);
    const w = halfWidth(shape, y, c.look, jitter);
    const hw = hairWidth(shape, y, c.look, rnd);
    const fw = facialWidth(shape, y, c.look);

    const outer = Math.max(w, hw, fw);
    if (outer <= 0.5) continue;

    // Body of the figure, opacity dropping toward the bottom so it fades into the panel.
    const fade = y > shape.shoulderY ? Math.max(0.12, 1 - (y - shape.shoulderY) / 120) : 1;
    if (w > 0.5) {
      const op = (0.45 + rnd() * 0.35) * fade;
      lines.push(
        `<line x1="${(shape.cx - w).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(shape.cx + w).toFixed(1)}" y2="${y.toFixed(1)}" stroke-opacity="${op.toFixed(2)}"/>`,
      );
    }
    if (hw > w) {
      hairLines.push(
        `<line x1="${(shape.cx - hw).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(shape.cx - w).toFixed(1)}" y2="${y.toFixed(1)}"/>` +
          `<line x1="${(shape.cx + w).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(shape.cx + hw).toFixed(1)}" y2="${y.toFixed(1)}"/>`,
      );
      if (w <= 0.5) {
        hairLines.push(
          `<line x1="${(shape.cx - hw).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(shape.cx + hw).toFixed(1)}" y2="${y.toFixed(1)}"/>`,
        );
      }
    }
    if (fw > 0.5 && fw <= w) {
      hairLines.push(
        `<line x1="${(shape.cx - fw).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(shape.cx + fw).toFixed(1)}" y2="${y.toFixed(1)}" stroke-opacity="0.5"/>`,
      );
    }
  }

  // The eye band: one interruption in the scan, which is all the face anyone needs.
  const eyeY = shape.headY - shape.headR * 0.12;
  const eyeW = shape.headR * 0.62;
  const band = `<rect x="${(shape.cx - eyeW).toFixed(1)}" y="${(eyeY - 3.5).toFixed(1)}" width="${(eyeW * 2).toFixed(1)}" height="7" fill="${era.paper}" opacity="0.8"/>`;

  const glasses = c.look.glasses
    ? `<g fill="none" stroke="${accent}" stroke-width="2" opacity="0.9">
         <circle cx="${(shape.cx - eyeW * 0.55).toFixed(1)}" cy="${eyeY.toFixed(1)}" r="${(shape.headR * 0.28).toFixed(1)}"/>
         <circle cx="${(shape.cx + eyeW * 0.55).toFixed(1)}" cy="${eyeY.toFixed(1)}" r="${(shape.headR * 0.28).toFixed(1)}"/>
         <line x1="${(shape.cx - eyeW * 0.27).toFixed(1)}" y1="${eyeY.toFixed(1)}" x2="${(shape.cx + eyeW * 0.27).toFixed(1)}" y2="${eyeY.toFixed(1)}"/>
       </g>`
    : '';

  return `<svg viewBox="0 0 ${W} ${H}" width="${size}" height="${(size * H) / W}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Stylised scanline portrait of ${escapeAttr(c.name)}">
  <rect width="${W}" height="${H}" fill="none"/>
  <g stroke="${accent}" stroke-width="${Math.max(1, step - 0.9).toFixed(2)}" stroke-linecap="butt">${lines.join('')}</g>
  <g stroke="${accent}" stroke-width="${Math.max(1, step - 0.9).toFixed(2)}" stroke-opacity="0.82">${hairLines.join('')}</g>
  ${band}
  ${glasses}
</svg>`;
}

/**
 * The interface's own portrait: no figure, just a signal. Used for system lines and for the
 * two characters who are not, strictly speaking, people.
 */
export function signalSvg(era: EraTheme, seed: number, size = 200): string {
  const rc = cursor(seed);
  const rows: string[] = [];
  for (let y = 24; y < H - 24; y += era.scan * 1.6) {
    const w = 20 + next(rc) * 74;
    const x = W / 2 - w / 2 + (next(rc) - 0.5) * 26;
    rows.push(
      `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x + w).toFixed(1)}" y2="${y.toFixed(1)}" stroke-opacity="${(0.2 + next(rc) * 0.7).toFixed(2)}"/>`,
    );
  }
  return `<svg viewBox="0 0 ${W} ${H}" width="${size}" height="${(size * H) / W}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A signal, not a face">
  <g stroke="${era.accent}" stroke-width="${Math.max(1, era.scan - 0.6).toFixed(2)}">${rows.join('')}</g>
</svg>`;
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

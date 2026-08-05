import { cursor, next, range } from '../engine/rng';
import { hashString } from '../engine/rng';
import type { BackdropId } from '../engine/types';
import type { EraTheme } from './palette';

/**
 * Backdrops are generated, not drawn: a horizon, a few structural masses, and a population of
 * era-appropriate silhouettes. Everything is built from rectangles and lines so that it reads
 * correctly at any size and costs nothing to ship.
 */

const W = 1200;
const H = 520;

interface Ctx {
  rc: { rng: number };
  era: EraTheme;
  out: string[];
}

function rect(c: Ctx, x: number, y: number, w: number, h: number, fill: string, op = 1): void {
  c.out.push(
    `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0, w).toFixed(1)}" height="${Math.max(0, h).toFixed(1)}" fill="${fill}" opacity="${op}"/>`,
  );
}

function line(c: Ctx, x1: number, y1: number, x2: number, y2: number, stroke: string, op = 1, w = 1): void {
  c.out.push(
    `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${stroke}" stroke-width="${w}" opacity="${op}"/>`,
  );
}

/**
 * A cabinet: the universal unit of twentieth-century computing furniture.
 *
 * Drawn as an outline with a very faint fill rather than a solid mass — the backdrop has to
 * sit behind dialogue text without competing with it, and a schematic reads better on a CRT
 * skin than a silhouette does.
 */
function cabinet(c: Ctx, x: number, baseY: number, w: number, h: number, op: number): void {
  const ink = c.era.ink;
  rect(c, x, baseY - h, w, h, ink, op * 0.14);
  c.out.push(
    `<rect x="${x.toFixed(1)}" y="${(baseY - h).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="none" stroke="${ink}" stroke-opacity="${(op * 0.55).toFixed(2)}"/>`,
  );
  const rows = Math.floor(h / 26);
  for (let i = 1; i < rows; i++) {
    const y = baseY - h + i * 26;
    line(c, x + 4, y, x + w - 4, y, ink, op * 0.3);
    // Panel lamps, blinking is done in CSS.
    const lamps = Math.floor(w / 22);
    for (let j = 0; j < lamps; j++) {
      if (next(c.rc) > 0.62) {
        c.out.push(
          `<rect class="lamp" x="${(x + 8 + j * 22).toFixed(1)}" y="${(y - 9).toFixed(1)}" width="5" height="5" fill="${c.era.accent}" opacity="${(op * (0.35 + next(c.rc) * 0.6)).toFixed(2)}"/>`,
        );
      }
    }
  }
}

function rackRow(c: Ctx, baseY: number, count: number, depth: number): void {
  const op = 1 - depth * 0.22;
  const w = W / count;
  for (let i = 0; i < count; i++) {
    const h = range(c.rc, 90, 190) * (1 - depth * 0.12);
    cabinet(c, i * w + 6, baseY, w - 14, h, op);
  }
}

function floorGrid(c: Ctx, y: number): void {
  const ink = c.era.ink;
  for (let i = 0; i <= 22; i++) {
    const x = (i / 22) * W;
    line(c, W / 2 + (x - W / 2) * 0.18, y, x, H, ink, 0.16);
  }
  for (let i = 1; i < 7; i++) {
    const yy = y + Math.pow(i / 7, 1.8) * (H - y);
    line(c, 0, yy, W, yy, ink, 0.14);
  }
}

function windowWall(c: Ctx, y: number, cols: number, rows: number): void {
  const ink = c.era.ink;
  rect(c, 0, 0, W, y, ink, 0.1);
  const cw = W / cols;
  const rh = y / rows;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (next(c.rc) > 0.45) continue;
      rect(c, i * cw + 8, j * rh + 8, cw - 16, rh - 16, c.era.accent, 0.06 + next(c.rc) * 0.16);
    }
  }
  for (let i = 0; i <= cols; i++) line(c, i * cw, 0, i * cw, y, ink, 0.3);
  for (let j = 0; j <= rows; j++) line(c, 0, j * rh, W, j * rh, ink, 0.3);
}

function figures(c: Ctx, baseY: number, n: number): void {
  for (let i = 0; i < n; i++) {
    const x = range(c.rc, 80, W - 80);
    const s = range(c.rc, 0.8, 1.15);
    const h = 96 * s;
    c.out.push(
      `<g opacity="0.55" fill="${c.era.ink}">` +
        `<ellipse cx="${x.toFixed(1)}" cy="${(baseY - h).toFixed(1)}" rx="${(11 * s).toFixed(1)}" ry="${(13 * s).toFixed(1)}"/>` +
        `<path d="M ${(x - 20 * s).toFixed(1)} ${baseY.toFixed(1)} q ${(20 * s).toFixed(1)} ${(-72 * s).toFixed(1)} ${(40 * s).toFixed(1)} 0 Z"/>` +
        `</g>`,
    );
  }
}

function haze(c: Ctx): void {
  c.out.push(
    `<rect width="${W}" height="${H}" fill="url(#bdGlow)" opacity="0.5"/>`,
  );
}

function draw(id: BackdropId, c: Ctx): void {
  const { era } = c;
  switch (id) {
    case 'void': {
      // Deliberately almost empty — but not *nothing*, which reads as a failed render.
      for (let i = 0; i < 7; i++) {
        const r = 60 + i * 78;
        c.out.push(
          `<circle cx="${W / 2}" cy="${H / 2}" r="${r}" fill="none" stroke="${era.accent}" stroke-opacity="${(0.16 - i * 0.02).toFixed(3)}"/>`,
        );
      }
      for (let i = 0; i < 60; i++) {
        rect(c, range(c.rc, 0, W), range(c.rc, 0, H), 2, 2, era.accent, 0.05 + next(c.rc) * 0.16);
      }
      break;
    }

    case 'lab-valve':
      windowWall(c, 190, 8, 2);
      floorGrid(c, 340);
      rackRow(c, 360, 5, 0.4);
      rackRow(c, 430, 3, 0);
      figures(c, 470, 2);
      break;

    case 'lecture-hall':
      rect(c, 90, 40, W - 180, 210, era.ink, 0.3);
      for (let i = 0; i < 16; i++) {
        line(c, 120 + i * 8, 70, 120 + i * 8, 230, era.paper, 0.1);
      }
      floorGrid(c, 300);
      for (let r = 0; r < 4; r++) {
        const y = 330 + r * 48;
        rect(c, 40 + r * 12, y, W - 80 - r * 24, 16, era.ink, 0.5 - r * 0.08);
        figures(c, y, 3);
      }
      break;

    case 'machine-room':
      floorGrid(c, 250);
      rackRow(c, 300, 7, 0.6);
      rackRow(c, 380, 5, 0.25);
      rackRow(c, 470, 4, 0);
      figures(c, 480, 1);
      break;

    case 'workshop':
      floorGrid(c, 300);
      rect(c, 60, 300, 460, 18, era.ink, 0.8);
      rect(c, 640, 320, 500, 18, era.ink, 0.8);
      for (let i = 0; i < 14; i++) {
        const x = range(c.rc, 70, W - 90);
        const h = range(c.rc, 18, 74);
        rect(c, x, (x < 560 ? 300 : 320) - h, range(c.rc, 22, 70), h, era.ink, 0.25);
      }
      figures(c, 430, 2);
      break;

    case 'corridor':
      for (let i = 0; i < 9; i++) {
        const t = i / 9;
        const inset = t * 420;
        rect(c, inset, 40 + t * 130, W - inset * 2, H - 80 - t * 200, 'none', 0);
        c.out.push(
          `<rect x="${inset.toFixed(1)}" y="${(40 + t * 130).toFixed(1)}" width="${(W - inset * 2).toFixed(1)}" height="${(H - 80 - t * 210).toFixed(1)}" fill="none" stroke="${era.ink}" stroke-opacity="${(0.35 - t * 0.03).toFixed(2)}"/>`,
        );
      }
      figures(c, 430, 1);
      break;

    case 'committee':
      windowWall(c, 150, 5, 1);
      rect(c, 150, 300, W - 300, 26, era.ink, 0.4);
      rect(c, 150, 326, W - 300, 10, era.ink, 0.4);
      for (let i = 0; i < 7; i++) {
        const x = 200 + i * ((W - 400) / 6);
        c.out.push(
          `<g opacity="0.6" fill="${era.ink}"><ellipse cx="${x.toFixed(1)}" cy="252" rx="13" ry="15"/><path d="M ${(x - 24).toFixed(1)} 300 q 24 -62 48 0 Z"/></g>`,
        );
      }
      floorGrid(c, 340);
      break;

    case 'terminal-room':
      floorGrid(c, 260);
      for (let r = 0; r < 3; r++) {
        const y = 300 + r * 74;
        for (let i = 0; i < 5 + r; i++) {
          const x = 60 + i * ((W - 160) / (5 + r));
          rect(c, x, y - 44, 62, 44, era.ink, 0.3 - r * 0.06);
          rect(c, x + 6, y - 38, 50, 30, era.accent, 0.14 + next(c.rc) * 0.2);
        }
      }
      break;

    case 'cleanroom':
      rect(c, 0, 0, W, H, era.accent, 0.04);
      windowWall(c, 240, 6, 2);
      floorGrid(c, 300);
      for (let i = 0; i < 5; i++) {
        const x = 80 + i * 220;
        rect(c, x, 200, 170, 130, era.ink, 0.2);
        rect(c, x + 20, 220, 130, 60, era.accent, 0.12);
      }
      break;

    case 'server-floor':
      floorGrid(c, 220);
      rackRow(c, 300, 12, 0.7);
      rackRow(c, 400, 9, 0.35);
      rackRow(c, 500, 7, 0);
      break;

    case 'datacenter-vast':
      floorGrid(c, 170);
      for (let d = 0; d < 6; d++) {
        rackRow(c, 240 + d * 56, 18 - d, 0.85 - d * 0.14);
      }
      haze(c);
      break;

    case 'city-night':
      rect(c, 0, 0, W, 330, era.ink, 0.08);
      for (let i = 0; i < 40; i++) {
        const w = range(c.rc, 26, 80);
        const h = range(c.rc, 60, 300);
        const x = range(c.rc, -40, W);
        rect(c, x, 330 - h, w, h, era.ink, 0.18 + next(c.rc) * 0.3);
        for (let j = 0; j < h / 22; j++) {
          if (next(c.rc) > 0.6) {
            rect(c, x + 5, 330 - h + 8 + j * 22, w - 10, 6, era.accent, 0.25 + next(c.rc) * 0.5);
          }
        }
      }
      floorGrid(c, 330);
      break;

    case 'observatory':
      c.out.push(
        `<circle cx="${W / 2}" cy="240" r="200" fill="none" stroke="${era.ink}" stroke-opacity="0.4"/>`,
        `<circle cx="${W / 2}" cy="240" r="140" fill="none" stroke="${era.ink}" stroke-opacity="0.25"/>`,
        `<circle cx="${W / 2}" cy="240" r="80" fill="${era.accent}" opacity="0.08"/>`,
      );
      for (let i = 0; i < 120; i++) {
        const x = range(c.rc, 0, W);
        const y = range(c.rc, 0, 380);
        rect(c, x, y, 2, 2, era.accent, 0.15 + next(c.rc) * 0.6);
      }
      floorGrid(c, 400);
      figures(c, 470, 1);
      break;

    case 'ruins':
      floorGrid(c, 300);
      for (let i = 0; i < 9; i++) {
        const x = range(c.rc, 20, W - 120);
        const h = range(c.rc, 40, 210);
        const w = range(c.rc, 40, 120);
        rect(c, x, 300 - h, w, h, era.ink, 0.16 + next(c.rc) * 0.2);
        rect(c, x, 300 - h, w, range(c.rc, 6, 26), era.paper, 0.4);
      }
      break;

    case 'garden':
      rect(c, 0, 0, W, 300, era.accent, 0.05);
      for (let i = 0; i < 26; i++) {
        const x = range(c.rc, 0, W);
        const y = range(c.rc, 250, 420);
        const r = range(c.rc, 18, 62);
        c.out.push(
          `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${era.ink}" opacity="${(0.12 + next(c.rc) * 0.2).toFixed(2)}"/>`,
        );
      }
      floorGrid(c, 340);
      break;

    case 'archive':
      for (let r = 0; r < 5; r++) {
        const y = 90 + r * 84;
        rect(c, 0, y, W, 8, era.ink, 0.6);
        for (let i = 0; i < 70; i++) {
          const x = i * (W / 70) + range(c.rc, 0, 6);
          rect(c, x, y - range(c.rc, 26, 58), range(c.rc, 4, 11), 58, era.ink, 0.14 + next(c.rc) * 0.28);
        }
      }
      break;
  }
}

export function backdropSvg(id: BackdropId, era: EraTheme, seed: string): string {
  const c: Ctx = { rc: cursor(hashString(id + seed + era.id)), era, out: [] };
  draw(id, c);

  const grain =
    era.grain > 0.01
      ? `<rect width="${W}" height="${H}" filter="url(#bdGrain)" opacity="${era.grain * 0.5}"/>`
      : '';

  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <radialGradient id="bdGlow" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="${era.accent}" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="${era.paper}" stop-opacity="0"/>
    </radialGradient>
    <filter id="bdGrain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2"/></filter>
  </defs>
  ${c.out.join('\n  ')}
  ${grain}
</svg>`;
}

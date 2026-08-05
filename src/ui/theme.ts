import { eraForAct, type EraTheme } from '../art/palette';

let current: EraTheme | null = null;

export function currentEra(): EraTheme {
  return current ?? eraForAct(1);
}

/** Push an era's palette into the CSS custom properties the whole interface reads from. */
export function applyEra(act: number): EraTheme {
  const era = eraForAct(act);
  const root = document.documentElement;
  root.dataset.era = era.id;
  root.style.setProperty('--ink', era.ink);
  root.style.setProperty('--paper', era.paper);
  root.style.setProperty('--dim', era.dim);
  root.style.setProperty('--accent', era.accent);
  root.style.setProperty('--warn', era.warn);
  root.style.setProperty('--radius', `${era.radius}px`);
  root.style.setProperty('--grain', String(era.grain));
  root.style.setProperty(
    'color-scheme',
    isDark(era.paper) ? 'dark' : 'light',
  );
  current = era;
  return era;
}

function isDark(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 128;
}

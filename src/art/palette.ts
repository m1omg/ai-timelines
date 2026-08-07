/**
 * Era themes. The interface ages with the century: what you are looking at in 1954 is not the
 * same *kind of object* as what you are looking at in 2046, and the game says so by changing
 * out from under you at each act break.
 *
 * The CSS variables are set on <html data-era="..."> by src/ui/theme.ts; the numbers here are
 * for the SVG generators, which cannot read custom properties.
 */

export interface EraTheme {
  id: string;
  /** Act this theme belongs to, 1-based. */
  act: number;
  name: string;
  /** Very short description shown during the act-break transition. */
  device: string;
  ink: string;
  paper: string;
  dim: string;
  accent: string;
  warn: string;
  /** Portrait scanline spacing in SVG units. Coarse early, fine late. */
  scan: number;
  /** Extra visual noise, 0..1. */
  grain: number;
  /** Rounded corners on panels. */
  radius: number;
  /**
   * Colours the era's plate is painted in, darkest first, one per stored tone — see
   * src/art/plates.ts. Written out rather than derived from ink/paper/accent because the
   * ordering that makes a photograph read is luminance, and an era's accent is not reliably
   * anywhere in particular on that scale. Absent for an era with no plate.
   */
  plateRamp?: string[];
}

export const ERAS: EraTheme[] = [
  {
    id: 'teletype',
    act: 1,
    name: 'Teleprinter',
    device: 'Model 28 teleprinter · fanfold paper · 10 characters per inch',
    ink: '#1b1714',
    paper: '#e8e2d2',
    dim: '#8c8271',
    accent: '#8a3b1e',
    warn: '#a03a22',
    scan: 3.4,
    grain: 0.22,
    radius: 0,
    plateRamp: ['#221c17', '#e8e2d2'],
  },
  {
    id: 'phosphor',
    act: 2,
    name: 'Storage Tube',
    device: 'Direct-view storage tube · P31 phosphor · 1200 baud',
    ink: '#7dfba8',
    paper: '#040b06',
    dim: '#2f7a4c',
    accent: '#b6ffcf',
    warn: '#ffcf6a',
    scan: 2.8,
    grain: 0.3,
    radius: 2,
    plateRamp: ['#040b06', '#2f7a4c', '#7dfba8', '#c8ffdc'],
  },
  {
    /*
     * CGA in mode 5: 320 × 200, four colours, and no choice about which four. The palette is
     * black plus the high-intensity cyan/red/white set — the one every game that wanted to look
     * serious used, because the alternative was magenta. `dim` is that same cyan at low
     * intensity, which is the one thing the hardware would actually let you vary.
     */
    id: 'cga',
    act: 3,
    name: 'Colour Adapter',
    device: 'Colour graphics adapter · mode 5 · 320 × 200 · black, cyan, red, white',
    ink: '#ffffff',
    paper: '#000000',
    dim: '#00aaaa',
    accent: '#55ffff',
    warn: '#ff5555',
    scan: 2.4,
    grain: 0.18,
    radius: 0,
    plateRamp: ['#000000', '#ff5555', '#55ffff', '#ffffff'],
  },
  {
    id: 'web',
    act: 4,
    name: 'Browser',
    device: 'Rendering engine · 1024 × 768 · thousands of colours',
    ink: '#1c2431',
    paper: '#eef1f6',
    dim: '#7a879b',
    accent: '#1c62c8',
    warn: '#c23a2a',
    scan: 2.0,
    grain: 0.06,
    radius: 6,
    plateRamp: ['#1c2431', '#5b6a80', '#a9b6c8', '#eef1f6'],
  },
  {
    id: 'glass',
    act: 5,
    name: 'Panel',
    device: 'High-density display · sixteen million colours · sixty frames',
    ink: '#e6ecf5',
    paper: '#0d1117',
    dim: '#6f7b8c',
    accent: '#4fb8ff',
    warn: '#ff7a5c',
    scan: 1.7,
    grain: 0.05,
    radius: 12,
    plateRamp: ['#0d1117', '#2f4459', '#7fa3c4', '#e6ecf5'],
  },
  {
    id: 'ambient',
    act: 6,
    name: 'Ambient Surface',
    device: 'Surface-integrated display · no fixed resolution · always on',
    ink: '#efeae2',
    paper: '#14100e',
    dim: '#8a7f74',
    accent: '#e3a15a',
    warn: '#e0644a',
    scan: 1.4,
    grain: 0.03,
    radius: 18,
    plateRamp: ['#14100e', '#4a3a2c', '#b08558', '#efeae2'],
  },
  {
    id: 'lucid',
    act: 7,
    name: '—',
    device: 'No device is specified. You are not certain there is one.',
    ink: '#f4f6f8',
    paper: '#05070a',
    dim: '#4a5866',
    accent: '#ffffff',
    warn: '#ff9d7a',
    scan: 1.1,
    grain: 0.0,
    radius: 0,
  },
];

export function eraForAct(act: number): EraTheme {
  return ERAS[Math.max(0, Math.min(ERAS.length - 1, act - 1))]!;
}

/** Family hue → a concrete colour, tuned per era so the tree stays legible on every skin. */
export function familyColour(hue: number, era: EraTheme): string {
  const dark = era.paper.length === 7 && luminance(era.paper) < 0.35;
  return `hsl(${hue} ${dark ? 62 : 55}% ${dark ? 62 : 42}%)`;
}

function luminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * All sound is synthesised. No audio files ship with the game, which keeps the build
 * self-contained and lets the palette of noises age with the interface the way the visuals do:
 * relay clicks in 1954, a modem handshake in 1998, almost nothing at all by 2046.
 */

let ctx: AudioContext | null = null;
let enabled = false;

export function audioEnabled(): boolean {
  return enabled;
}

export function setAudioEnabled(on: boolean): void {
  enabled = on;
  if (on && !ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      enabled = false;
    }
  }
  void ctx?.resume();
}

function env(node: AudioNode, attack: number, decay: number, peak: number): GainNode {
  const g = ctx!.createGain();
  const t = ctx!.currentTime;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  node.connect(g);
  g.connect(ctx!.destination);
  return g;
}

function tone(freq: number, dur: number, type: OscillatorType, peak = 0.05): void {
  if (!enabled || !ctx) return;
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.value = freq;
  env(o, 0.006, dur, peak);
  o.start();
  o.stop(ctx.currentTime + dur + 0.02);
}

function noise(dur: number, peak: number, filterHz: number): void {
  if (!enabled || !ctx) return;
  const n = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = filterHz;
  src.connect(f);
  env(f, 0.004, dur, peak);
  src.start();
}

/** Era-flavoured keystroke, called once per few characters while text types out. */
export function sfxType(eraIndex: number): void {
  if (!enabled) return;
  if (eraIndex <= 1) {
    noise(0.035, 0.05, 1800 + Math.random() * 900); // typebar strike
  } else if (eraIndex <= 3) {
    tone(1100 + Math.random() * 260, 0.018, 'square', 0.014);
  } else if (eraIndex <= 5) {
    tone(2200 + Math.random() * 400, 0.012, 'sine', 0.01);
  } else {
    tone(3400, 0.008, 'sine', 0.005);
  }
}

export function sfxSelect(): void {
  tone(660, 0.07, 'triangle', 0.045);
  tone(990, 0.05, 'triangle', 0.02);
}

export function sfxAdvance(): void {
  tone(180, 0.42, 'sawtooth', 0.035);
  tone(270, 0.36, 'sine', 0.025);
}

export function sfxBreakthrough(): void {
  const base = 440;
  [1, 1.26, 1.5, 2].forEach((m, i) => {
    setTimeout(() => tone(base * m, 0.34, 'sine', 0.04), i * 70);
  });
}

export function sfxCrisis(): void {
  tone(110, 0.9, 'sawtooth', 0.06);
  noise(0.7, 0.05, 320);
}

export function sfxActBreak(eraIndex: number): void {
  if (eraIndex <= 1) {
    noise(0.5, 0.08, 900);
  } else if (eraIndex === 3) {
    // A dial-up handshake, roughly.
    [980, 1180, 1650, 2100].forEach((f, i) => setTimeout(() => tone(f, 0.22, 'sine', 0.03), i * 180));
  } else {
    tone(220, 1.2, 'sine', 0.04);
    tone(330, 1.0, 'sine', 0.02);
  }
}

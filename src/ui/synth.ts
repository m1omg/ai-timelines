import { barSeconds, composeBar, eraVoice, type EraVoice, type Note, type ScoreParams } from './score';

/**
 * Turning notes into sound.
 *
 * Every function here takes a BaseAudioContext rather than reaching for a global one, which is
 * not fussiness: it means the live game and the offline renderer that bounces a bar to a WAV run
 * exactly the same code, so what gets checked is what gets heard.
 */

export interface Rig {
  ctx: BaseAudioContext;
  /** Everything lands here; the caller owns the master gain and where it goes. */
  out: AudioNode;
  /** Feedback delay for the eras that have one. */
  echo: GainNode | null;
  /** The era's band limit, held so accumulated consequence can close it down over a turn. */
  band: BiquadFilterNode;
  /**
   * 0..1, how far the top of the spectrum has been pulled out. Read per note as well as by the
   * band filter, so a dull century is dull in the notes and not merely behind a blanket.
   */
  dull: number;
}

export function buildRig(ctx: BaseAudioContext, destination: AudioNode, voice: EraVoice): Rig {
  const out = ctx.createGain();
  out.gain.value = voice.mix;

  const band = ctx.createBiquadFilter();
  band.type = 'lowpass';
  band.frequency.value = voice.tone;
  band.Q.value = 0.6;
  band.connect(out);
  out.connect(destination);

  let echo: GainNode | null = null;
  const [time, feedback] = voice.echo;
  if (time > 0) {
    const delay = ctx.createDelay(2);
    delay.delayTime.value = time;
    const fb = ctx.createGain();
    fb.gain.value = feedback;
    const send = ctx.createGain();
    send.gain.value = 0.36;
    send.connect(delay);
    delay.connect(fb);
    fb.connect(delay);
    delay.connect(band);
    echo = send;
  }

  return { ctx, out: band, echo, band, dull: 0 };
}

/**
 * Close the mix down, or open it back up, over a couple of seconds.
 *
 * A turn is four years; the change should arrive like a season rather than a switch, and a
 * cutoff that jumps is audible as a click on every sustained note still ringing.
 */
export function setDullness(rig: Rig, voice: EraVoice, dull: number, when: number): void {
  rig.dull = Math.max(0, Math.min(1, dull));
  const target = voice.tone * (1 - rig.dull * 0.62);
  rig.band.frequency.cancelScheduledValues(when);
  rig.band.frequency.setValueAtTime(rig.band.frequency.value, when);
  rig.band.frequency.linearRampToValueAtTime(Math.max(500, target), when + 2.5);
}

/**
 * The hiss, relay chatter or fan of the era, under everything. Returns the source so the caller
 * can stop it: an act break builds a new rig, and a floor left running under the old one is a
 * room that gets noisier every act.
 */
export function startFloor(rig: Rig, voice: EraVoice, when: number, dur: number): AudioBufferSourceNode | null {
  if (voice.floor <= 0.001) return null;
  const { ctx } = rig;
  const frames = Math.max(1, Math.floor(ctx.sampleRate * Math.min(dur, 4)));
  const buf = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < frames; i++) {
    // Brown-ish noise: white noise is a hiss, but a room is mostly low frequencies.
    last = (last + (Math.random() * 2 - 1) * 0.06) * 0.985;
    data[i] = last;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const g = ctx.createGain();
  g.gain.value = voice.floor;
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = voice.id === 'teletype' ? 3000 : 900;
  src.connect(f);
  f.connect(g);
  g.connect(rig.out);
  src.start(when);
  src.stop(when + dur);
  return src;
}

/**
 * Percussion, synthesised per hit. A kick is a sine whose pitch falls off a cliff; a hat is a
 * short burst of noise through a high pass. Both are era-scaled by the note's own frequency,
 * so the same code gives relay chatter in 1954 and a sub kick in 2030.
 */
function playPerc(rig: Rig, voice: EraVoice, note: Note, when: number): void {
  const { ctx } = rig;
  const start = when + note.at;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, note.gain), start + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, start + note.dur);
  g.connect(rig.out);

  if (note.freq > voice.root * 3) {
    // A hat: noise, high-passed, very short.
    const frames = Math.max(1, Math.floor(ctx.sampleRate * note.dur));
    const buf = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = voice.id === 'teletype' ? 2200 : 5200;
    // A hat is the brightest thing in the bar and the first thing a dulled mix loses. It carries
    // most of the change in the early eras, whose square waves keep their energy low down and so
    // have very little top end for the band filter to take.
    g.gain.value = Math.max(0.0001, g.gain.value * (1 - rig.dull * 0.9));
    src.connect(hp);
    hp.connect(g);
    src.start(start);
    return;
  }

  const osc = ctx.createOscillator();
  osc.type = voice.id === 'cga' || voice.id === 'teletype' ? 'square' : 'sine';
  osc.frequency.setValueAtTime(note.freq * 2.2, start);
  osc.frequency.exponentialRampToValueAtTime(Math.max(24, note.freq * 0.6), start + note.dur * 0.7);
  osc.connect(g);
  osc.start(start);
  osc.stop(start + note.dur + 0.02);
}

export function playNote(rig: Rig, voice: EraVoice, note: Note, when: number): void {
  const { ctx } = rig;
  if (note.role === 'perc') {
    playPerc(rig, voice, note, when);
    return;
  }

  const start = when + note.at;
  const dur = note.dur * (note.role === 'pad' ? Math.max(1, voice.sustain) : 1);
  const type =
    note.role === 'bass' ? voice.bass : note.role === 'pad' ? (voice.pad ?? voice.lead) : voice.lead;

  // Percussive early, endless late: one number does the whole century's worth of envelope.
  const attack = Math.min(0.4, 0.004 + voice.sustain * 0.09);
  const release = dur * (0.3 + voice.sustain * 0.4);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, note.gain), start + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, start + attack + release);

  /*
   * A filter that opens on the attack and closes as the note decays. This is the single thing
   * that most separates a synthesiser from an oscillator: without it every note has the same
   * spectrum for its whole length, which is what makes a long piece exhausting to listen to.
   */
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.Q.value = note.role === 'pad' ? 0.7 : 3.5;
  const openTo = Math.min(voice.tone, note.freq * voice.open) * (1 - rig.dull * 0.5);
  lp.frequency.setValueAtTime(Math.max(120, note.freq * 1.2), start);
  lp.frequency.linearRampToValueAtTime(Math.max(160, openTo), start + attack + release * 0.15);
  lp.frequency.exponentialRampToValueAtTime(Math.max(140, note.freq * 1.1), start + attack + release);
  lp.connect(g);

  // Unison: several oscillators a few cents apart. One is a test tone; three or four beat
  // against each other and become a chord of themselves, which is the whole of that sound.
  const count = note.role === 'bass' ? 1 : Math.max(1, voice.voices);
  for (let v = 0; v < count; v++) {
    const osc = ctx.createOscillator();
    osc.type = type;
    const spread = count === 1 ? 0 : ((v / (count - 1)) * 2 - 1) * (note.role === 'pad' ? 11 : 6);
    const detune = Math.pow(2, spread / 1200);

    if (note.glideFrom) {
      osc.frequency.setValueAtTime(note.glideFrom * detune, start);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, note.freq * detune), start + dur * 0.9);
    } else {
      osc.frequency.setValueAtTime(note.freq * detune, start);
      if (voice.drift > 0) {
        // Nothing analogue holds a pitch. The wobble is small and it is the difference between
        // an instrument and a signal generator.
        const off = note.freq * detune * Math.pow(2, (voice.drift * (Math.random() - 0.5)) / 1200);
        osc.frequency.linearRampToValueAtTime(off, start + dur);
      }
    }
    osc.connect(lp);
    osc.start(start);
    osc.stop(start + attack + release + 0.05);
  }

  // A sub an octave down under the bass, once the speakers of the era could reproduce it — and
  // only where the bass is high enough that an octave below it is still a note rather than a
  // rumble competing with the kick.
  if (note.role === 'bass' && voice.voices > 1 && note.freq > 70) {
    const sub = ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(note.freq / 2, start);
    const sg = ctx.createGain();
    sg.gain.setValueAtTime(0.0001, start);
    sg.gain.exponentialRampToValueAtTime(note.gain * 0.4, start + attack);
    sg.gain.exponentialRampToValueAtTime(0.0001, start + attack + release);
    sub.connect(sg);
    sg.connect(rig.out);
    sub.start(start);
    sub.stop(start + attack + release + 0.05);
  }

  g.connect(rig.out);
  if (rig.echo && note.role !== 'bass') g.connect(rig.echo);
}

export function playBar(rig: Rig, voice: EraVoice, notes: Note[], when: number): void {
  for (const note of notes) playNote(rig, voice, note, when);
}

/**
 * Render a stretch of the piece into an AudioBuffer. Used by the offline bouncer that produces
 * listening copies, and the only way to check that any of this makes a sound at all without a
 * pair of ears attached to the build.
 */
export async function renderPiece(
  params: Omit<ScoreParams, 'bar'>,
  bars: number,
  sampleRate = 44100,
): Promise<AudioBuffer> {
  const voice = eraVoice(params.era);
  const length = barSeconds(voice) * bars;
  const ctx = new OfflineAudioContext(1, Math.ceil(length * sampleRate), sampleRate);

  const master = ctx.createGain();
  master.gain.value = 0.9;
  const squash = ctx.createDynamicsCompressor();
  squash.threshold.value = -18;
  squash.ratio.value = 3;
  squash.attack.value = 0.01;
  squash.release.value = 0.25;
  master.connect(squash);
  squash.connect(ctx.destination);
  const rig = buildRig(ctx, master, voice);
  setDullness(rig, voice, params.exposure, 0);
  startFloor(rig, voice, 0, length);

  for (let bar = 0; bar < bars; bar++) {
    playBar(rig, voice, composeBar({ ...params, bar }), bar * barSeconds(voice));
  }
  return ctx.startRendering();
}

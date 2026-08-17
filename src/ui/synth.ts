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

  return { ctx, out: band, echo };
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

export function playNote(rig: Rig, voice: EraVoice, note: Note, when: number): void {
  const { ctx } = rig;
  const osc = ctx.createOscillator();
  osc.type = note.role === 'bass' ? voice.bass : note.role === 'pad' ? (voice.pad ?? voice.lead) : voice.lead;

  const start = when + note.at;
  const dur = note.dur * (note.role === 'pad' ? Math.max(1, voice.sustain) : 1);

  if (note.glideFrom) {
    osc.frequency.setValueAtTime(note.glideFrom, start);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, note.freq), start + dur * 0.9);
  } else {
    osc.frequency.setValueAtTime(note.freq, start);
    if (voice.drift > 0) {
      // Nothing analogue holds a pitch. The wobble is small and it is the difference between
      // an instrument and a signal generator.
      const off = note.freq * Math.pow(2, (voice.drift * (Math.random() - 0.5)) / 1200);
      osc.frequency.linearRampToValueAtTime(off, start + dur);
    }
  }

  // Percussive early, endless late: one number does the whole century's worth of envelope.
  const attack = Math.min(0.4, 0.004 + voice.sustain * 0.09);
  const release = dur * (0.3 + voice.sustain * 0.4);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, note.gain), start + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, start + attack + release);

  osc.connect(g);
  g.connect(rig.out);
  if (rig.echo && note.role !== 'bass') g.connect(rig.echo);

  osc.start(start);
  osc.stop(start + attack + release + 0.05);
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
  master.connect(ctx.destination);
  const rig = buildRig(ctx, master, voice);
  startFloor(rig, voice, 0, length);

  for (let bar = 0; bar < bars; bar++) {
    playBar(rig, voice, composeBar({ ...params, bar }), bar * barSeconds(voice));
  }
  return ctx.startRendering();
}

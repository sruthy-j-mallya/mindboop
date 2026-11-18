import type { ClickOptions, CompletionSoundId, SoundPlayer, TickOptions, ToneOptions } from "./types";

const SILENCE = 0.0001;
const ATTACK_SECONDS = 0.002;
const TAIL_SECONDS = 0.02; // Lets each envelope reach silence before its source stops.
const NOISE_SECONDS = 0.2;

let noiseBuffer: AudioBuffer | null = null;

// White noise for the clicks, made once. Any randomness will do; no two clicks need to differ.
const getNoiseBuffer = (context: AudioContext) => {
  if (noiseBuffer?.sampleRate === context.sampleRate) return noiseBuffer;

  const length = Math.floor(context.sampleRate * NOISE_SECONDS);
  noiseBuffer = context.createBuffer(1, length, context.sampleRate);
  // eslint-disable-next-line sonarjs/pseudo-random -- audio noise, not security
  const samples = Float32Array.from({ length }, () => Math.random() * 2 - 1);
  noiseBuffer.copyToChannel(samples, 0);

  return noiseBuffer;
};

// Fades `envelope` in over the attack, then exponentially down to silence `decay` seconds after `startsAt`.
const shapeEnvelope = (envelope: GainNode, gain: number, startsAt: number, decay: number) => {
  envelope.gain.setValueAtTime(0, startsAt);
  envelope.gain.linearRampToValueAtTime(gain, startsAt + ATTACK_SECONDS);
  envelope.gain.exponentialRampToValueAtTime(SILENCE, startsAt + decay);
};

const playOnce = (source: AudioScheduledSourceNode, output: AudioNode, startsAt: number, decay: number) => {
  source.onended = () => output.disconnect();
  source.start(startsAt);
  source.stop(startsAt + decay + TAIL_SECONDS);
};

const playTone = (
  context: AudioContext,
  startsAt: number,
  { frequency, endFrequency, wave = "sine", gain, decay }: ToneOptions,
) => {
  const oscillator = context.createOscillator();
  const envelope = context.createGain();
  oscillator.type = wave;
  oscillator.frequency.setValueAtTime(frequency, startsAt);
  if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, startsAt + decay);
  shapeEnvelope(envelope, gain, startsAt, decay);
  oscillator.connect(envelope).connect(context.destination);
  playOnce(oscillator, envelope, startsAt, decay);
};

const playClick = (
  context: AudioContext,
  startsAt: number,
  { frequency, filter = "bandpass", q = 1.2, gain, decay = 0.012 }: ClickOptions,
) => {
  const source = context.createBufferSource();
  const shaper = context.createBiquadFilter();
  const envelope = context.createGain();
  source.buffer = getNoiseBuffer(context);
  shaper.type = filter;
  shaper.frequency.value = frequency;
  shaper.Q.value = q;
  envelope.gain.setValueAtTime(gain, startsAt);
  envelope.gain.exponentialRampToValueAtTime(SILENCE, startsAt + decay);
  source.connect(shaper).connect(envelope).connect(context.destination);
  playOnce(source, envelope, startsAt, decay);
};

const playTick = (context: AudioContext, startsAt: number, { tone, click }: TickOptions) => {
  if (tone) playTone(context, startsAt, tone);
  if (click) playClick(context, startsAt, click);
};

// A soft bell note: a sine with a quiet octave above it.
const playChimeNote = (
  context: AudioContext,
  startsAt: number,
  frequency: number,
  gain: number,
  ring: number,
) => {
  playTone(context, startsAt, { frequency, gain, decay: ring });
  playTone(context, startsAt, { frequency: frequency * 2, gain: gain / 4, decay: ring });
};

// A struck bell's partials are inharmonic, and the higher ones die away sooner.
const BELL_FREQUENCY = 1318.51; // E6
const BELL_PARTIALS = [
  { ratio: 1, gain: 0.13, ring: 1.8 },
  { ratio: 2.76, gain: 0.045, ring: 0.9 },
  { ratio: 5.4, gain: 0.02, ring: 0.45 },
  { ratio: 8.93, gain: 0.008, ring: 0.25 },
];

const CRISP_TICK: TickOptions = {
  tone: { frequency: 2400, endFrequency: 1900, gain: 0.18, decay: 0.035 },
  click: { frequency: 4200, gain: 0.22, decay: 0.01 },
};

const WOOD_TICK = {
  tone: { gain: 0.3, decay: 0.06 },
  click: { frequency: 2600, q: 3, gain: 0.12, decay: 0.008 },
};

const SOFT_TICK: TickOptions = {
  tone: { frequency: 720, endFrequency: 560, wave: "triangle", gain: 0.22, decay: 0.045 },
  click: { frequency: 1400, filter: "lowpass", gain: 0.18, decay: 0.01 },
};

const GLASS_TICK = { gain: 0.1, decay: 0.14 };
const GLASS_CLICK: ClickOptions = { frequency: 6000, gain: 0.06, decay: 0.006 };

const TRIPLE_TICK_FREQUENCIES = [1900, 2300, 2800];
const TRIPLE_TICK_GAP_SECONDS = 0.06;

export const PLAYERS = new Map<CompletionSoundId, SoundPlayer>([
  [
    "rising",
    (context, startsAt) => {
      playTick(context, startsAt, {
        tone: { frequency: 1900, gain: 0.16, decay: 0.05 },
        click: { frequency: 3800, gain: 0.14 },
      });
      playTick(context, startsAt + 0.085, {
        tone: { frequency: 2540, gain: 0.16, decay: 0.07 },
        click: { frequency: 4600, gain: 0.14 },
      });
    },
  ],
  [
    "crisp",
    (context, startsAt) => {
      playTick(context, startsAt, CRISP_TICK);
      playTick(context, startsAt + 0.09, CRISP_TICK);
    },
  ],
  [
    "wood",
    (context, startsAt) => {
      playTick(context, startsAt, {
        ...WOOD_TICK,
        tone: { ...WOOD_TICK.tone, frequency: 1150, endFrequency: 820 },
      });
      playTick(context, startsAt + 0.1, {
        ...WOOD_TICK,
        tone: { ...WOOD_TICK.tone, frequency: 1250, endFrequency: 900 },
      });
    },
  ],
  [
    "soft",
    (context, startsAt) => {
      playTick(context, startsAt, SOFT_TICK);
      playTick(context, startsAt + 0.11, SOFT_TICK);
    },
  ],
  [
    "glass",
    (context, startsAt) => {
      playTick(context, startsAt, { tone: { ...GLASS_TICK, frequency: 3200 }, click: GLASS_CLICK });
      playTick(context, startsAt + 0.08, { tone: { ...GLASS_TICK, frequency: 3600 }, click: GLASS_CLICK });
    },
  ],
  [
    "triple",
    (context, startsAt) =>
      TRIPLE_TICK_FREQUENCIES.forEach((frequency, index) =>
        playTick(context, startsAt + index * TRIPLE_TICK_GAP_SECONDS, {
          tone: { frequency, gain: 0.14, decay: 0.04 },
          click: { frequency: 4200, gain: 0.16, decay: 0.008 },
        }),
      ),
  ],
  [
    "tick_ding",
    (context, startsAt) => {
      playTick(context, startsAt, CRISP_TICK);
      playTick(context, startsAt + 0.09, CRISP_TICK);
      playChimeNote(context, startsAt + 0.19, 1567.98, 0.07, 0.6); // G6
    },
  ],
  [
    "bell",
    (context, startsAt) => {
      BELL_PARTIALS.forEach(({ ratio, gain, ring }) =>
        playTone(context, startsAt, { frequency: BELL_FREQUENCY * ratio, gain, decay: ring }),
      );
      playClick(context, startsAt, { frequency: 5000, gain: 0.05, decay: 0.006 });
    },
  ],
  // G5 then D6, a rising fifth.
  [
    "chime",
    (context, startsAt) => {
      playChimeNote(context, startsAt, 783.99, 0.12, 1.2);
      playChimeNote(context, startsAt + 0.12, 1174.66, 0.12, 1.2);
    },
  ],
]);

import { FADE_SECONDS, MAX_VOLUME } from "./constants";
import type { SoundBuilder, SoundId } from "./types";

// Loops are a few seconds long; their lengths differ so layered loops don't line up and repeat audibly.
const NOISE_SECONDS = 8;
const RAIN_DROPS_SECONDS = 13;
const CRACKLE_SECONDS = 11;
const CLOCK_SECONDS = 2; // A tick and a tock, one second apart.
const CHANNELS = 2; // Independent noise per ear sounds wider and calmer than mono.
const PIANO_SECONDS = 30;
const PIANO_NOTE_GAP_SECONDS = 2.5;
const PIANO_NOTE_SECONDS = 6; // Long enough for a note to ring out under the next ones.
const PIANO_HARMONICS = 6;
const PIANO_PHRASE_SEED = 7;
const HALL_SECONDS = 2.5;
// C major pentatonic from G3 to E5 (Hz): any two notes sound fine together, so the phrase never jars.
const PIANO_SCALE = [196, 220, 261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25];

type Generate = (length: number, sampleRate: number, random: () => number) => Float32Array<ArrayBuffer>;

type Ping = { start: number; frequency: number; decay: number; amplitude: number };

type Burst = { start: number; decay: number; amplitude: number };

// A small seeded generator (mulberry32): cheap, and the sounds don't need cryptographic randomness.
const createRandom = (seed: number) => {
  let state = seed;

  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const normalize = (data: Float32Array<ArrayBuffer>, peak: number) => {
  const max = data.reduce((highest, sample) => Math.max(highest, Math.abs(sample)), 0);

  return max === 0 ? data : data.map((sample) => (sample * peak) / max);
};

const createBuffer = (context: BaseAudioContext, seconds: number, generate: Generate) => {
  const { sampleRate } = context;
  const length = Math.floor(seconds * sampleRate);
  const buffer = context.createBuffer(CHANNELS, length, sampleRate);

  for (let channel = 0; channel < CHANNELS; channel += 1) {
    buffer.copyToChannel(generate(length, sampleRate, createRandom(channel + 1)), channel);
  }

  return buffer;
};

const generateWhite: Generate = (length, _sampleRate, random) =>
  normalize(
    Float32Array.from({ length }, () => random() * 2 - 1),
    0.5,
  );

// Runs white noise through `filter` twice and keeps the second pass, so the filter's state at the start of
// the buffer is the one it ends with and the loop has no seam.
const filterWhite = (length: number, random: () => number, filter: (white: number) => number) => {
  const white = Float32Array.from({ length }, () => random() * 2 - 1);
  white.forEach(filter);

  return normalize(white.map(filter), 0.5);
};

// Paul Kellet's economy filter: white noise tilted down 3 dB per octave.
const generatePink: Generate = (length, _sampleRate, random) => {
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;

  return filterWhite(length, random, (white) => {
    b0 = 0.99765 * b0 + white * 0.099046;
    b1 = 0.963 * b1 + white * 0.2965164;
    b2 = 0.57 * b2 + white * 1.0526913;

    return b0 + b1 + b2 + white * 0.1848;
  });
};

// Leaky integration of white noise: a deep rumble, 6 dB per octave down.
const generateBrown: Generate = (length, _sampleRate, random) => {
  let last = 0;

  return filterWhite(length, random, (white) => {
    last = (last + 0.02 * white) / 1.02;

    return last;
  });
};

// Mixes `render(offset)` into the samples from `start` on, for up to `seconds`.
const mixIn = (
  data: Float32Array,
  sampleRate: number,
  start: number,
  seconds: number,
  render: (offset: number) => number,
) => {
  const segment = data.subarray(start, start + Math.floor(seconds * sampleRate));
  segment.set(segment.map((sample, offset) => sample + render(offset)));
};

// A decaying sine, the building block for ticks and drops.
const addPing = (data: Float32Array, sampleRate: number, { start, frequency, decay, amplitude }: Ping) =>
  mixIn(data, sampleRate, start, decay * 8, (offset) => {
    const time = offset / sampleRate;

    return amplitude * Math.sin(2 * Math.PI * frequency * time) * Math.exp(-time / decay);
  });

// A burst of decaying noise, the building block for crackles and the tick's attack.
const addBurst = (
  data: Float32Array,
  sampleRate: number,
  random: () => number,
  { start, decay, amplitude }: Burst,
) => {
  let previous = 0;

  mixIn(data, sampleRate, start, decay * 8, (offset) => {
    const white = random() * 2 - 1;
    // Differencing brightens the burst into a snap instead of a thud.
    const sample = amplitude * (white - previous) * Math.exp(-offset / sampleRate / decay);
    previous = white;

    return sample;
  });
};

// A soft wooden tick-tock: two short knocks a second apart, the tock a little lower.
const generateClock: Generate = (length, sampleRate, random) => {
  const data = new Float32Array(length);

  [
    { start: 0, pitch: 1 },
    { start: sampleRate, pitch: 0.82 },
  ].forEach(({ start, pitch }) => {
    addPing(data, sampleRate, { start, frequency: 2200 * pitch, decay: 0.008, amplitude: 0.5 });
    addPing(data, sampleRate, { start, frequency: 1400 * pitch, decay: 0.012, amplitude: 0.35 });
    addBurst(data, sampleRate, random, { start, decay: 0.0015, amplitude: 0.25 });
  });

  return normalize(data, 0.5);
};

const generateRainDrops: Generate = (length, sampleRate, random) => {
  const data = new Float32Array(length);
  const dropCount = Math.floor((length / sampleRate) * 30);

  for (let drop = 0; drop < dropCount; drop += 1) {
    addPing(data, sampleRate, {
      start: Math.floor(random() * length),
      frequency: 1800 + random() * 3200,
      decay: 0.002 + random() * 0.004,
      amplitude: 0.05 + random() * random() * 0.3,
    });
  }

  return normalize(data, 0.4);
};

const generateCrackle: Generate = (length, sampleRate, random) => {
  const data = new Float32Array(length);
  const popCount = Math.floor((length / sampleRate) * 7);

  for (let pop = 0; pop < popCount; pop += 1) {
    addBurst(data, sampleRate, random, {
      start: Math.floor(random() * length),
      decay: 0.0008 + random() * 0.003,
      // Mostly faint pops, now and then a louder snap.
      amplitude: 0.05 + random() ** 4 * 0.9,
    });
  }

  return normalize(data, 0.5);
};

// A soft piano note: a few slightly stretched harmonics (real strings run a little sharp up the series), the
// upper ones dying away first, with a quick strike that settles into a long, quiet ring. The tail wraps
// around to the start of the buffer so a note near the end carries across the loop instead of cutting off.
const addPianoNote = (data: Float32Array, sampleRate: number, start: number, frequency: number) => {
  const { length } = data;
  const sampleCount = Math.min(Math.floor(PIANO_NOTE_SECONDS * sampleRate), length);
  const attackSamples = 0.006 * sampleRate;

  for (let harmonic = 1; harmonic <= PIANO_HARMONICS; harmonic += 1) {
    const partial = frequency * harmonic * Math.sqrt(1 + 0.0004 * harmonic ** 2);
    if (partial >= sampleRate / 2) break;

    // Step the sine and both decays by multiplying instead of calling sin/exp per sample: this runs on
    // the main thread, and the recurrences are several times faster.
    const turnCos = Math.cos((2 * Math.PI * partial) / sampleRate);
    const turnSin = Math.sin((2 * Math.PI * partial) / sampleRate);
    const strikeStep = Math.exp(-1 / (0.25 * sampleRate));
    const ringStep = Math.exp(-1 / ((3.2 / harmonic) * sampleRate));
    const amplitude = 1 / harmonic ** 1.6;
    let sine = 0;
    let cosine = 1;
    let strike = 0.65 * amplitude;
    let ringing = 0.35 * amplitude;

    for (let offset = 0; offset < sampleCount; offset += 1) {
      data[(start + offset) % length] += Math.min(offset / attackSamples, 1) * (strike + ringing) * sine;
      const nextSine = sine * turnCos + cosine * turnSin;
      cosine = cosine * turnCos - sine * turnSin;
      sine = nextSine;
      strike *= strikeStep;
      ringing *= ringStep;
    }
  }
};

// A slow, wandering phrase on a pentatonic scale, so no two notes ever clash. The phrase comes from a fixed
// seed so both ears hear the same notes; each ear's own `random` only detunes them a hair, for width.
const generatePiano: Generate = (length, sampleRate, random) => {
  const data = new Float32Array(length);
  const phrase = createRandom(PIANO_PHRASE_SEED);
  const noteCount = Math.floor(length / sampleRate / PIANO_NOTE_GAP_SECONDS);
  let step = Math.floor(PIANO_SCALE.length / 2);

  for (let note = 0; note < noteCount; note += 1) {
    // Small steps up or down sound like a melody; big leaps sound random.
    step = Math.min(Math.max(step + Math.floor(phrase() * 5) - 2, 0), PIANO_SCALE.length - 1);
    const start = Math.floor((note * PIANO_NOTE_GAP_SECONDS + phrase() * 0.4) * sampleRate);
    const detune = 1 + (random() - 0.5) * 0.002;
    const pitch = (scaleStep: number) => (PIANO_SCALE.at(Math.max(scaleStep, 0)) ?? 0) * detune;
    addPianoNote(data, sampleRate, start, pitch(step));

    // Now and then a soft low note underneath, an octave below a scale step.
    if (phrase() < 0.3) addPianoNote(data, sampleRate, start, pitch(step - 2) / 2);
  }

  return normalize(data, 0.5);
};

// White noise dying away over a couple of seconds: the impulse response of a soft, roomy hall.
const generateHall: Generate = (length, _sampleRate, random) =>
  Float32Array.from({ length }, (_, offset) => (random() * 2 - 1) * Math.exp((-offset / length) * 6));

const loop = (context: BaseAudioContext, buffer: AudioBuffer) => {
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  return source;
};

const createFilter = (context: BaseAudioContext, type: BiquadFilterType, frequency: number, q = 0.7) => {
  const filter = context.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = frequency;
  filter.Q.value = q;

  return filter;
};

const createGain = (context: BaseAudioContext, gain: number) => {
  const node = context.createGain();
  node.gain.value = gain;

  return node;
};

// A slow sine that sways `param` by ±depth around its own value, so swells never sound looped.
const createLfo = (context: BaseAudioContext, param: AudioParam, frequency: number, depth: number) => {
  const oscillator = context.createOscillator();
  oscillator.frequency.value = frequency;
  oscillator.connect(createGain(context, depth)).connect(param);

  return oscillator;
};

const chain = (...nodes: AudioNode[]) => nodes.reduce((from, to) => from.connect(to));

const plainLoop =
  (generate: Generate, seconds: number, gain: number): SoundBuilder =>
  (context, output) => {
    const source = loop(context, createBuffer(context, seconds, generate));
    chain(source, createGain(context, gain), output);

    return [source];
  };

const buildRain: SoundBuilder = (context, output) => {
  const patter = loop(context, createBuffer(context, NOISE_SECONDS, generatePink));
  chain(
    patter,
    createFilter(context, "highpass", 400),
    createFilter(context, "lowpass", 6500),
    createGain(context, 0.7),
    output,
  );

  const drops = loop(context, createBuffer(context, RAIN_DROPS_SECONDS, generateRainDrops));
  chain(drops, createGain(context, 0.5), output);

  return [patter, drops];
};

const buildWaves: SoundBuilder = (context, output) => {
  const surf = loop(context, createBuffer(context, NOISE_SECONDS, generateBrown));
  const filter = createFilter(context, "lowpass", 700);
  const swell = createGain(context, 0.55);
  chain(surf, filter, swell, output);

  return [
    surf,
    createLfo(context, swell.gain, 0.09, 0.4), // One wave every 11 seconds or so.
    createLfo(context, filter.frequency, 0.09, 350),
  ];
};

const buildWind: SoundBuilder = (context, output) => {
  const air = loop(context, createBuffer(context, NOISE_SECONDS, generatePink));
  const filter = createFilter(context, "bandpass", 500, 0.9);
  const gust = createGain(context, 1.3);
  chain(air, filter, gust, output);

  return [air, createLfo(context, filter.frequency, 0.05, 250), createLfo(context, gust.gain, 0.13, 0.45)];
};

const buildCampfire: SoundBuilder = (context, output) => {
  const roar = loop(context, createBuffer(context, NOISE_SECONDS, generateBrown));
  chain(roar, createFilter(context, "lowpass", 400), createGain(context, 0.6), output);

  const crackle = loop(context, createBuffer(context, CRACKLE_SECONDS, generateCrackle));
  chain(crackle, createFilter(context, "highpass", 1200), createGain(context, 0.6), output);

  return [roar, crackle];
};

const buildPiano: SoundBuilder = (context, output) => {
  const keys = loop(context, createBuffer(context, PIANO_SECONDS, generatePiano));
  const mellow = createFilter(context, "lowpass", 3000);
  chain(keys, mellow, createGain(context, 0.8), output);

  const hall = context.createConvolver();
  hall.buffer = createBuffer(context, HALL_SECONDS, generateHall);
  chain(mellow, hall, createGain(context, 0.35), output);

  return [keys];
};

const SOUND_BUILDERS = new Map<SoundId, SoundBuilder>([
  ["clock", plainLoop(generateClock, CLOCK_SECONDS, 1)],
  ["white", plainLoop(generateWhite, NOISE_SECONDS, 0.35)],
  ["brown", plainLoop(generateBrown, NOISE_SECONDS, 1)],
  ["piano", buildPiano],
  ["rain", buildRain],
  ["waves", buildWaves],
  ["wind", buildWind],
  ["campfire", buildCampfire],
]);

// Volume feels linear to the ear when the gain follows its square.
export const volumeToGain = (volume: number) => (volume / MAX_VOLUME) ** 2;

// Fades the sound in on `output` and returns a function that fades it out and stops it.
export const playSound = (context: BaseAudioContext, output: AudioNode, soundId: SoundId) => {
  const build = SOUND_BUILDERS.get(soundId);
  if (!build) return () => undefined;

  const fade = createGain(context, 0);
  fade.connect(output);
  const sources = build(context, fade);
  sources.forEach((source) => source.start());
  fade.gain.setTargetAtTime(1, context.currentTime, FADE_SECONDS / 3);

  return () => {
    const stopAt = context.currentTime + FADE_SECONDS;
    fade.gain.cancelScheduledValues(context.currentTime);
    fade.gain.setTargetAtTime(0, context.currentTime, FADE_SECONDS / 5);
    sources.forEach((source) => source.stop(stopAt));
    sources[0].addEventListener("ended", () => fade.disconnect());
  };
};

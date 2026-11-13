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
const MORNING_SECONDS = 17;
const CRICKETS_SECONDS = 15;
const OWL_SECONDS = 29; // Long, so the owl calls only now and then.
const CRICKET_COUNT = 3;
const FLUTE_SECONDS = 32;
const FLUTE_PHRASE_SEED = 11;
const FLUTE_NOTE_LENGTHS = [0.9, 1.8, 2.7]; // Seconds: short, held and long notes.
const FLUTE_BREATH_SECONDS = 1.2;
const FLUTE_ATTACK_SECONDS = 0.12;
const FLUTE_RELEASE_SECONDS = 0.35; // Overlaps the next note a little, so the line sounds legato.
// G major pentatonic from D4 to A5 (Hz), the soft low register of a wooden flute.
const FLUTE_SCALE = [293.66, 329.63, 392, 440, 493.88, 587.33, 659.25, 783.99, 880];
// A ring this quiet is lost under everything else (about -50 dB below a full strike).
const RING_FLOOR = 0.003;
const BELLS_SECONDS = 31;
const BELLS_PHRASE_SEED = 3;
// A bell's partials (as multiples of its pitch) aren't whole-number harmonics, which is what makes it a bell:
// the hum an octave below, the prime, a minor-third tierce, the quint, the nominal an octave up, and two
// faint high partials. The low ones ring longest.
const BELL_PARTIALS = [
  { ratio: 0.5, amplitude: 0.5, decay: 5 },
  { ratio: 1, amplitude: 1, decay: 3.5 },
  { ratio: 1.19, amplitude: 0.4, decay: 2.5 },
  { ratio: 1.5, amplitude: 0.3, decay: 2 },
  { ratio: 2, amplitude: 0.5, decay: 1.6 },
  { ratio: 2.74, amplitude: 0.2, decay: 0.9 },
  { ratio: 3.76, amplitude: 0.12, decay: 0.5 },
];
// C major pentatonic from C5 to C6 (Hz), small, clear bells.
const BELL_SCALE = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
const HARP_SECONDS = 30;
const HARP_PHRASE_SEED = 5;
const HARP_HARMONICS = 5;
const HARP_PLUCK_GAP_SECONDS = 0.17; // Between the notes of a rolled chord.
// C major pentatonic from C3 to E5 (Hz).
const HARP_SCALE = [
  130.81, 146.83, 164.81, 196, 220, 261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25,
];
// C major pentatonic from G3 to E5 (Hz): any two notes sound fine together, so the phrase never jars.
const PIANO_SCALE = [196, 220, 261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25];

type Generate = (length: number, sampleRate: number, random: () => number) => Float32Array<ArrayBuffer>;

type Ping = { start: number; frequency: number; decay: number; amplitude: number };

type Burst = { start: number; decay: number; amplitude: number };

type Chirp = { start: number; from: number; to: number; seconds: number; amplitude: number };

type FluteNote = { start: number; frequency: number; seconds: number };

// A sine that rings out from its strike, fading by 1/e every `decay` seconds.
type Ring = { frequency: number; amplitude: number; decay: number };

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

// A sine gliding from `from` to `to` Hz as it swells and fades: the building block for birdsong, dew drips,
// cricket pulses and owl hoots.
const addChirp = (data: Float32Array, sampleRate: number, { start, from, to, seconds, amplitude }: Chirp) => {
  const sampleCount = seconds * sampleRate;
  let phase = 0;

  mixIn(data, sampleRate, start, seconds, (offset) => {
    const progress = offset / sampleCount;
    phase += (2 * Math.PI * (from + (to - from) * progress)) / sampleRate;

    return amplitude * Math.sin(Math.PI * progress) ** 2 * Math.sin(phase);
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

// Strikes `rings` at `start` and lets them die away, each tail wrapping around to the start of the buffer.
// Like the piano, it steps the sine and decay by multiplying instead of calling sin/exp per sample.
const addRings = (data: Float32Array, sampleRate: number, start: number, rings: Ring[]) => {
  const { length } = data;
  const attackSamples = 0.004 * sampleRate;

  rings
    .filter(({ frequency }) => frequency < sampleRate / 2)
    .forEach(({ frequency, amplitude, decay }) => {
      // Stops once the ring has faded below RING_FLOOR, so quiet partials stop early.
      const sampleCount = Math.min(Math.floor(decay * Math.log(amplitude / RING_FLOOR) * sampleRate), length);
      const turnCos = Math.cos((2 * Math.PI * frequency) / sampleRate);
      const turnSin = Math.sin((2 * Math.PI * frequency) / sampleRate);
      const decayStep = Math.exp(-1 / (decay * sampleRate));
      let sine = 0;
      let cosine = 1;
      let level = amplitude;

      for (let offset = 0; offset < sampleCount; offset += 1) {
        data[(start + offset) % length] += Math.min(offset / attackSamples, 1) * level * sine;
        const nextSine = sine * turnCos + cosine * turnSin;
        cosine = cosine * turnCos - sine * turnSin;
        sine = nextSine;
        level *= decayStep;
      }
    });
};

// Small bells struck now and then, sometimes two close together, on a pentatonic scale. Seeded like the
// piano, so both ears hear the same bells.
const generateBells: Generate = (length, sampleRate, random) => {
  const data = new Float32Array(length);
  const phrase = createRandom(BELLS_PHRASE_SEED);
  const seconds = length / sampleRate;
  const detune = 1 + (random() - 0.5) * 0.002;

  const strike = (time: number) => {
    const pitch = (BELL_SCALE.at(Math.floor(phrase() * BELL_SCALE.length)) ?? 0) * detune;
    const loudness = 0.5 + phrase() * 0.5;
    const rings = BELL_PARTIALS.map(({ ratio, amplitude, decay }) => ({
      frequency: pitch * ratio,
      amplitude: amplitude * loudness,
      decay,
    }));
    addRings(data, sampleRate, Math.floor(time * sampleRate), rings);
  };

  for (let time = 0.2; time < seconds; time += 2 + phrase() * 2.5) {
    strike(time);
    if (phrase() < 0.3) strike(time + 0.2 + phrase() * 0.3);
  }

  return normalize(data, 0.5);
};

// A plucked harp string: whole-number harmonics, the upper ones fainter and quicker to fade, and low strings
// ringing longer than high ones.
const addHarpNote = (data: Float32Array, sampleRate: number, start: number, frequency: number) => {
  const sustain = 1.8 * (220 / frequency) ** 0.3;
  const rings = Array.from({ length: HARP_HARMONICS }, (_, index) => {
    const harmonic = index + 1;

    return {
      frequency: frequency * harmonic,
      amplitude: 1 / harmonic ** 1.5,
      decay: sustain / harmonic,
    };
  });
  addRings(data, sampleRate, start, rings);
};

// Rolled chords: a run of three to five notes up the pentatonic scale (now and then down it), then a pause.
// Seeded like the piano, so both ears hear the same notes.
const generateHarp: Generate = (length, sampleRate, random) => {
  const data = new Float32Array(length);
  const phrase = createRandom(HARP_PHRASE_SEED);
  const seconds = length / sampleRate;
  const detune = 1 + (random() - 0.5) * 0.002;

  let time = 0.2;

  while (time < seconds - 2) {
    const noteCount = 3 + Math.floor(phrase() * 3);
    const strides = Array.from({ length: noteCount }, () => 1 + Math.floor(phrase() * 2));
    const isFalling = phrase() < 0.35;
    let step = Math.floor(phrase() * 5);

    // Climbs one or two scale steps per note, so the run spans about an octave.
    const run = strides.map((stride) => {
      step = Math.min(step + stride, HARP_SCALE.length - 1);

      return step;
    });
    (isFalling ? run.toReversed() : run).forEach((scaleStep, index) => {
      const start = Math.floor((time + index * HARP_PLUCK_GAP_SECONDS) * sampleRate);
      addHarpNote(data, sampleRate, start, (HARP_SCALE.at(scaleStep) ?? 0) * detune);
    });
    time += noteCount * HARP_PLUCK_GAP_SECONDS + 2 + phrase() * 1.5;
  }

  return normalize(data, 0.5);
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

// One bird's call: a few quick rising chirps, or a slower falling whistle, on its own pitch.
const addBirdCall = (data: Float32Array, sampleRate: number, random: () => number, start: number) => {
  const pitch = 2500 + random() * 2500;
  const isWhistle = random() < 0.4;
  const noteCount = 2 + Math.floor(random() * 5);
  const amplitude = 0.15 + random() * 0.35; // Near and far birds.
  let noteStart = start;

  for (let note = 0; note < noteCount; note += 1) {
    const seconds = isWhistle ? 0.18 + random() * 0.12 : 0.04 + random() * 0.05;
    const [from, to] = isWhistle ? [pitch * 1.3, pitch * 0.85] : [pitch * 0.8, pitch * 1.25];
    addChirp(data, sampleRate, { start: noteStart, from, to, seconds, amplitude });
    noteStart += Math.floor((seconds + 0.05 + random() * 0.08) * sampleRate);
  }
};

// Birds calling here and there, with now and then a drop of dew plinking off a leaf. Each ear gets its own
// birds, so they seem to sit around the listener.
const generateMorning: Generate = (length, sampleRate, random) => {
  const data = new Float32Array(length);
  const seconds = length / sampleRate;
  // Calls start at least two seconds before the end, so none is cut off at the loop's seam.
  const latestStart = length - 2 * sampleRate;

  for (let call = 0; call < Math.floor(seconds * 0.6); call += 1) {
    addBirdCall(data, sampleRate, random, Math.floor(random() * latestStart));
  }

  for (let drip = 0; drip < Math.floor(seconds * 0.3); drip += 1) {
    const from = 700 + random() * 500;
    addChirp(data, sampleRate, {
      start: Math.floor(random() * latestStart),
      from,
      to: from * 2,
      seconds: 0.03,
      amplitude: 0.25,
    });
  }

  return normalize(data, 0.5);
};

// A few crickets, each chirping three or four quick pulses on its own pitch and rhythm.
const generateCrickets: Generate = (length, sampleRate, random) => {
  const data = new Float32Array(length);
  const lastChirp = length / sampleRate - 0.3;

  for (let cricket = 0; cricket < CRICKET_COUNT; cricket += 1) {
    const pitch = 3800 + random() * 1200;
    const interval = 0.45 + random() * 0.5;
    const pulseCount = 3 + Math.floor(random() * 2);
    const amplitude = 0.2 + random() * 0.5;

    for (let time = random() * interval; time < lastChirp; time += interval * (0.9 + random() * 0.2)) {
      for (let pulse = 0; pulse < pulseCount; pulse += 1) {
        const start = Math.floor((time + pulse * 0.03) * sampleRate);
        addChirp(data, sampleRate, { start, from: pitch, to: pitch * 0.98, seconds: 0.02, amplitude });
      }
    }
  }

  return normalize(data, 0.5);
};

// A distant owl, twice in the long loop: "hoo … hoo-hoo". Both ears hear the same owl, so it sits ahead.
const generateOwl: Generate = (length, sampleRate) => {
  const data = new Float32Array(length);

  [6, 19].forEach((callAt) =>
    [
      { at: 0, seconds: 0.5 },
      { at: 0.85, seconds: 0.3 },
      { at: 1.25, seconds: 0.55 },
    ].forEach(({ at, seconds }) =>
      addChirp(data, sampleRate, {
        start: Math.floor((callAt + at) * sampleRate),
        from: 410,
        to: 370,
        seconds,
        amplitude: 0.5,
      }),
    ),
  );

  return normalize(data, 0.5);
};

// A breathy flute note: a fundamental with a little of the second and third harmonics, a breath of noise
// that puffs at the start, and a gentle vibrato that creeps in once the note settles. Like the piano, the
// tail wraps around to the start of the buffer.
const addFluteNote = (
  data: Float32Array,
  sampleRate: number,
  random: () => number,
  { start, frequency, seconds }: FluteNote,
) => {
  const { length } = data;
  const sampleCount = Math.min(Math.floor((seconds + FLUTE_RELEASE_SECONDS) * sampleRate), length);
  let phase = 0;

  for (let offset = 0; offset < sampleCount; offset += 1) {
    const time = offset / sampleRate;
    const swell =
      Math.min(time / FLUTE_ATTACK_SECONDS, 1) *
      Math.min((seconds + FLUTE_RELEASE_SECONDS - time) / FLUTE_RELEASE_SECONDS, 1);
    const vibrato = 1 + 0.004 * Math.min(time / 0.6, 1) * Math.sin(2 * Math.PI * 5 * time);
    phase += (2 * Math.PI * frequency * vibrato) / sampleRate;
    const sine = Math.sin(phase);
    // sin 2x = 2 sin x cos x and sin 3x = 3 sin x - 4 sin³ x, so the harmonics need no more sin calls.
    const tone = sine + 0.6 * sine * Math.cos(phase) + 0.08 * (3 * sine - 4 * sine ** 3);
    const breath = (random() * 2 - 1) * (0.04 + (time < 0.2 ? 0.25 * Math.exp(-time / 0.05) : 0));
    data[(start + offset) % length] += swell * (tone + breath);
  }
};

// A slow, wandering flute line on a pentatonic scale, pausing now and then for breath. Like the piano, the
// phrase is seeded so both ears hear the same notes.
const generateFlute: Generate = (length, sampleRate, random) => {
  const data = new Float32Array(length);
  const phrase = createRandom(FLUTE_PHRASE_SEED);
  const seconds = length / sampleRate;
  const detune = 1 + (random() - 0.5) * 0.002;
  let step = 2;
  let time = 0.2;

  for (;;) {
    const noteSeconds = FLUTE_NOTE_LENGTHS.at(Math.floor(phrase() * FLUTE_NOTE_LENGTHS.length)) ?? 1;
    if (time + noteSeconds > seconds) break;

    step = Math.min(Math.max(step + Math.floor(phrase() * 5) - 2, 0), FLUTE_SCALE.length - 1);
    const frequency = (FLUTE_SCALE.at(step) ?? 0) * detune;
    addFluteNote(data, sampleRate, random, {
      start: Math.floor(time * sampleRate),
      frequency,
      seconds: noteSeconds,
    });
    time += noteSeconds + (phrase() < 0.3 ? FLUTE_BREATH_SECONDS : 0.05);
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

// Also sends `node` through a soft hall reverb into `output`.
const addHall = (context: BaseAudioContext, node: AudioNode, output: AudioNode, gain: number) => {
  const hall = context.createConvolver();
  hall.buffer = createBuffer(context, HALL_SECONDS, generateHall);
  chain(node, hall, createGain(context, gain), output);
};

const buildPiano: SoundBuilder = (context, output) => {
  const keys = loop(context, createBuffer(context, PIANO_SECONDS, generatePiano));
  const mellow = createFilter(context, "lowpass", 3000);
  chain(keys, mellow, createGain(context, 0.8), output);
  addHall(context, mellow, output, 0.35);

  return [keys];
};

const buildBells: SoundBuilder = (context, output) => {
  const bells = loop(context, createBuffer(context, BELLS_SECONDS, generateBells));
  const mellow = createFilter(context, "lowpass", 5000);
  chain(bells, mellow, createGain(context, 0.6), output);
  addHall(context, mellow, output, 0.4);

  return [bells];
};

const buildHarp: SoundBuilder = (context, output) => {
  const harp = loop(context, createBuffer(context, HARP_SECONDS, generateHarp));
  const mellow = createFilter(context, "lowpass", 3500);
  chain(harp, mellow, createGain(context, 0.6), output);
  addHall(context, mellow, output, 0.35);

  return [harp];
};

const buildFlute: SoundBuilder = (context, output) => {
  const flute = loop(context, createBuffer(context, FLUTE_SECONDS, generateFlute));
  // Softens the breath noise into air instead of hiss.
  const mellow = createFilter(context, "lowpass", 2600);
  chain(flute, mellow, createGain(context, 0.3), output);
  addHall(context, mellow, output, 0.2);

  return [flute];
};

const buildMorning: SoundBuilder = (context, output) => {
  const birds = loop(context, createBuffer(context, MORNING_SECONDS, generateMorning));
  const gain = createGain(context, 0.6);
  chain(birds, gain, output);
  addHall(context, gain, output, 0.2);

  // A light breeze through the leaves underneath.
  const breeze = loop(context, createBuffer(context, NOISE_SECONDS, generatePink));
  const rustle = createGain(context, 0.12);
  chain(
    breeze,
    createFilter(context, "highpass", 600),
    createFilter(context, "lowpass", 3500),
    rustle,
    output,
  );

  return [birds, breeze, createLfo(context, rustle.gain, 0.07, 0.06)];
};

const buildNight: SoundBuilder = (context, output) => {
  const crickets = loop(context, createBuffer(context, CRICKETS_SECONDS, generateCrickets));
  chain(crickets, createFilter(context, "highpass", 2500), createGain(context, 0.22), output);

  const owl = loop(context, createBuffer(context, OWL_SECONDS, generateOwl));
  const distant = createFilter(context, "lowpass", 800);
  chain(owl, distant, createGain(context, 0.35), output);
  addHall(context, distant, output, 0.3);

  // A low, still hum of the night air.
  const air = loop(context, createBuffer(context, NOISE_SECONDS, generateBrown));
  chain(air, createFilter(context, "lowpass", 250), createGain(context, 0.35), output);

  return [crickets, owl, air];
};

const SOUND_BUILDERS = new Map<SoundId, SoundBuilder>([
  ["clock", plainLoop(generateClock, CLOCK_SECONDS, 1)],
  ["bells", buildBells],
  ["harp", buildHarp],
  ["piano", buildPiano],
  ["flute", buildFlute],
  ["rain", buildRain],
  ["waves", buildWaves],
  ["wind", buildWind],
  ["campfire", buildCampfire],
  ["morning", buildMorning],
  ["night", buildNight],
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

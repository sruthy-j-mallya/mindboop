const BEEP_FREQUENCY = 880; // hertz
const BEEP_VOLUME = 0.3;
const LOOP_SECONDS = 1;
const BEEP_WINDOWS = [
  [0, 0.15],
  [0.25, 0.4],
];

let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (typeof AudioContext === "undefined") return null;

  audioContext ??= new AudioContext();

  return audioContext;
};

const buildBeeps = (context: AudioContext) => {
  const buffer = context.createBuffer(1, context.sampleRate * LOOP_SECONDS, context.sampleRate);
  const samples = Float32Array.from({ length: buffer.length }, (_, index) => {
    const seconds = index / context.sampleRate;
    const isBeeping = BEEP_WINDOWS.some(([start, end]) => seconds >= start && seconds < end);

    return isBeeping ? BEEP_VOLUME * Math.sin(2 * Math.PI * BEEP_FREQUENCY * seconds) : 0;
  });
  buffer.copyToChannel(samples, 0);

  return buffer;
};

// Browsers only allow sound after a user gesture, so call this from a click or key press.
export const unlockAlarmSound = () => {
  void getAudioContext()?.resume();
};

// Returns a function that stops the sound. It starts once the sound is unlocked, if it isn't yet.
export const startAlarmSound = () => {
  const context = getAudioContext();
  if (!context) return () => undefined;

  const source = context.createBufferSource();
  source.buffer = buildBeeps(context);
  source.loop = true;
  source.connect(context.destination);
  source.start();

  return () => {
    source.stop();
    source.disconnect();
  };
};

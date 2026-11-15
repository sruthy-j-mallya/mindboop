import { getAudioContext } from "@/utils/audioContext";

const CHIME_VOLUME = 0.12;
const ATTACK_SECONDS = 0.015;
const RING_SECONDS = 1.2;
// A soft rising fifth (G5 then D6), the second note a beat after the first.
const CHIME_NOTES = [
  { frequency: 783.99, delay: 0 },
  { frequency: 1174.66, delay: 0.12 },
];
// A quiet octave partial gives each note a bell-like shimmer.
const PARTIALS = [
  { ratio: 1, gain: 1 },
  { ratio: 2, gain: 0.25 },
];

const playNote = (context: AudioContext, frequency: number, startsAt: number) => {
  const envelope = context.createGain();
  envelope.gain.setValueAtTime(0, startsAt);
  envelope.gain.linearRampToValueAtTime(CHIME_VOLUME, startsAt + ATTACK_SECONDS);
  envelope.gain.exponentialRampToValueAtTime(0.0001, startsAt + RING_SECONDS);
  envelope.connect(context.destination);

  PARTIALS.forEach(({ ratio, gain }) => {
    const oscillator = context.createOscillator();
    const level = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency * ratio;
    level.gain.value = gain;
    oscillator.connect(level).connect(envelope);
    oscillator.start(startsAt);
    oscillator.stop(startsAt + RING_SECONDS);
    oscillator.onended = () => level.disconnect();
  });

  setTimeout(() => envelope.disconnect(), (startsAt - context.currentTime + RING_SECONDS) * 1000 + 100);
};

// A short, gentle chime for a finished task. Unlock the audio (`unlockAudio`) in the click that completes it, since
// the sound may play only after the save, outside the gesture.
export const playCompletionSound = () => {
  const context = getAudioContext();
  if (!context) return;

  const now = context.currentTime;
  CHIME_NOTES.forEach(({ frequency, delay }) => playNote(context, frequency, now + delay));
};

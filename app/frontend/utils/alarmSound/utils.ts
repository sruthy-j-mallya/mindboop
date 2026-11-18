import type { AlarmNote, AlarmPattern } from "./types";

const EDGE_SECONDS = 0.005; // Fades each note in and out this fast, so its edges don't click.

const sampleNote = ({ frequency, length, overtones, decay }: AlarmNote, seconds: number) => {
  if (seconds < 0 || seconds >= length) return 0;

  const edges = Math.min(seconds / EDGE_SECONDS, (length - seconds) / EDGE_SECONDS, 1);
  const envelope = decay ? Math.exp(-seconds / decay) : 1;
  const wave = overtones.reduce(
    (sum, { ratio, gain }) => sum + gain * Math.sin(2 * Math.PI * frequency * ratio * seconds),
    0,
  );

  return edges * envelope * wave;
};

// Renders one loop of the pattern into samples.
export const renderPattern = ({ loopSeconds, notes }: AlarmPattern, sampleRate: number) =>
  Float32Array.from({ length: Math.round(sampleRate * loopSeconds) }, (_, index) => {
    const seconds = index / sampleRate;

    return notes.reduce((sum, note) => sum + sampleNote(note, seconds - note.start), 0);
  });

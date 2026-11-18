import type { AlarmNote, AlarmPattern, AlarmSound, AlarmSoundId } from "./types";

export const DEFAULT_ALARM_SOUND: AlarmSoundId = "classic";

// Mirrors UserPreference::ALARM_SOUNDS.
export const ALARM_SOUNDS: AlarmSound[] = [
  { id: "classic", label: "Classic beep" },
  { id: "digital", label: "Digital" },
  { id: "chimes", label: "Chimes" },
  { id: "marimba", label: "Marimba" },
  { id: "bell", label: "Bell" },
];

export const PREVIEW_MILLISECONDS = 3000;

const beep = (start: number): AlarmNote => ({
  start,
  frequency: 880, // A5
  length: 0.15,
  overtones: [{ ratio: 1, gain: 0.3 }],
});

// A square-ish tone: odd harmonics, each quieter.
const digitalBeep = (start: number): AlarmNote => ({
  start,
  frequency: 1046.5, // C6
  length: 0.06,
  overtones: [
    { ratio: 1, gain: 0.2 },
    { ratio: 3, gain: 0.067 },
    { ratio: 5, gain: 0.04 },
  ],
});

const chime = (start: number, frequency: number): AlarmNote => ({
  start,
  frequency,
  length: 1.2,
  decay: 0.35,
  overtones: [
    { ratio: 1, gain: 0.22 },
    { ratio: 2, gain: 0.05 },
  ],
});

// A marimba bar's first overtone sits near four times its pitch.
const marimbaNote = (start: number, frequency: number): AlarmNote => ({
  start,
  frequency,
  length: 0.5,
  decay: 0.1,
  overtones: [
    { ratio: 1, gain: 0.28 },
    { ratio: 3.9, gain: 0.04 },
  ],
});

// A struck bell's partials are inharmonic, and the higher ones die away sooner, so each is its own note.
const BELL_FREQUENCY = 1318.51; // E6
const bellPartial = (ratio: number, gain: number, decay: number, length: number): AlarmNote => ({
  start: 0,
  frequency: BELL_FREQUENCY * ratio,
  length,
  decay,
  overtones: [{ ratio: 1, gain }],
});

export const ALARM_PATTERNS = new Map<AlarmSoundId, AlarmPattern>([
  ["classic", { loopSeconds: 1, notes: [beep(0), beep(0.25)] }],
  ["digital", { loopSeconds: 1, notes: [0, 0.1, 0.2, 0.3].map(digitalBeep) }],
  [
    "chimes",
    {
      loopSeconds: 2,
      // C6, E6, G6, C7: a major arpeggio.
      notes: [chime(0, 1046.5), chime(0.2, 1318.51), chime(0.4, 1567.98), chime(0.6, 2093)],
    },
  ],
  [
    "marimba",
    {
      loopSeconds: 1.2,
      // A5, C#6, E6, A6.
      notes: [
        marimbaNote(0, 880),
        marimbaNote(0.15, 1108.73),
        marimbaNote(0.3, 1318.51),
        marimbaNote(0.45, 1760),
      ],
    },
  ],
  [
    "bell",
    {
      loopSeconds: 2,
      notes: [
        bellPartial(1, 0.3, 0.6, 1.9),
        bellPartial(2.76, 0.1, 0.3, 1),
        bellPartial(5.4, 0.045, 0.15, 0.6),
      ],
    },
  ],
]);

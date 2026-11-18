export type AlarmSoundId = "classic" | "digital" | "chimes" | "marimba" | "bell";

export type AlarmSound = { id: AlarmSoundId; label: string };

// A sine at `ratio` times the note's frequency, at `gain`.
export type Overtone = { ratio: number; gain: number };

// One note in the loop, `start` and `length` in seconds. With `decay`, it fades exponentially (that many seconds
// to about a third) like a struck note; without, it holds like a beep.
export type AlarmNote = {
  start: number;
  frequency: number;
  length: number;
  overtones: Overtone[];
  decay?: number;
};

// An alarm is one short pattern, repeated until it's stopped.
export type AlarmPattern = { loopSeconds: number; notes: AlarmNote[] };

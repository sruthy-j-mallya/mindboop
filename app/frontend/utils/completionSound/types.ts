export type CompletionSoundId =
  "rising" | "crisp" | "wood" | "soft" | "glass" | "triple" | "tick_ding" | "bell" | "chime" | "none";

export type CompletionSound = { id: CompletionSoundId; label: string };

// Schedules a sound on `context`, starting at `startsAt` (in the context's clock).
export type SoundPlayer = (context: AudioContext, startsAt: number) => void;

// A short pitched body, its frequency gliding to `endFrequency` (hertz) as it fades over `decay` seconds.
export type ToneOptions = {
  frequency: number;
  endFrequency?: number;
  wave?: OscillatorType;
  gain: number;
  decay: number;
};

// A burst of filtered noise: the click at the start of a tick.
export type ClickOptions = {
  frequency: number;
  filter?: BiquadFilterType;
  q?: number;
  gain: number;
  decay?: number;
};

export type TickOptions = { tone?: ToneOptions; click?: ClickOptions };

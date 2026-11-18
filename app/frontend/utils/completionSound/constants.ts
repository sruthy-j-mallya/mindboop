import type { CompletionSound } from "./types";

export const NO_COMPLETION_SOUND = "none";

// Mirrors UserPreference::COMPLETION_SOUNDS.
export const COMPLETION_SOUNDS: CompletionSound[] = [
  { id: "rising", label: "Rising tick-tick" },
  { id: "crisp", label: "Crisp tick-tick" },
  { id: "wood", label: "Wooden tick-tick" },
  { id: "soft", label: "Soft tap-tap" },
  { id: "glass", label: "Glassy tick-tick" },
  { id: "triple", label: "Quick triple tick" },
  { id: "tick_ding", label: "Tick-tick-ding" },
  { id: "bell", label: "Bell" },
  { id: "chime", label: "Two-note chime" },
  { id: NO_COMPLETION_SOUND, label: "Off" },
];

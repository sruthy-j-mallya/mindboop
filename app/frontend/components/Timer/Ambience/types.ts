import type { LucideIcon } from "lucide-react";

export type SoundId = "none" | "clock" | "white" | "pink" | "brown" | "rain" | "waves" | "wind" | "campfire";

export type Sound = { id: SoundId; label: string; icon: LucideIcon };

// Wires a sound's nodes into `output` and returns the sources to start and stop with it.
export type SoundBuilder = (context: BaseAudioContext, output: AudioNode) => AudioScheduledSourceNode[];

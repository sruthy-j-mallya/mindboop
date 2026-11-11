import {
  Activity,
  AudioLines,
  AudioWaveform,
  Clock,
  CloudRain,
  Flame,
  VolumeX,
  Waves,
  Wind,
} from "lucide-react";

import type { Sound } from "./types";

export const NO_SOUND = "none";

// Every sound is synthesised in the browser, so there are no audio files and nothing to license.
export const SOUNDS: Sound[] = [
  { id: NO_SOUND, label: "None", icon: VolumeX },
  { id: "clock", label: "Clock", icon: Clock },
  { id: "white", label: "White noise", icon: AudioLines },
  { id: "pink", label: "Pink noise", icon: AudioWaveform },
  { id: "brown", label: "Brown noise", icon: Activity },
  { id: "rain", label: "Rain", icon: CloudRain },
  { id: "waves", label: "Waves", icon: Waves },
  { id: "wind", label: "Wind", icon: Wind },
  { id: "campfire", label: "Campfire", icon: Flame },
];

export const DEFAULT_VOLUME = 50;
export const MAX_VOLUME = 100;

export const SOUND_STORAGE_KEY = "ambience.sound";
export const VOLUME_STORAGE_KEY = "ambience.volume";

// How long a sound takes to fade in or out, so starting, stopping and switching never click.
export const FADE_SECONDS = 0.6;

import {
  Bell,
  Clock,
  CloudRain,
  Flame,
  MoonStar,
  Music2,
  Music4,
  Piano,
  Sunrise,
  VolumeX,
  Waves,
  Wind,
} from "lucide-react";

import type { Sound } from "./types";

export const NO_SOUND = "none";

// Every sound is synthesised in the browser, so there are no audio files and nothing to license.
// Listed in rows of three for the picker's grid: silence and time-keeping, instruments, the elements, then
// the times of day from dawn to night.
export const SOUNDS: Sound[] = [
  { id: NO_SOUND, label: "None", icon: VolumeX },
  { id: "clock", label: "Clock", icon: Clock },
  { id: "bells", label: "Bells", icon: Bell },
  { id: "piano", label: "Piano", icon: Piano },
  { id: "harp", label: "Harp", icon: Music4 },
  { id: "flute", label: "Flute", icon: Music2 },
  { id: "rain", label: "Rain", icon: CloudRain },
  { id: "waves", label: "Waves", icon: Waves },
  { id: "wind", label: "Wind", icon: Wind },
  { id: "morning", label: "Morning dew", icon: Sunrise },
  { id: "campfire", label: "Campfire", icon: Flame },
  { id: "night", label: "Night", icon: MoonStar },
];

export const DEFAULT_VOLUME = 50;
export const MAX_VOLUME = 100;

export const SOUND_STORAGE_KEY = "ambience.sound";
export const VOLUME_STORAGE_KEY = "ambience.volume";

// How long a sound takes to fade in or out, so starting, stopping and switching never click.
export const FADE_SECONDS = 0.6;

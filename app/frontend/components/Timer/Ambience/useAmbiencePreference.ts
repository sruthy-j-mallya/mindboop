import { useState } from "react";

import {
  DEFAULT_VOLUME,
  MAX_VOLUME,
  NO_SOUND,
  SOUND_STORAGE_KEY,
  SOUNDS,
  VOLUME_STORAGE_KEY,
} from "./constants";
import type { SoundId } from "./types";

const readStorage = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorage = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage can be blocked; the choice still holds until the next reload.
  }
};

const readSoundId = (): SoundId =>
  SOUNDS.find(({ id }) => id === readStorage(SOUND_STORAGE_KEY))?.id ?? NO_SOUND;

const readVolume = () => {
  const volume = Number(readStorage(VOLUME_STORAGE_KEY) ?? DEFAULT_VOLUME);

  return Number.isFinite(volume) ? Math.min(Math.max(volume, 0), MAX_VOLUME) : DEFAULT_VOLUME;
};

// The sound and volume are a preference of this browser, so they're remembered locally rather than on the server.
const useAmbiencePreference = () => {
  const [soundId, setSoundIdState] = useState(readSoundId);
  const [volume, setVolumeState] = useState(readVolume);

  const setSoundId = (nextSoundId: SoundId) => {
    setSoundIdState(nextSoundId);
    writeStorage(SOUND_STORAGE_KEY, nextSoundId);
  };

  const setVolume = (nextVolume: number) => {
    setVolumeState(nextVolume);
    writeStorage(VOLUME_STORAGE_KEY, String(nextVolume));
  };

  return { soundId, setSoundId, volume, setVolume };
};

export default useAmbiencePreference;

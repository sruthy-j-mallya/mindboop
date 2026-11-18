import { create } from "zustand";

import {
  DEFAULT_VOLUME,
  MAX_VOLUME,
  NO_SOUND,
  SOUND_STORAGE_KEY,
  SOUNDS,
  VOLUME_STORAGE_KEY,
} from "@/components/commons/Ambience/constants";
import type { SoundId } from "@/components/commons/Ambience/types";
import { readStorage, writeStorage } from "@/utils/storage";

type AmbienceStore = {
  soundId: SoundId;
  volume: number;
  setSoundId: (soundId: SoundId) => void;
  setVolume: (volume: number) => void;
};

const readSoundId = (): SoundId =>
  SOUNDS.find(({ id }) => id === readStorage(SOUND_STORAGE_KEY))?.id ?? NO_SOUND;

const readVolume = () => {
  const volume = Number(readStorage(VOLUME_STORAGE_KEY) ?? DEFAULT_VOLUME);

  return Number.isFinite(volume) ? Math.min(Math.max(volume, 0), MAX_VOLUME) : DEFAULT_VOLUME;
};

// The background sound, picked on the Timer page and played app-wide while a session runs. A preference of this
// browser, so it's remembered locally rather than on the server.
const useAmbienceStore = create<AmbienceStore>()((set) => ({
  soundId: readSoundId(),
  volume: readVolume(),
  setSoundId: (soundId) => {
    writeStorage(SOUND_STORAGE_KEY, soundId);
    set({ soundId });
  },
  setVolume: (volume) => {
    writeStorage(VOLUME_STORAGE_KEY, String(volume));
    set({ volume });
  },
}));

export default useAmbienceStore;

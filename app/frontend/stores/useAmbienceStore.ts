import { create } from "zustand";

import {
  DEFAULT_VOLUME,
  LIFE_AREA_SOUND_STORAGE_KEY,
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
  // The session the last area sound was switched to for, so it switches once per session.
  lifeAreaSoundTimeLogId: string | null;
  setSoundId: (soundId: SoundId) => void;
  setVolume: (volume: number) => void;
  applyLifeAreaSound: (timeLogId: string, soundId: SoundId) => void;
};

const readSoundId = (): SoundId =>
  SOUNDS.find(({ id }) => id === readStorage(SOUND_STORAGE_KEY))?.id ?? NO_SOUND;

const readVolume = () => {
  const volume = Number(readStorage(VOLUME_STORAGE_KEY) ?? DEFAULT_VOLUME);

  return Number.isFinite(volume) ? Math.min(Math.max(volume, 0), MAX_VOLUME) : DEFAULT_VOLUME;
};

// The background sound, picked on the Timer page and played app-wide while a session runs. A preference of this
// browser, so it's remembered locally rather than on the server.
//
// A session on a task in an area of life switches to the area's sound once, as it starts; a sound picked after that
// stays. The session it switched for is kept too, so a reload doesn't switch it back.
const useAmbienceStore = create<AmbienceStore>()((set, get) => ({
  soundId: readSoundId(),
  volume: readVolume(),
  lifeAreaSoundTimeLogId: readStorage(LIFE_AREA_SOUND_STORAGE_KEY),
  setSoundId: (soundId) => {
    writeStorage(SOUND_STORAGE_KEY, soundId);
    set({ soundId });
  },
  setVolume: (volume) => {
    writeStorage(VOLUME_STORAGE_KEY, String(volume));
    set({ volume });
  },
  applyLifeAreaSound: (timeLogId, soundId) => {
    if (soundId === NO_SOUND || get().lifeAreaSoundTimeLogId === timeLogId) return;

    writeStorage(SOUND_STORAGE_KEY, soundId);
    writeStorage(LIFE_AREA_SOUND_STORAGE_KEY, timeLogId);
    set({ soundId, lifeAreaSoundTimeLogId: timeLogId });
  },
}));

export default useAmbienceStore;

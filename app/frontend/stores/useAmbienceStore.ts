import { create } from "zustand";

import {
  DEFAULT_VOLUME,
  MAX_VOLUME,
  NO_SOUND,
  SOUND_STORAGE_KEY,
  SOUNDS,
  STARTING_SOUND_STORAGE_KEY,
  VOLUME_STORAGE_KEY,
} from "@/components/commons/Ambience/constants";
import type { SoundId } from "@/components/commons/Ambience/types";
import { readStorage, writeStorage } from "@/utils/storage";

type AmbienceStore = {
  soundId: SoundId;
  volume: number;
  // The session the last starting sound (its area's or routine's) was switched to for, so it switches once per session.
  startingSoundTimeLogId: string | null;
  setSoundId: (soundId: SoundId) => void;
  setVolume: (volume: number) => void;
  applyStartingSound: (timeLogId: string, soundId: SoundId) => void;
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
// A session on a routine, or on a task in an area of life, switches to its sound once, as it starts; a sound picked
// after that stays. The session it switched for is kept too, so a reload doesn't switch it back.
const useAmbienceStore = create<AmbienceStore>()((set, get) => ({
  soundId: readSoundId(),
  volume: readVolume(),
  startingSoundTimeLogId: readStorage(STARTING_SOUND_STORAGE_KEY),
  setSoundId: (soundId) => {
    writeStorage(SOUND_STORAGE_KEY, soundId);
    set({ soundId });
  },
  setVolume: (volume) => {
    writeStorage(VOLUME_STORAGE_KEY, String(volume));
    set({ volume });
  },
  applyStartingSound: (timeLogId, soundId) => {
    if (soundId === NO_SOUND || get().startingSoundTimeLogId === timeLogId) return;

    writeStorage(SOUND_STORAGE_KEY, soundId);
    writeStorage(STARTING_SOUND_STORAGE_KEY, timeLogId);
    set({ soundId, startingSoundTimeLogId: timeLogId });
  },
}));

export default useAmbienceStore;

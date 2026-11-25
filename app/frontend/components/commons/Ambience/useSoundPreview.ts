import { type ChangeEvent, useEffect, useState } from "react";

import useAmbienceStore from "@/stores/useAmbienceStore";

import { NO_SOUND, SOUND_PREVIEW_DURATION } from "./constants";
import type { SoundId } from "./types";
import useAmbience from "./useAmbience";

// Plays a few seconds of a background sound as it's picked, at the user's ambience volume. Picking another switches to
// it and starts the few seconds over; None stops it. It stops when the form closes.
const useSoundPreview = () => {
  const volume = useAmbienceStore((state) => state.volume);
  const [soundId, setSoundId] = useState<SoundId>(NO_SOUND);
  useAmbience({ soundId, volume, isPlaying: soundId !== NO_SOUND });

  useEffect(() => {
    if (soundId === NO_SOUND) return undefined;

    const timeout = window.setTimeout(() => setSoundId(NO_SOUND), SOUND_PREVIEW_DURATION);

    return () => window.clearTimeout(timeout);
  }, [soundId]);

  // For a radio's onChange: its value is the sound's id.
  const handleSoundChange = (event: ChangeEvent<HTMLInputElement>) =>
    setSoundId(event.target.value as SoundId);

  return handleSoundChange;
};

export default useSoundPreview;

import { getAudioContext } from "@/utils/audioContext";

import { PLAYERS } from "./players";
import type { CompletionSoundId } from "./types";

// Plays the user's completion sound. Silent for "none", and until their choice has loaded, since playing the default
// to someone who turned the sound off is worse than missing one chime. Unlock the audio (`unlockAudio`) in the click
// that completes the task, since the sound may play only after the save, outside the gesture.
export const playCompletionSound = (id?: CompletionSoundId) => {
  const context = getAudioContext();
  const play = id && PLAYERS.get(id);
  if (!context || !play) return;

  play(context, context.currentTime);
};

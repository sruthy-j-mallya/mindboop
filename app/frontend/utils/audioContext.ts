let audioContext: AudioContext | null = null;

// One context for the app's short cues (the break alarm, the completion chime). Null where Web Audio is missing.
export const getAudioContext = () => {
  if (typeof AudioContext === "undefined") return null;

  audioContext ??= new AudioContext();

  return audioContext;
};

// Browsers only allow sound after a user gesture, so call this from a click or key press.
export const unlockAudio = () => {
  void getAudioContext()?.resume();
};

import { getAudioContext } from "@/utils/audioContext";

import { ALARM_PATTERNS, DEFAULT_ALARM_SOUND, PREVIEW_MILLISECONDS } from "./constants";
import type { AlarmSoundId } from "./types";
import { renderPattern } from "./utils";

// Loops the alarm until the returned function is called. It starts once the sound is unlocked, if it isn't yet.
// Until the user's choice has loaded, the classic beep plays: an alarm should never stay silent.
export const startAlarmSound = (id: AlarmSoundId = DEFAULT_ALARM_SOUND) => {
  const context = getAudioContext();
  const pattern = ALARM_PATTERNS.get(id) ?? ALARM_PATTERNS.get(DEFAULT_ALARM_SOUND);
  if (!context || !pattern) return () => undefined;

  const samples = renderPattern(pattern, context.sampleRate);
  const buffer = context.createBuffer(1, samples.length, context.sampleRate);
  buffer.copyToChannel(samples, 0);

  const source = context.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  source.connect(context.destination);
  source.start();

  return () => {
    source.stop();
    source.disconnect();
  };
};

let stopPreview: (() => void) | null = null;

// Plays a few seconds of an alarm, for Settings. A new preview cuts off the one before.
export const previewAlarmSound = (id: AlarmSoundId) => {
  stopPreview?.();

  const stop = startAlarmSound(id);
  const timeout = setTimeout(() => stopPreview?.(), PREVIEW_MILLISECONDS);
  stopPreview = () => {
    clearTimeout(timeout);
    stop();
    stopPreview = null;
  };
};

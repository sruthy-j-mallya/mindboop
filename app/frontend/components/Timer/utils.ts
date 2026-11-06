import type { TimeLog } from "@/apis/types";

const SECONDS_PER_MINUTE = 60;

const pad = (value: number) => String(value).padStart(2, "0");

// The time log is the source of truth, so elapsed time is always derived from it and never counted on the client.
const getElapsedSeconds = (
  { accumulatedElapsedSeconds, isRunning, currentRunStartedAt }: TimeLog,
  currentTime: number,
) => {
  if (!isRunning || !currentRunStartedAt) return accumulatedElapsedSeconds;

  const currentRunSeconds = Math.floor((currentTime - Date.parse(currentRunStartedAt)) / 1000);

  return accumulatedElapsedSeconds + Math.max(currentRunSeconds, 0);
};

export const getTimerState = (timeLog: TimeLog, currentTime: number) => {
  const totalSeconds = ((timeLog.timerPreset ?? 0) + timeLog.bufferMinutes) * SECONDS_PER_MINUTE;
  const elapsedSeconds = Math.min(getElapsedSeconds(timeLog, currentTime), totalSeconds);

  return {
    remainingSeconds: totalSeconds - elapsedSeconds,
    progress: totalSeconds > 0 ? elapsedSeconds / totalSeconds : 1,
  };
};

export const formatRemainingTime = (remainingSeconds: number) => {
  const minutes = Math.floor(remainingSeconds / SECONDS_PER_MINUTE);

  return `${pad(minutes)}:${pad(remainingSeconds % SECONDS_PER_MINUTE)}`;
};

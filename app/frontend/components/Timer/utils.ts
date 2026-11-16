import type { TimeLog } from "@/apis/types";
import { SECONDS_PER_MINUTE } from "@/constants";

import { DISCARD_BELOW_MINUTES } from "./constants";

// The time log is the source of truth, so elapsed time is always derived from it and never counted on the client.
const getElapsedSeconds = (
  { accumulatedElapsedSeconds, isRunning, currentRunStartedAt }: TimeLog,
  currentTime: number,
) => {
  if (!isRunning || !currentRunStartedAt) return accumulatedElapsedSeconds;

  const currentRunSeconds = Math.floor((currentTime - Date.parse(currentRunStartedAt)) / 1000);

  return accumulatedElapsedSeconds + Math.max(currentRunSeconds, 0);
};

export const isTooShortToKeep = (timeLog: TimeLog, currentTime: number) =>
  getElapsedSeconds(timeLog, currentTime) < DISCARD_BELOW_MINUTES * SECONDS_PER_MINUTE;

export const getTimerState = (timeLog: TimeLog, currentTime: number) => {
  const totalSeconds = ((timeLog.timerPreset ?? 0) + timeLog.bufferMinutes) * SECONDS_PER_MINUTE;
  const elapsedSeconds = Math.min(getElapsedSeconds(timeLog, currentTime), totalSeconds);

  return {
    remainingSeconds: totalSeconds - elapsedSeconds,
    progress: totalSeconds > 0 ? elapsedSeconds / totalSeconds : 1,
  };
};

// What the clock shows: a timer counts down to zero, a stopwatch counts up and has no ring to fill.
export const getClockState = (
  timeLog: TimeLog,
  currentTime: number,
): { seconds: number; progress?: number } => {
  if (timeLog.mode === "stopwatch") return { seconds: getElapsedSeconds(timeLog, currentTime) };

  const { remainingSeconds, progress } = getTimerState(timeLog, currentTime);

  return { seconds: remainingSeconds, progress };
};

// A stopwatch has no end, so it keeps ticking for as long as it runs.
export const isTicking = (timeLog: TimeLog, currentTime: number) =>
  timeLog.isRunning &&
  (timeLog.mode === "stopwatch" || getTimerState(timeLog, currentTime).remainingSeconds > 0);

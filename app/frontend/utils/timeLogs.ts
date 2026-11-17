import type { TimeLog } from "@/apis/types";
import { DISCARD_BELOW_MINUTES, SECONDS_PER_MINUTE } from "@/constants";

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
    // The share of the time still left: the ring starts full and empties as the timer counts down.
    fill: totalSeconds > 0 ? (totalSeconds - elapsedSeconds) / totalSeconds : 0,
  };
};

// What the clock shows: a timer counts down to zero with a ring of the time left, a stopwatch counts up with none.
export const getClockState = (timeLog: TimeLog, currentTime: number): { seconds: number; fill?: number } => {
  if (timeLog.mode === "stopwatch") return { seconds: getElapsedSeconds(timeLog, currentTime) };

  const { remainingSeconds, fill } = getTimerState(timeLog, currentTime);

  return { seconds: remainingSeconds, fill };
};

// A stopwatch has no end, so it keeps ticking for as long as it runs.
export const isTicking = (timeLog: TimeLog, currentTime: number) =>
  timeLog.isRunning &&
  (timeLog.mode === "stopwatch" || getTimerState(timeLog, currentTime).remainingSeconds > 0);

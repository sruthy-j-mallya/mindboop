import type { EndTimeLogOptions, TimeLog } from "@/apis/types";
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

// Where a timer reaches zero: its preset plus any extensions.
const getPlannedSeconds = ({ timerPreset, bufferMinutes }: TimeLog) =>
  ((timerPreset ?? 0) + bufferMinutes) * SECONDS_PER_MINUTE;

// How far a timer has run past zero. A stopwatch has no end, so it never overruns.
export const getOverrunSeconds = (timeLog: TimeLog, currentTime: number) => {
  if (timeLog.mode !== "timer" || !timeLog.timerPreset) return 0;

  return Math.max(getElapsedSeconds(timeLog, currentTime) - getPlannedSeconds(timeLog), 0);
};

// With `discardOverrun`, only the time up to zero would be logged, so only that counts.
export const isTooShortToKeep = (
  timeLog: TimeLog,
  currentTime: number,
  { discardOverrun = false }: EndTimeLogOptions = {},
) => {
  const overrunSeconds = discardOverrun ? getOverrunSeconds(timeLog, currentTime) : 0;
  const loggedSeconds = getElapsedSeconds(timeLog, currentTime) - overrunSeconds;

  return loggedSeconds < DISCARD_BELOW_MINUTES * SECONDS_PER_MINUTE;
};

export const getTimerState = (timeLog: TimeLog, currentTime: number) => {
  const totalSeconds = getPlannedSeconds(timeLog);
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

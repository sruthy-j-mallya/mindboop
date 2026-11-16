import type { CreateTimeLogPayload, Task, TimeLogMode } from "@/apis/types";

import { MODES, TIMER_MINUTES_MAX, TIMER_MINUTES_MAX_DIGITS, TIMER_MINUTES_MIN } from "./constants";

export const findMode = (value: string) => MODES.find((mode) => mode.value === value)?.value;

// Keeps only digits, so the field can't hold seconds, signs or decimals.
export const sanitizeMinutes = (value: string) => value.replace(/\D/g, "").slice(0, TIMER_MINUTES_MAX_DIGITS);

// The minutes typed, capped at the maximum, or null when there's nothing usable (blank or zero) to keep.
export const parseMinutes = (value: string) => {
  const minutes = Number.parseInt(value, 10);
  if (Number.isNaN(minutes) || minutes < TIMER_MINUTES_MIN) return null;

  return Math.min(minutes, TIMER_MINUTES_MAX);
};

// Only a timer has a preset; a stopwatch counts up from zero.
export const buildTimeLogPayload = ({
  taskId,
  mode,
  timerMinutes,
}: {
  taskId: string;
  mode: TimeLogMode;
  timerMinutes: number;
}): CreateTimeLogPayload =>
  mode === "timer" ? { taskId, mode, timerPreset: timerMinutes } : { taskId, mode };

// A task's estimate presets the timer, unless it's longer than a timer can run.
export const getEstimatedTimerMinutes = ({ estimatedMinutes }: Task) =>
  estimatedMinutes && estimatedMinutes >= TIMER_MINUTES_MIN && estimatedMinutes <= TIMER_MINUTES_MAX
    ? estimatedMinutes
    : null;

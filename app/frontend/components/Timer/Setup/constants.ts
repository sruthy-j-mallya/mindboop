import type { StartableTimeLogMode, TaskFilters } from "@/apis/types";
import { DISCARD_BELOW_MINUTES } from "@/constants";

export const MODES: { value: StartableTimeLogMode; label: string }[] = [
  { value: "stopwatch", label: "Stopwatch" },
  { value: "timer", label: "Timer" },
];

export const DEFAULT_MODE: StartableTimeLogMode = "timer";

export const DEFAULT_TIMER_MINUTES = 5;
export const TIMER_PRESETS = [5, 15, 25, 45, 60];
// A shorter timer could never be logged, only discarded. Keep in sync with the timer_preset validation on TimeLog.
export const TIMER_MINUTES_MIN = DISCARD_BELOW_MINUTES;
export const TIMER_MINUTES_MAX = 240; // 4 hours
export const TIMER_MINUTES_MAX_DIGITS = String(TIMER_MINUTES_MAX).length;

export const OPEN_TASK_FILTERS: TaskFilters = { isCompleted: false };
export const TASK_SEARCH_DEBOUNCE = 250; // a quarter second

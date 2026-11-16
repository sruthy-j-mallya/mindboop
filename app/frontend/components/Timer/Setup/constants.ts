import type { TaskFilters, TimeLogMode } from "@/apis/types";

export const MODES: { value: TimeLogMode; label: string }[] = [
  { value: "stopwatch", label: "Stopwatch" },
  { value: "timer", label: "Timer" },
];

export const DEFAULT_MODE: TimeLogMode = "timer";

export const DEFAULT_TIMER_MINUTES = 5;
export const TIMER_MINUTES_MIN = 1;
export const TIMER_MINUTES_MAX = 240; // 4 hours
export const TIMER_MINUTES_MAX_DIGITS = String(TIMER_MINUTES_MAX).length;

export const OPEN_TASK_FILTERS: TaskFilters = { isCompleted: false };
export const TASK_SEARCH_DEBOUNCE = 250; // a quarter second

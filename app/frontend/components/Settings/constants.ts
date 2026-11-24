import type { Theme, WeekStartsOn } from "@/apis/types";

// Mirrors UserPreference::THEMES.
export const THEMES: { id: Theme; label: string }[] = [
  { id: "system", label: "Match my device" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];

// Mirrors UserPreference::WEEK_START_DAYS, from Monday (the default).
export const WEEK_START_DAYS: { id: WeekStartsOn; label: string }[] = [
  { id: 1, label: "Monday" },
  { id: 2, label: "Tuesday" },
  { id: 3, label: "Wednesday" },
  { id: 4, label: "Thursday" },
  { id: 5, label: "Friday" },
  { id: 6, label: "Saturday" },
  { id: 0, label: "Sunday" },
];

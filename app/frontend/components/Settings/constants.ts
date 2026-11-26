import type { Theme, TimeFormat, WeekStartsOn } from "@/apis/types";

// Mirrors UserPreference::THEMES.
export const THEMES: { id: Theme; label: string }[] = [
  { id: "system", label: "Match my device" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];

// Mirrors UserPreference::TIME_FORMATS.
export const TIME_FORMATS: { id: TimeFormat; label: string }[] = [
  { id: "12h", label: "12-hour (5:30pm)" },
  { id: "24h", label: "24-hour (17:30)" },
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

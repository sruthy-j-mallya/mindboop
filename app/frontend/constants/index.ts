import type { DatePreferences, WeekStartsOn } from "@/apis/types";

export const APP_NAME = "Mindboop";

export const API_BASE_PATH = "/api";

// Keep in sync with the length validation on User#password.
export const PASSWORD_MIN_LENGTH = 8;

// Keep in sync with Task::MAX_DESCRIPTION_LENGTH. Counts the stored Markdown, not the visible text.
export const TASK_DESCRIPTION_MAX_LENGTH = 10_000;

export const MINUTES_PER_HOUR = 60;

export const SECONDS_PER_MINUTE = 60;

// Mirrors TimeLog::MIN_LOGGED_MINUTES: a session with less focus than this can't be logged (completed or bailed out
// of), only discarded.
export const DISCARD_BELOW_MINUTES = 2;

// Keep in sync with Task::MAX_ESTIMATED_MINUTES.
export const TASK_ESTIMATE_MAX_MINUTES = 1440; // 24 hours

// Long enough to notice a slip and reach for Undo.
export const UNDO_TOAST_DURATION = 8_000; // 8 seconds

// Weeks (in the Calendar and the date pickers) start on the day picked in Settings, and on Monday until it has loaded
// or if it can't. Keep in sync with the `user_preferences.week_starts_on` column default.
export const DEFAULT_WEEK_STARTS_ON: WeekStartsOn = 1;

// Until the preference has loaded, or if it can't. `timeFormat`: keep in sync with the `user_preferences.time_format`
// column default.
export const DEFAULT_DATE_PREFERENCES: DatePreferences = {
  weekStartsOn: DEFAULT_WEEK_STARTS_ON,
  timeFormat: "12h",
};

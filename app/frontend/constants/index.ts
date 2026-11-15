export const API_BASE_PATH = "/api";

// Keep in sync with the length validation on User#password.
export const PASSWORD_MIN_LENGTH = 8;

// Keep in sync with Task::MAX_DESCRIPTION_LENGTH. Counts the stored Markdown, not the visible text.
export const TASK_DESCRIPTION_MAX_LENGTH = 10_000;

export const MINUTES_PER_HOUR = 60;

// Keep in sync with Task::MAX_ESTIMATED_MINUTES.
export const TASK_ESTIMATE_MAX_MINUTES = 1440; // 24 hours

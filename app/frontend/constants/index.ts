export const API_BASE_PATH = "/api";

// Keep in sync with the length validation on User#password.
export const PASSWORD_MIN_LENGTH = 8;

// Keep in sync with Task::MAX_DESCRIPTION_LENGTH. Counts the stored Markdown, not the visible text.
export const TASK_DESCRIPTION_MAX_LENGTH = 10_000;

import { z } from "zod";

// Keep in sync with TimeLog::MAX_TITLE_LENGTH.
export const TIME_LOG_TITLE_MAX_LENGTH = 255;

export const TIME_LOG_VALIDATION_SCHEMA = z.object({
  title: z.string().trim().max(TIME_LOG_TITLE_MAX_LENGTH, "Keep the title under 255 characters"),
  // The existing task the time goes to, instead of a title of its own.
  task: z.object({ id: z.string(), title: z.string() }).nullable(),
});

export type TimeLogFormValues = z.infer<typeof TIME_LOG_VALIDATION_SCHEMA>;

export const INITIAL_FORM_VALUES: TimeLogFormValues = { title: "", task: null };

// How many matching tasks are offered while typing.
export const TASK_SUGGESTION_LIMIT = 5;

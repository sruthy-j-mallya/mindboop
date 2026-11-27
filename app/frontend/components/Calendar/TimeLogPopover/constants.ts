import { z } from "zod";

// Keep in sync with TimeLog::MAX_TITLE_LENGTH.
export const TIME_LOG_TITLE_MAX_LENGTH = 255;

// The times start from the slot dragged over, and can be typed to the minute to fit beside other sessions. Mirrors
// TimeLog#times_fit_logging_window for the end.
export const TIME_LOG_VALIDATION_SCHEMA = z
  .object({
    title: z.string().trim().max(TIME_LOG_TITLE_MAX_LENGTH, "Keep the title under 255 characters"),
    // The existing task the time goes to, instead of a title of its own.
    task: z.object({ id: z.string(), title: z.string() }).nullable(),
    start: z.date(),
    end: z.date(),
  })
  .refine(({ start, end }) => end > start, { message: "End must be after the start", path: ["end"] });

export type TimeLogFormValues = z.infer<typeof TIME_LOG_VALIDATION_SCHEMA>;

// The times come from the range picked on the grid.
export const INITIAL_FORM_VALUES: Omit<TimeLogFormValues, "start" | "end"> = { title: "", task: null };

// How many matching tasks are offered while typing.
export const TASK_SUGGESTION_LIMIT = 5;

// A logged session can't grow while it's open, so its popover hugs the content and only caps at a saved task's size.
export const SHOW_POPOVER_CLASS_NAME =
  "flex max-h-[min(32rem,var(--radix-popover-content-available-height))] w-[30rem] max-w-[calc(100vw-2rem)] flex-col overflow-y-auto rounded-xl p-4";

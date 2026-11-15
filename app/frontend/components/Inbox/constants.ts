import { z } from "zod";

export const TASK_VALIDATION_SCHEMA = z.object({
  title: z.string().trim().min(1, "Say what you want to get done"),
});

export type TaskFormValues = z.infer<typeof TASK_VALIDATION_SCHEMA>;

export const INITIAL_FORM_VALUES: TaskFormValues = { title: "" };

// Only tasks still to do are listed; ticking one off takes it out of the Inbox.
export const INBOX_FILTERS = { isCompleted: false };

// Keeps "Today 5:30pm" turning overdue (and "Tomorrow" becoming "Today") while the page stays open.
export const SCHEDULE_REFRESH_INTERVAL = 60_000; // 1 minute

export const SCHEDULE_TONE_CLASS_NAMES = {
  overdue: "text-destructive",
  today: "text-primary",
  upcoming: "text-muted-foreground",
} as const;

// Long enough to notice a slip and reach for Undo.
export const UNDO_TOAST_DURATION = 8_000; // 8 seconds

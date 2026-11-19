import { z } from "zod";

export const TASK_VALIDATION_SCHEMA = z.object({
  title: z.string().trim().min(1, "Say what you want to get done"),
});

export type TaskFormValues = z.infer<typeof TASK_VALIDATION_SCHEMA>;

export const INITIAL_FORM_VALUES: TaskFormValues = { title: "" };

export const SEARCH_DEBOUNCE_DELAY = 300; // milliseconds

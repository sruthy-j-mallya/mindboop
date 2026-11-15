import { z } from "zod";

import { DESCRIPTION_SCHEMA } from "@/components/commons/TaskDescription/constants";

export const TASK_VALIDATION_SCHEMA = z.object({
  title: z.string().trim().min(1, "Say what you want to get done"),
  description: DESCRIPTION_SCHEMA,
  estimatedMinutes: z.number().nullable(),
  schedule: z.object({
    isDuration: z.boolean(),
    isAllDay: z.boolean(),
    startsAt: z.string().nullable(),
    endsAt: z.string().nullable(),
  }),
  // Only a new task's steps live in the form; a saved task's are saved one at a time.
  steps: z.array(z.object({ text: z.string(), isDone: z.boolean() })),
});

export type TaskFormValues = z.infer<typeof TASK_VALIDATION_SCHEMA>;

export const INITIAL_FORM_VALUES: Omit<TaskFormValues, "schedule"> = {
  title: "",
  description: "",
  estimatedMinutes: null,
  steps: [],
};

export const POPOVER_CLASS_NAME =
  "flex max-h-(--radix-popover-content-available-height) w-[30rem] max-w-[calc(100vw-2rem)] flex-col overflow-y-auto p-4";

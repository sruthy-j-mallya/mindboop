import { z } from "zod";

import { TASK_DESCRIPTION_MAX_LENGTH } from "@/constants";

export const TIMER_PRESETS = [5, 10, 15];
export const CUSTOM_TIMER_MIN = 20;
export const CUSTOM_TIMER_MAX = 240; // 4 hours

export const isValidCustomMinutes = (customMinutes: string) => {
  const minutes = Number(customMinutes);

  return Number.isInteger(minutes) && minutes >= CUSTOM_TIMER_MIN && minutes <= CUSTOM_TIMER_MAX;
};

export const QUICK_START_VALIDATION_SCHEMA = z
  .object({
    title: z.string().trim().min(1, "Say what you want to get done"),
    description: z
      .string()
      .trim()
      .max(TASK_DESCRIPTION_MAX_LENGTH, "This description is too long. Trim it down a little"),
    steps: z.array(z.object({ text: z.string(), isDone: z.boolean() })),
    presetMinutes: z.number().nullable(),
    customMinutes: z.string(),
  })
  .refine(
    ({ presetMinutes, customMinutes }) => presetMinutes !== null || isValidCustomMinutes(customMinutes),
    {
      error: `Pick a preset or enter ${CUSTOM_TIMER_MIN}–${CUSTOM_TIMER_MAX} whole minutes`,
      path: ["customMinutes"],
    },
  );

export type QuickStartFormValues = z.infer<typeof QUICK_START_VALIDATION_SCHEMA>;

export const INITIAL_FORM_VALUES: QuickStartFormValues = {
  title: "",
  description: "",
  steps: [],
  presetMinutes: TIMER_PRESETS[0],
  customMinutes: "",
};

export const DRAFT_STORAGE_KEY = "quick_start_draft";

// Only what the user wrote is kept across reloads; the estimate is quick to pick again.
export const DRAFT_SCHEMA = z.object({
  title: z.string(),
  description: z.string(),
  steps: z.array(z.object({ text: z.string(), isDone: z.boolean() })),
});

export type QuickStartDraft = z.infer<typeof DRAFT_SCHEMA>;

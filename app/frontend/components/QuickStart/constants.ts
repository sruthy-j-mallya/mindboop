import { z } from "zod";

export const TIMER_PRESETS = [5, 10, 15];
export const CUSTOM_TIMER_MIN = 20;
export const CUSTOM_TIMER_MAX = 60;

const isValidCustomMinutes = (customMinutes: string) => {
  const minutes = Number(customMinutes);

  return Number.isInteger(minutes) && minutes >= CUSTOM_TIMER_MIN && minutes <= CUSTOM_TIMER_MAX;
};

export const QUICK_START_VALIDATION_SCHEMA = z
  .object({
    title: z.string().trim().min(1, "Say what you want to get done"),
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
  steps: [],
  presetMinutes: TIMER_PRESETS[0],
  customMinutes: "",
};

import { z } from "zod";

import { TASK_ESTIMATE_MAX_MINUTES } from "@/constants";

export const ESTIMATE_PRESETS = [15, 30, 45, 60, 90, 120];

export const ESTIMATE_VALIDATION_SCHEMA = z.object({
  minutes: z.string().refine((minutes) => {
    const value = Number(minutes);

    return (
      minutes.trim() !== "" && Number.isInteger(value) && value > 0 && value <= TASK_ESTIMATE_MAX_MINUTES
    );
  }, `Enter 1–${TASK_ESTIMATE_MAX_MINUTES} whole minutes`),
});

export type EstimateFormValues = z.infer<typeof ESTIMATE_VALIDATION_SCHEMA>;

export const INITIAL_FORM_VALUES: EstimateFormValues = { minutes: "" };

import { z } from "zod";

import { MINUTES_PER_HOUR, TASK_ESTIMATE_MAX_MINUTES } from "@/constants";
import { formatMinutes } from "@/utils";

import { toTotalMinutes } from "./utils";

export const ESTIMATE_MAX_HOURS = TASK_ESTIMATE_MAX_MINUTES / MINUTES_PER_HOUR;

// A blank field counts as 0, so "2" hours with no minutes is 2 h.
const isWholeNumberUpTo = (value: string, max: number) => {
  if (value.trim() === "") return true;

  const number = Number(value);

  return Number.isInteger(number) && number >= 0 && number <= max;
};

export const ESTIMATE_VALIDATION_SCHEMA = z
  .object({
    hours: z
      .string()
      .refine(
        (hours) => isWholeNumberUpTo(hours, ESTIMATE_MAX_HOURS),
        `Enter 0–${ESTIMATE_MAX_HOURS} whole hours`,
      ),
    minutes: z
      .string()
      .refine(
        (minutes) => isWholeNumberUpTo(minutes, MINUTES_PER_HOUR - 1),
        `Enter 0–${MINUTES_PER_HOUR - 1} whole minutes`,
      ),
  })
  .refine(
    (values) => {
      const total = toTotalMinutes(values);

      return total > 0 && total <= TASK_ESTIMATE_MAX_MINUTES;
    },
    { message: `Enter 1 min to ${formatMinutes(TASK_ESTIMATE_MAX_MINUTES)}`, path: ["minutes"] },
  );

export type EstimateFormValues = z.infer<typeof ESTIMATE_VALIDATION_SCHEMA>;

export const INITIAL_FORM_VALUES: EstimateFormValues = { hours: "", minutes: "" };

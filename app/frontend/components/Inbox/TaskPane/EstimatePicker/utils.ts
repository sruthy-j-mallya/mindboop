import { MINUTES_PER_HOUR } from "@/constants";
import { formatMinutes } from "@/utils";

import type { EstimateFormValues } from "./constants";

export const toFormValues = (estimatedMinutes: number | null): EstimateFormValues => ({
  minutes: estimatedMinutes === null ? "" : String(estimatedMinutes),
});

// Echoes an hour or more back in hours, so "90" reads as "1 h 30 min".
export const getMinutesHint = (minutes: string) => {
  const value = Number(minutes);

  if (!Number.isInteger(value) || value < MINUTES_PER_HOUR) return undefined;

  return `That's ${formatMinutes(value)}`;
};

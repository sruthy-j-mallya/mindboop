import { MINUTES_PER_HOUR } from "@/constants";

import type { EstimateFormValues } from "./constants";

// Zero parts stay blank, so 30 reads as just "30" minutes and 120 as just "2" hours.
const toField = (value: number) => (value === 0 ? "" : String(value));

export const toFormValues = (estimatedMinutes: number | null): EstimateFormValues => {
  const total = estimatedMinutes ?? 0;

  return {
    hours: toField(Math.floor(total / MINUTES_PER_HOUR)),
    minutes: toField(total % MINUTES_PER_HOUR),
  };
};

// A blank field counts as 0. Typed inline because the schema in constants.ts calls this.
export const toTotalMinutes = ({ hours, minutes }: { hours: string; minutes: string }) =>
  Number(hours.trim() || 0) * MINUTES_PER_HOUR + Number(minutes.trim() || 0);

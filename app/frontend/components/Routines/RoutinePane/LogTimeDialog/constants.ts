import { z } from "zod";

export const MINUTES_PER_DAY = 24 * 60;

export const TIME_FORMAT = "HH:mm";

// A past day has no obvious time, so it starts from a plain one.
export const DEFAULT_START_HOUR = 9;

export const LOG_TIME_VALIDATION_SCHEMA = z.object({
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Pick a time"),
  minutes: z
    .number({ error: "Enter the minutes" })
    .int("Use whole minutes")
    .min(1, "At least 1 minute")
    .max(MINUTES_PER_DAY, "Up to 24 hours"),
});

export type LogTimeFormValues = z.infer<typeof LOG_TIME_VALIDATION_SCHEMA>;

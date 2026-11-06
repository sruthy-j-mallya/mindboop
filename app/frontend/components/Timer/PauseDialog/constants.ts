import { z } from "zod";

export const MAX_BREAK_MINUTES = 15;
export const MAX_INTENTION_LENGTH = 100;

export const BREAK_PRESETS = [
  { intention: "Delivery", durationMinutes: 5 },
  { intention: "Short walk", durationMinutes: 10 },
  { intention: "Bathroom", durationMinutes: 3 },
  { intention: "Snack", durationMinutes: 10 },
];

const DURATION_ERROR = `Enter 1–${MAX_BREAK_MINUTES} whole minutes`;

export const BREAK_VALIDATION_SCHEMA = z.object({
  intention: z
    .string()
    .trim()
    .min(1, "Say what you're stepping away for")
    .max(MAX_INTENTION_LENGTH, `Keep it under ${MAX_INTENTION_LENGTH} characters`),
  durationMinutes: z
    .number({ error: DURATION_ERROR })
    .int(DURATION_ERROR)
    .min(1, DURATION_ERROR)
    .max(MAX_BREAK_MINUTES, DURATION_ERROR),
});

export type BreakFormValues = z.infer<typeof BREAK_VALIDATION_SCHEMA>;

export const INITIAL_FORM_VALUES: BreakFormValues = { intention: "", durationMinutes: 5 };

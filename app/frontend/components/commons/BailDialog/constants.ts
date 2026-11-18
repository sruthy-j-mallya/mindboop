import { z } from "zod";

export const MAX_DESCRIPTION_LENGTH = 1000;

const LENGTH_ERROR = `Keep it under ${MAX_DESCRIPTION_LENGTH} characters`;

export const BREADCRUMB_VALIDATION_SCHEMA = z.object({
  completedDescription: z.string().trim().max(MAX_DESCRIPTION_LENGTH, LENGTH_ERROR),
  restartDescription: z
    .string()
    .trim()
    .min(1, "Say where to pick this up")
    .max(MAX_DESCRIPTION_LENGTH, LENGTH_ERROR),
});

export type BreadcrumbFormValues = z.infer<typeof BREADCRUMB_VALIDATION_SCHEMA>;

export const INITIAL_FORM_VALUES: BreadcrumbFormValues = { completedDescription: "", restartDescription: "" };

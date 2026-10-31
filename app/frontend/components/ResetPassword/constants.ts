import { z } from "zod";

import { PASSWORD_MIN_LENGTH } from "@/constants";

export const RESET_PASSWORD_VALIDATION_SCHEMA = z
  .object({
    password: z.string().min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters`),
    passwordConfirmation: z.string(),
  })
  .refine(({ password, passwordConfirmation }) => password === passwordConfirmation, {
    message: "Passwords don't match",
    path: ["passwordConfirmation"],
  });

export type ResetPasswordFormValues = z.infer<typeof RESET_PASSWORD_VALIDATION_SCHEMA>;

export const INITIAL_FORM_VALUES: ResetPasswordFormValues = { password: "", passwordConfirmation: "" };

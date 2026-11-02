import { z } from "zod";

import { PASSWORD_MIN_LENGTH } from "@/constants";

export const COMPLETE_SIGNUP_VALIDATION_SCHEMA = z
  .object({
    password: z.string().min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters`),
    passwordConfirmation: z.string(),
  })
  .refine(({ password, passwordConfirmation }) => password === passwordConfirmation, {
    message: "Passwords don't match",
    path: ["passwordConfirmation"],
  });

export type CompleteSignupFormValues = z.infer<typeof COMPLETE_SIGNUP_VALIDATION_SCHEMA>;

export const INITIAL_FORM_VALUES: CompleteSignupFormValues = { password: "", passwordConfirmation: "" };

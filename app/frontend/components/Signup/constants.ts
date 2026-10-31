import { z } from "zod";

import { PASSWORD_MIN_LENGTH } from "@/constants";

export const SIGNUP_VALIDATION_SCHEMA = z
  .object({
    emailAddress: z.email("Enter a valid email address"),
    password: z.string().min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters`),
    passwordConfirmation: z.string(),
  })
  .refine(({ password, passwordConfirmation }) => password === passwordConfirmation, {
    message: "Passwords don't match",
    path: ["passwordConfirmation"],
  });

export type SignupFormValues = z.infer<typeof SIGNUP_VALIDATION_SCHEMA>;

export const INITIAL_FORM_VALUES: SignupFormValues = {
  emailAddress: "",
  password: "",
  passwordConfirmation: "",
};

import { z } from "zod";

export const SIGNUP_VALIDATION_SCHEMA = z.object({
  emailAddress: z.email("Enter a valid email address"),
});

export type SignupFormValues = z.infer<typeof SIGNUP_VALIDATION_SCHEMA>;

export const INITIAL_FORM_VALUES: SignupFormValues = { emailAddress: "" };

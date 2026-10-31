import { z } from "zod";

export const FORGOT_PASSWORD_VALIDATION_SCHEMA = z.object({
  emailAddress: z.email("Enter a valid email address"),
});

export type ForgotPasswordFormValues = z.infer<typeof FORGOT_PASSWORD_VALIDATION_SCHEMA>;

export const INITIAL_FORM_VALUES: ForgotPasswordFormValues = { emailAddress: "" };

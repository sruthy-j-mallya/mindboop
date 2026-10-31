import { z } from "zod";

export const LOGIN_VALIDATION_SCHEMA = z.object({
  emailAddress: z.email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

export type LoginFormValues = z.infer<typeof LOGIN_VALIDATION_SCHEMA>;

export const INITIAL_FORM_VALUES: LoginFormValues = { emailAddress: "", password: "" };

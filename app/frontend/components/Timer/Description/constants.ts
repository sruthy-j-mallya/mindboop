import { z } from "zod";

import { TASK_DESCRIPTION_MAX_LENGTH } from "@/constants";

export const DESCRIPTION_VALIDATION_SCHEMA = z.object({
  description: z
    .string()
    .trim()
    .max(TASK_DESCRIPTION_MAX_LENGTH, "This description is too long. Trim it down a little"),
});

export type DescriptionFormValues = z.infer<typeof DESCRIPTION_VALIDATION_SCHEMA>;

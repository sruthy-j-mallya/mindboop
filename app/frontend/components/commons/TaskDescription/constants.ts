import { z } from "zod";

import { TASK_DESCRIPTION_MAX_LENGTH } from "@/constants";

export const DESCRIPTION_SCHEMA = z
  .string()
  .trim()
  .max(TASK_DESCRIPTION_MAX_LENGTH, "This description is too long. Trim it down a little");

// Long enough to save once per pause in typing rather than per keystroke; a blur saves straight away.
export const DESCRIPTION_SAVE_DELAY = 800; // ms

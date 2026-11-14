import { z } from "zod";

import type { ParkingLotItemKind } from "@/apis/types";

export const PARKING_LOT_ITEM_KINDS = ["idea", "question", "task"] as const satisfies ParkingLotItemKind[];

// Keep in sync with ParkingLotItem::MAX_CONTENT_LENGTH.
export const PARKING_LOT_ITEM_CONTENT_MAX_LENGTH = 1000;

export const PARK_VALIDATION_SCHEMA = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Type the thought you want to park")
    .max(PARKING_LOT_ITEM_CONTENT_MAX_LENGTH, "Keep it under 1,000 characters"),
  kind: z.enum(PARKING_LOT_ITEM_KINDS),
});

export type ParkFormValues = z.infer<typeof PARK_VALIDATION_SCHEMA>;

export const INITIAL_FORM_VALUES: ParkFormValues = { content: "", kind: "idea" };

// Translucent brand tints, so the cards read on the light and the dark theme alike.
export const KIND_CLASS_NAMES: Record<ParkingLotItemKind, string> = {
  idea: "bg-brand-yellow/25",
  question: "bg-brand-coral/25",
  task: "bg-brand-beige/40",
};

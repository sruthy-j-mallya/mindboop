import { z } from "zod";

// Keep in sync with ParkingLotItem::MAX_CONTENT_LENGTH.
export const PARKING_LOT_ITEM_CONTENT_MAX_LENGTH = 1000;

// Keep in sync with ParkingLotItem::CURIOSITY_MINUTES.
export const CURIOSITY_MINUTES = 5;

export const PARKING_LOT_TAGLINE =
  "Ideas, curiosities, worries, feelings. Whatever pops up, park it here. It'll wait.";

export const PARK_VALIDATION_SCHEMA = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Type the thought you want to park")
    .max(PARKING_LOT_ITEM_CONTENT_MAX_LENGTH, "Keep it under 1,000 characters"),
});

export type ParkFormValues = z.infer<typeof PARK_VALIDATION_SCHEMA>;

export const INITIAL_FORM_VALUES: ParkFormValues = { content: "" };

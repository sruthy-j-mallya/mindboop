import { z } from "zod";

import { SOUNDS } from "@/components/commons/Ambience/constants";
import type { SoundId } from "@/components/commons/Ambience/types";
import { LIFE_AREA_COLORS, LIFE_AREA_ICONS } from "@/components/commons/LifeArea/constants";
import type { LifeAreaColorId, LifeAreaIconId } from "@/components/commons/LifeArea/types";

// Mirrors `LifeArea::MAX_NAME_LENGTH` on the server.
export const LIFE_AREA_NAME_MAX_LENGTH = 40;

const toEnumValues = <T extends string>(options: { id: T }[]) => options.map(({ id }) => id) as [T, ...T[]];

export const LIFE_AREA_VALIDATION_SCHEMA = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Give the area a name")
    .max(LIFE_AREA_NAME_MAX_LENGTH, `Keep the name to ${LIFE_AREA_NAME_MAX_LENGTH} characters`),
  color: z.enum(toEnumValues<LifeAreaColorId>(LIFE_AREA_COLORS)),
  icon: z.enum(toEnumValues<LifeAreaIconId>(LIFE_AREA_ICONS)),
  defaultSound: z.enum(toEnumValues<SoundId>(SOUNDS)),
});

export type LifeAreaFormValues = z.infer<typeof LIFE_AREA_VALIDATION_SCHEMA>;

export const INITIAL_FORM_VALUES: LifeAreaFormValues = {
  name: "",
  color: "indigo",
  icon: "sparkles",
  defaultSound: "none",
};

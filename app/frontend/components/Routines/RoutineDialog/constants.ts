import { z } from "zod";

import { SOUNDS } from "@/components/commons/Ambience/constants";
import type { SoundId } from "@/components/commons/Ambience/types";
import { LIFE_AREA_COLORS } from "@/components/commons/LifeArea/constants";
import type { LifeAreaColorId } from "@/components/commons/LifeArea/types";
import { ROUTINE_ICONS } from "@/components/commons/Routine/constants";
import type { RoutineIconId } from "@/components/commons/Routine/types";

// Mirror `Routine::MAX_TITLE_LENGTH`, `MIN_DURATION_MINUTES` and `MAX_DURATION_MINUTES` on the server.
export const ROUTINE_TITLE_MAX_LENGTH = 60;
export const ROUTINE_MIN_MINUTES = 5;
export const ROUTINE_MAX_MINUTES = 240;

export const DURATION_PRESETS = [5, 10, 15, 20, 30, 45, 60];

export const REMINDER_FREQUENCIES = [
  { id: "off", label: "Off" },
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "custom", label: "Custom" },
] as const;

export type ReminderFrequency = (typeof REMINDER_FREQUENCIES)[number]["id"];

const toEnumValues = <T extends string>(options: readonly { id: T }[]) =>
  options.map(({ id }) => id) as [T, ...T[]];

export const ROUTINE_VALIDATION_SCHEMA = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Give the routine a name")
      .max(ROUTINE_TITLE_MAX_LENGTH, `Keep the name to ${ROUTINE_TITLE_MAX_LENGTH} characters`),
    durationMinutes: z
      .number({ error: "Enter the minutes" })
      .int("Use whole minutes")
      .min(ROUTINE_MIN_MINUTES, `At least ${ROUTINE_MIN_MINUTES} minutes`)
      .max(ROUTINE_MAX_MINUTES, `Up to ${ROUTINE_MAX_MINUTES} minutes`),
    icon: z.enum(toEnumValues<RoutineIconId>(ROUTINE_ICONS)),
    color: z.enum(toEnumValues<LifeAreaColorId>(LIFE_AREA_COLORS)),
    sound: z.enum(toEnumValues<SoundId>(SOUNDS)),
    reminderFrequency: z.enum(toEnumValues<ReminderFrequency>(REMINDER_FREQUENCIES)),
    reminderTime: z.string(),
    reminderDays: z.array(z.number().int().min(0).max(6)),
  })
  .superRefine(({ reminderFrequency, reminderTime, reminderDays }, context) => {
    if (reminderFrequency === "off") return;

    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(reminderTime)) {
      context.addIssue({ code: "custom", path: ["reminderTime"], message: "Pick a time" });
    }
    if (reminderFrequency !== "daily" && reminderDays.length === 0) {
      context.addIssue({ code: "custom", path: ["reminderDays"], message: "Pick a day" });
    }
  });

export type RoutineFormValues = z.infer<typeof ROUTINE_VALIDATION_SCHEMA>;

export const INITIAL_FORM_VALUES: RoutineFormValues = {
  title: "",
  durationMinutes: 10,
  icon: "sparkles",
  color: "indigo",
  sound: "none",
  reminderFrequency: "off",
  reminderTime: "09:00",
  reminderDays: [],
};

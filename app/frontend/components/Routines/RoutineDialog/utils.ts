import type { CreateRoutinePayload, Routine } from "@/apis/types";

import { ALL_WEEKDAYS } from "../constants";
import { INITIAL_FORM_VALUES, type ReminderFrequency, type RoutineFormValues } from "./constants";

// The days the frequency stands for: every day, the one or several picked, or none without a reminder.
const toReminderDays = ({ reminderFrequency, reminderDays }: RoutineFormValues) => {
  if (reminderFrequency === "off") return [];
  if (reminderFrequency === "daily") return ALL_WEEKDAYS;

  return reminderFrequency === "weekly" ? reminderDays.slice(0, 1) : reminderDays;
};

// Only the routine's fields go to the server; the frequency is read back from the days.
export const toRoutinePayload = (values: RoutineFormValues): CreateRoutinePayload => ({
  title: values.title,
  durationMinutes: values.durationMinutes,
  emoji: values.emoji,
  color: values.color,
  sound: values.sound,
  reminderTime: values.reminderFrequency === "off" ? null : values.reminderTime,
  reminderDays: toReminderDays(values),
});

const toReminderFrequency = ({ reminderTime, reminderDays }: Routine): ReminderFrequency => {
  if (!reminderTime || reminderDays.length === 0) return "off";
  if (reminderDays.length === ALL_WEEKDAYS.length) return "daily";

  return reminderDays.length === 1 ? "weekly" : "custom";
};

export const toRoutineFormValues = (routine: Routine): RoutineFormValues => ({
  title: routine.title,
  durationMinutes: routine.durationMinutes,
  emoji: routine.emoji,
  color: routine.color,
  sound: routine.sound,
  reminderFrequency: toReminderFrequency(routine),
  reminderTime: routine.reminderTime ?? INITIAL_FORM_VALUES.reminderTime,
  reminderDays: routine.reminderDays,
});

import { differenceInCalendarDays, format, parse, parseISO } from "date-fns";
import { generatePath } from "react-router";

import type { Routine, TimeLog, WeekStartsOn } from "@/apis/types";
import { SECONDS_PER_MINUTE } from "@/constants";
import routes from "@/routes";
import { formatMinutes } from "@/utils";

import { ALL_WEEKDAYS, DAY_KEY_FORMAT, WEEKDAYS } from "./constants";

export const getRoutinePath = (routineId: string) => generatePath(routes.routines.show, { routineId });

// "Today", "Yesterday", "3 days ago": a plain fact, never a count of days missed.
export const formatLastDone = (lastDoneAt: string, now: Date) => {
  const days = differenceInCalendarDays(now, parseISO(lastDoneAt));
  if (days <= 0) return "Today";

  return days === 1 ? "Yesterday" : `${days} days ago`;
};

// "1 h 59 min", rounded to the minute.
export const formatTotalTime = (seconds: number) => formatMinutes(Math.round(seconds / SECONDS_PER_MINUTE));

// "8:30 AM" in the browser's locale.
const formatReminderTime = (time: string) => format(parse(time, "HH:mm", new Date()), "p");

// "Daily at 8:30 AM", "Mondays at 8:30 AM", "Mon, Wed, Fri at 8:30 AM", or null without a reminder.
export const describeReminder = ({
  reminderTime,
  reminderDays,
}: Pick<Routine, "reminderTime" | "reminderDays">) => {
  if (!reminderTime || reminderDays.length === 0) return null;

  const time = formatReminderTime(reminderTime);
  if (reminderDays.length === ALL_WEEKDAYS.length) return `Daily at ${time}`;

  const days = WEEKDAYS.filter(({ value }) => reminderDays.includes(value));
  if (days.length === 1) return `${days[0].label}s at ${time}`;

  return `${days.map(({ label }) => label.slice(0, 3)).join(", ")} at ${time}`;
};

// Minutes done per day ("2026-11-19" → 25), by the day each session started on.
export const getMinutesByDay = (timeLogs: TimeLog[]) =>
  timeLogs.reduce((minutesByDay, { startedAt, accumulatedElapsedSeconds }) => {
    const day = format(parseISO(startedAt), DAY_KEY_FORMAT);
    const minutes = Math.round(accumulatedElapsedSeconds / SECONDS_PER_MINUTE);

    return new Map(minutesByDay).set(day, (minutesByDay.get(day) ?? 0) + minutes);
  }, new Map<string, number>());

// "Add 3 routines", or a nudge to pick some first.
export const describeAddButton = (count: number, isAdding: boolean) => {
  if (isAdding) return "Adding…";
  if (count === 0) return "Pick some to add";

  return count === 1 ? "Add 1 routine" : `Add ${count} routines`;
};

// The weekdays in order, from the one weeks start on.
export const getWeekdays = (weekStartsOn: WeekStartsOn) => {
  const first = WEEKDAYS.findIndex(({ value }) => value === weekStartsOn);

  return [...WEEKDAYS.slice(first), ...WEEKDAYS.slice(0, first)];
};

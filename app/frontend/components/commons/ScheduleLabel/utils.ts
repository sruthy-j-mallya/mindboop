import { addDays, isBefore, isSameDay, isSameWeek, parseISO, startOfDay, subDays } from "date-fns";

import type { DatePreferences } from "@/apis/types";
import { DEFAULT_DATE_PREFERENCES } from "@/constants";
import { formatDate, formatTime, formatTimeRange, formatWeekdayDate } from "@/utils/dateTime";

import type { Schedule, ScheduleTone } from "./types";

// "Today", "Tomorrow", "Yesterday", "Fri, 5 Nov" within this week, "12 Aug" this year, "12 Aug 2027" otherwise.
const formatDay = (date: Date, now: Date, preferences: DatePreferences) => {
  if (isSameDay(date, now)) return "Today";

  if (isSameDay(date, addDays(now, 1))) return "Tomorrow";

  if (isSameDay(date, subDays(now, 1))) return "Yesterday";

  if (isSameWeek(date, now, { weekStartsOn: preferences.weekStartsOn })) return formatWeekdayDate(date);

  return formatDate(date, now);
};

const formatMoment = (date: Date, hasTime: boolean, now: Date, preferences: DatePreferences) => {
  const day = formatDay(date, now, preferences);

  return hasTime ? `${day}, ${formatTime(date, preferences.timeFormat)}` : day;
};

// A human-readable date or duration for a scheduled task ("Today, 5:30pm", "Tomorrow, 1 – 2am",
// "12 Aug – 15 Aug"), or null when the task isn't scheduled.
export const formatSchedule = (
  { isDuration, isAllDay, startsAt, endsAt }: Schedule,
  now: number,
  preferences: DatePreferences = DEFAULT_DATE_PREFERENCES,
) => {
  if (!startsAt) return null;

  const today = new Date(now);
  const start = parseISO(startsAt);
  if (!isDuration || !endsAt) return formatMoment(start, !isAllDay, today, preferences);

  const end = parseISO(endsAt);
  if (isAllDay) {
    return isSameDay(start, end)
      ? formatDay(start, today, preferences)
      : `${formatDay(start, today, preferences)} – ${formatDay(end, today, preferences)}`;
  }

  if (isSameDay(start, end))
    return `${formatDay(start, today, preferences)}, ${formatTimeRange(start, end, preferences.timeFormat)}`;

  return `${formatMoment(start, true, today, preferences)} – ${formatMoment(end, true, today, preferences)}`;
};

// A schedule in a list of today's tasks: only the time, or "All day". One that reaches into other days keeps them.
export const formatTodaySchedule = (
  schedule: Schedule,
  now: number,
  preferences: DatePreferences = DEFAULT_DATE_PREFERENCES,
) => {
  const { isDuration, isAllDay, startsAt, endsAt } = schedule;
  if (!startsAt) return null;

  const start = parseISO(startsAt);
  const end = isDuration && endsAt ? parseISO(endsAt) : start;
  if (!isSameDay(start, now) || !isSameDay(end, now)) {
    return formatSchedule(schedule, now, preferences);
  }

  if (isAllDay) return "All day";

  return isDuration
    ? formatTimeRange(start, end, preferences.timeFormat)
    : formatTime(start, preferences.timeFormat);
};

export const getScheduleTone = (
  { isDuration, isAllDay, startsAt, endsAt }: Schedule,
  now: number,
): ScheduleTone => {
  if (!startsAt) return "upcoming";

  const start = parseISO(startsAt);
  const due = isDuration && endsAt ? parseISO(endsAt) : start;
  const isOverdue = isAllDay ? isBefore(startOfDay(due), startOfDay(now)) : isBefore(due, now);
  if (isOverdue) return "overdue";

  return isBefore(startOfDay(start), addDays(startOfDay(now), 1)) ? "today" : "upcoming";
};

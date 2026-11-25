import {
  addDays,
  format,
  isBefore,
  isSameDay,
  isSameWeek,
  isSameYear,
  parseISO,
  startOfDay,
  subDays,
} from "date-fns";

import type { WeekStartsOn } from "@/apis/types";
import { DEFAULT_WEEK_STARTS_ON } from "@/constants";

import type { Schedule, ScheduleTone } from "./types";

// "5:30" or, on the hour, "5".
const formatClock = (date: Date) => format(date, date.getMinutes() === 0 ? "h" : "h:mm");

// "5:30pm", "12pm".
const formatTime = (date: Date) => `${formatClock(date)}${format(date, "aaa")}`;

// "10 – 11am", "11am – 1pm": am or pm shows once when both times share it.
const formatTimeRange = (start: Date, end: Date) => {
  const isSameHalf = format(start, "aaa") === format(end, "aaa");

  return `${isSameHalf ? formatClock(start) : formatTime(start)} – ${formatTime(end)}`;
};

// "Today", "Tomorrow", "Yesterday", "Fri, Nov 5" within this week, "12 Aug" this year, "12 Aug 2027" otherwise.
const formatDay = (date: Date, now: Date, weekStartsOn: WeekStartsOn) => {
  if (isSameDay(date, now)) return "Today";

  if (isSameDay(date, addDays(now, 1))) return "Tomorrow";

  if (isSameDay(date, subDays(now, 1))) return "Yesterday";

  if (isSameWeek(date, now, { weekStartsOn })) return format(date, "EEE, MMM d");

  return format(date, isSameYear(date, now) ? "d MMM" : "d MMM yyyy");
};

const formatMoment = (date: Date, hasTime: boolean, now: Date, weekStartsOn: WeekStartsOn) => {
  const day = formatDay(date, now, weekStartsOn);

  return hasTime ? `${day}, ${formatTime(date)}` : day;
};

// A human-readable date or duration for a scheduled task ("Today, 5:30pm", "Tomorrow, 1 – 2am",
// "12 Aug – 15 Aug"), or null when the task isn't scheduled.
export const formatSchedule = (
  { isDuration, isAllDay, startsAt, endsAt }: Schedule,
  now: number,
  weekStartsOn: WeekStartsOn = DEFAULT_WEEK_STARTS_ON,
) => {
  if (!startsAt) return null;

  const today = new Date(now);
  const start = parseISO(startsAt);
  if (!isDuration || !endsAt) return formatMoment(start, !isAllDay, today, weekStartsOn);

  const end = parseISO(endsAt);
  if (isAllDay) {
    return isSameDay(start, end)
      ? formatDay(start, today, weekStartsOn)
      : `${formatDay(start, today, weekStartsOn)} – ${formatDay(end, today, weekStartsOn)}`;
  }

  if (isSameDay(start, end))
    return `${formatDay(start, today, weekStartsOn)}, ${formatTimeRange(start, end)}`;

  return `${formatMoment(start, true, today, weekStartsOn)} – ${formatMoment(end, true, today, weekStartsOn)}`;
};

// A schedule in a list of today's tasks: only the time, or "All day". One that reaches into other days keeps them.
export const formatTodaySchedule = (
  schedule: Schedule,
  now: number,
  weekStartsOn: WeekStartsOn = DEFAULT_WEEK_STARTS_ON,
) => {
  const { isDuration, isAllDay, startsAt, endsAt } = schedule;
  if (!startsAt) return null;

  const start = parseISO(startsAt);
  const end = isDuration && endsAt ? parseISO(endsAt) : start;
  if (!isSameDay(start, now) || !isSameDay(end, now)) {
    return formatSchedule(schedule, now, weekStartsOn);
  }

  if (isAllDay) return "All day";

  return isDuration ? formatTimeRange(start, end) : formatTime(start);
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

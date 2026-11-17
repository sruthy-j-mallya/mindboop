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

import type { Schedule, ScheduleTone } from "./types";

// Weeks start on Monday, as in the date picker.
const WEEK_OPTIONS = { weekStartsOn: 1 } as const;

// "5:30pm", "12:00pm".
const formatTime = (date: Date) => format(date, "h:mmaaa");

// "Today", "Tomorrow", "Yesterday", "Fri, Nov 5" within this week, "12 Aug" this year, "12 Aug 2027" otherwise.
const formatDay = (date: Date, now: Date) => {
  if (isSameDay(date, now)) return "Today";

  if (isSameDay(date, addDays(now, 1))) return "Tomorrow";

  if (isSameDay(date, subDays(now, 1))) return "Yesterday";

  if (isSameWeek(date, now, WEEK_OPTIONS)) return format(date, "EEE, MMM d");

  return format(date, isSameYear(date, now) ? "d MMM" : "d MMM yyyy");
};

const formatMoment = (date: Date, hasTime: boolean, now: Date) =>
  hasTime ? `${formatDay(date, now)} ${formatTime(date)}` : formatDay(date, now);

// A human-readable date or duration for a scheduled task ("Today 5:30pm", "Tomorrow 1:00am – 2:00am",
// "12 Aug – 15 Aug"), or null when the task isn't scheduled.
export const formatSchedule = ({ isDuration, isAllDay, startsAt, endsAt }: Schedule, now: number) => {
  if (!startsAt) return null;

  const today = new Date(now);
  const start = parseISO(startsAt);
  if (!isDuration || !endsAt) return formatMoment(start, !isAllDay, today);

  const end = parseISO(endsAt);
  if (isAllDay) {
    return isSameDay(start, end)
      ? formatDay(start, today)
      : `${formatDay(start, today)} – ${formatDay(end, today)}`;
  }

  if (isSameDay(start, end)) return `${formatMoment(start, true, today)} – ${formatTime(end)}`;

  return `${formatMoment(start, true, today)} – ${formatMoment(end, true, today)}`;
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

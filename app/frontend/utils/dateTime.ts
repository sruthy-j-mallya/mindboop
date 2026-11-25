import { format, isSameDay, isSameYear } from "date-fns";

import type { TimeFormat } from "@/apis/types";

// How dates and times read across the app. `timeFormat` is the clock picked in Settings (`useDatePreferences`).

// "12 Nov" this year, "12 Nov 2027" in any other.
export const formatDate = (date: Date, now: Date | number) =>
  format(date, isSameYear(date, now) ? "d MMM" : "d MMM yyyy");

// "Thu, 12 Nov".
export const formatWeekdayDate = (date: Date) => format(date, "EEE, d MMM");

// "Thursday, 12 November".
export const formatLongDate = (date: Date) => format(date, "EEEE, d MMMM");

// "5:30" or, on the hour, "5".
const formatShortClock = (date: Date) => format(date, date.getMinutes() === 0 ? "h" : "h:mm");

// "5:30pm" and "5pm", or "17:30" and "17:00".
export const formatTime = (date: Date, timeFormat: TimeFormat) =>
  timeFormat === "24h" ? format(date, "HH:mm") : `${formatShortClock(date)}${format(date, "aaa")}`;

// "10 – 11am", "11am – 1pm": am or pm shows once when both times share it. Or "10:00 – 11:00".
export const formatTimeRange = (start: Date, end: Date, timeFormat: TimeFormat) => {
  const isShared =
    timeFormat === "12h" && isSameDay(start, end) && format(start, "aaa") === format(end, "aaa");

  return `${isShared ? formatShortClock(start) : formatTime(start, timeFormat)} – ${formatTime(end, timeFormat)}`;
};

// "12 Nov, 5:30pm".
export const formatDateTime = (date: Date, now: Date | number, timeFormat: TimeFormat) =>
  `${formatDate(date, now)}, ${formatTime(date, timeFormat)}`;

// "23 – 29 November", or "30 Nov – 6 Dec" across months.
export const formatDayRange = (start: Date, end: Date) =>
  start.getMonth() === end.getMonth()
    ? `${format(start, "d")} – ${format(end, "d MMMM")}`
    : `${format(start, "d MMM")} – ${format(end, "d MMM")}`;

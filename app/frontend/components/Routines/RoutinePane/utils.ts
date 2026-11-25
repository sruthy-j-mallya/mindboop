import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import { formatMinutes } from "@/utils";

import { DAY_KEY_FORMAT } from "../constants";
import type { MonthDay } from "./types";

const WEEK_OPTIONS = { weekStartsOn: 1 } as const;

// The whole weeks the month's grid shows, Monday first, and the range to load its sessions for.
export const getMonthRange = (month: Date) => {
  const from = startOfWeek(startOfMonth(month), WEEK_OPTIONS);
  const to = addDays(endOfWeek(endOfMonth(month), WEEK_OPTIONS), 1);

  return { from, to };
};

// "3 days with it", counting only what was done.
export const describeDaysDone = (daysDone: number) => {
  if (daysDone === 0) return "No days yet this month";

  return daysDone === 1 ? "1 day with it" : `${daysDone} days with it`;
};

// "Thursday 19 November: 25 min", or just the date on a day it wasn't done.
export const describeDay = (date: Date, minutes: number) => {
  const day = format(date, "EEEE d MMMM");

  return minutes > 0 ? `${day}: ${formatMinutes(minutes)}` : day;
};

export const getMonthDays = (month: Date, minutesByDay: Map<string, number>, now: Date): MonthDay[] => {
  const { from, to } = getMonthRange(month);

  return eachDayOfInterval({ start: from, end: addDays(to, -1) }).map((date) => {
    const key = format(date, DAY_KEY_FORMAT);

    return {
      key,
      date,
      minutes: minutesByDay.get(key) ?? 0,
      isInMonth: isSameMonth(date, month),
      isToday: isToday(date),
      isFuture: isAfter(date, now),
    };
  });
};

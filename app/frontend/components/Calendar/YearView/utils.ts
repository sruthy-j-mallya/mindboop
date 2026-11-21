import { addYears, eachDayOfInterval, format, startOfDay, startOfYear, subMilliseconds } from "date-fns";

import { EVENT_KINDS, YEAR_VIEW_BUFFER_YEARS } from "../constants";
import type { CalendarEvent } from "../types";
import type { DayCounts } from "./types";

export const DAY_KEY_FORMAT = "yyyy-MM-dd";
export const MONTH_KEY_FORMAT = "yyyy-MM";
export const MONTH_SELECTOR = "[data-month]";

export const toDayKey = (date: Date) => format(date, DAY_KEY_FORMAT);

export const toMonthKey = (date: Date) => format(date, MONTH_KEY_FORMAT);

// The first day of each year the year view shows: the one in view, and its neighbours.
export const getYearWindow = (date: Date) =>
  Array.from({ length: YEAR_VIEW_BUFFER_YEARS * 2 + 1 }, (_, index) =>
    addYears(startOfYear(date), index - YEAR_VIEW_BUFFER_YEARS),
  );

// The first month still showing below the top of the scroller (the months run in order, top to bottom).
export const getTopMonth = (scroller: Element) => {
  const { top } = scroller.getBoundingClientRect();

  return [...scroller.querySelectorAll<HTMLElement>(MONTH_SELECTOR)].find(
    (month) => month.getBoundingClientRect().bottom > top,
  );
};

// Every day an event touches (its end is exclusive), counted by kind.
export const getDayCounts = (events: CalendarEvent[]) => {
  const counts = new Map<string, DayCounts>();

  events.forEach(({ kind, start, end }) => {
    const lastDay = end > start ? subMilliseconds(end, 1) : start;

    eachDayOfInterval({ start: startOfDay(start), end: lastDay }).forEach((day) => {
      const key = toDayKey(day);
      const { tasks, timeLogs } = counts.get(key) ?? { tasks: 0, timeLogs: 0 };
      const isTask = kind === EVENT_KINDS.TASK;

      counts.set(key, { tasks: tasks + (isTask ? 1 : 0), timeLogs: timeLogs + (isTask ? 0 : 1) });
    });
  });

  return counts;
};

const pluralize = (count: number, noun: string) => `${count} ${noun}${count === 1 ? "" : "s"}`;

// "Monday, 16 November 2026: 2 tasks, 1 time log".
export const getDayLabel = (day: Date, counts?: DayCounts) => {
  const label = format(day, "EEEE, d MMMM yyyy");
  if (!counts) return label;

  return `${label}: ${pluralize(counts.tasks, "task")}, ${pluralize(counts.timeLogs, "time log")}`;
};

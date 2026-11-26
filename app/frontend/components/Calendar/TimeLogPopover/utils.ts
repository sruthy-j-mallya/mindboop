import { isSameDay } from "date-fns";

import type { LogTimePayload, TimeFormat } from "@/apis/types";
import { formatTime, formatTimeRange, formatWeekdayDate } from "@/utils/dateTime";

import type { TimeRange } from "../types";
import type { TimeLogFormValues } from "./constants";

// "Thu, 12 Nov, 3:15 – 4pm", or with both days when it crosses midnight.
export const formatLoggedRange = ({ start, end }: TimeRange, timeFormat: TimeFormat) => {
  if (isSameDay(start, end)) {
    return `${formatWeekdayDate(start)}, ${formatTimeRange(start, end, timeFormat)}`;
  }

  const [startLabel, endLabel] = [start, end].map(
    (date) => `${formatWeekdayDate(date)}, ${formatTime(date, timeFormat)}`,
  );

  return `${startLabel} – ${endLabel}`;
};

// "Thu, 26 Nov", or "Thu, 26 Nov – Fri, 27 Nov" when the range crosses midnight.
export const formatLoggedDays = ({ start, end }: TimeRange) =>
  isSameDay(start, end)
    ? formatWeekdayDate(start)
    : `${formatWeekdayDate(start)} – ${formatWeekdayDate(end)}`;

// A linked task wins over a typed title. Returns null when there's neither, so nothing is saved.
export const buildLogTimePayload = ({ title, task, start, end }: TimeLogFormValues) => {
  const times = { mode: "manual", startedAt: start.toISOString(), completedAt: end.toISOString() } as const;
  if (task) return { ...times, taskId: task.id } satisfies LogTimePayload;

  return title ? ({ ...times, title } satisfies LogTimePayload) : null;
};

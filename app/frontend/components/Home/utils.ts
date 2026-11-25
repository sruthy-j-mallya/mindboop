import { addDays, startOfDay } from "date-fns";

import type { HomeTasksParams, HomeTasksResponse } from "@/apis/types";
import type { SchedulePayload } from "@/components/commons/SchedulePicker/types";

// The bounds of the local day `now` is in.
export const getDayRange = (now: number): HomeTasksParams => ({
  from: startOfDay(now).toISOString(),
  to: startOfDay(addDays(now, 1)).toISOString(),
});

export const getSummary = ({ today, overdue }: HomeTasksResponse) =>
  today.length + overdue.length === 0
    ? "Your day is clear."
    : `${today.length} on today's agenda, ${overdue.length} overdue`;

// An all-day date for today, in place of whatever the task was scheduled for.
export const getTodaySchedule = (now: number): SchedulePayload => ({
  isDuration: false,
  isAllDay: true,
  startsAt: startOfDay(now).toISOString(),
  endsAt: null,
});

import { startOfDay } from "date-fns";

import type { HomeTasksResponse } from "@/apis/types";
import type { SchedulePayload } from "@/components/commons/SchedulePicker/types";

export const getSummary = ({ today, overdue }: HomeTasksResponse) =>
  today.length + overdue.length === 0
    ? "Your day is clear."
    : `${today.length} on today's agenda, ${overdue.length} overdue`;

// An all-day date for the day, in place of whatever the task was scheduled for.
export const getDaySchedule = (day: Date | number): SchedulePayload => ({
  isDuration: false,
  isAllDay: true,
  startsAt: startOfDay(day).toISOString(),
  endsAt: null,
});

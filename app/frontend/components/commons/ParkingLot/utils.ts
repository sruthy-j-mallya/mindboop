import { isSameDay, isSameYear, parseISO } from "date-fns";

import type { TimeFormat } from "@/apis/types";
import { formatDate, formatDateTime, formatTime } from "@/utils/dateTime";

// "3:28pm" today, "12 Nov, 3:28pm" earlier this year, "12 Nov 2025" before that.
export const formatParkedAt = (createdAt: string, now: number, timeFormat: TimeFormat) => {
  const date = parseISO(createdAt);
  if (isSameDay(date, now)) return formatTime(date, timeFormat);

  return isSameYear(date, now) ? formatDateTime(date, now, timeFormat) : formatDate(date, now);
};

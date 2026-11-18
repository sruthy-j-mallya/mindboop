import { format, isSameDay, isSameYear, parseISO } from "date-fns";

// "15:28" today, "12 Nov, 15:28" earlier this year, "12 Nov 2025" before that.
export const formatParkedAt = (createdAt: string, now: number) => {
  const date = parseISO(createdAt);
  if (isSameDay(date, now)) return format(date, "HH:mm");

  return format(date, isSameYear(date, now) ? "d MMM, HH:mm" : "d MMM yyyy");
};

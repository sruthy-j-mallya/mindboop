import { format, isSameYear, parseISO } from "date-fns";

// "Nov 5, 5:30pm" this year, "Nov 5 2025, 5:30pm" otherwise.
export const formatBreadcrumbTime = (createdAt: string, now: Date = new Date()) => {
  const date = parseISO(createdAt);

  return format(date, isSameYear(date, now) ? "MMM d, h:mmaaa" : "MMM d yyyy, h:mmaaa");
};

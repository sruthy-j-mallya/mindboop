import { format, isSameDay } from "date-fns";

import type { LogTimePayload } from "@/apis/types";

import type { TimeRange } from "../types";
import type { TimeLogFormValues } from "./constants";

// "Today, 3:15 PM – 4:00 PM", or with both days when it crosses midnight.
export const formatTimeRange = ({ start, end }: TimeRange) => {
  const startLabel = format(start, "EEE d MMM, h:mm a");

  return `${startLabel} – ${format(end, isSameDay(start, end) ? "h:mm a" : "EEE d MMM, h:mm a")}`;
};

// A linked task wins over a typed title. Returns null when there's neither, so nothing is saved.
export const buildLogTimePayload = ({ title, task }: TimeLogFormValues, { start, end }: TimeRange) => {
  const times = { mode: "manual", startedAt: start.toISOString(), completedAt: end.toISOString() } as const;
  if (task) return { ...times, taskId: task.id } satisfies LogTimePayload;

  return title ? ({ ...times, title } satisfies LogTimePayload) : null;
};

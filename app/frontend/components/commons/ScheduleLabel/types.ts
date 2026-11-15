import type { Task } from "@/apis/types";

export type Schedule = Pick<Task, "isDuration" | "isAllDay" | "startsAt" | "endsAt">;

// Overdue once it's past (the end of a duration, or the whole day of an all-day one); today while it touches today.
export type ScheduleTone = "overdue" | "today" | "upcoming";

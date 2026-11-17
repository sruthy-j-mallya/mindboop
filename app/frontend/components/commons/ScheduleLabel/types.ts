export type { Schedule } from "@/components/commons/SchedulePicker/types";

// Overdue once it's past (the end of a duration, or the whole day of an all-day one); today while it touches today.
export type ScheduleTone = "overdue" | "today" | "upcoming";

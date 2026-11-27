import type { TaskGroupId } from "./types";

// In the order they're listed.
export const TASK_GROUPS: { id: TaskGroupId; label: string }[] = [
  { id: "overdue", label: "Overdue" },
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "undated", label: "No date" },
];

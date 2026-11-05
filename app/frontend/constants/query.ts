import type { TaskListParams } from "@/apis/tasks";
import type { TimeLogListParams } from "@/apis/time_logs";

export const QUERY_KEYS = {
  SESSION: ["session"],
  TASKS: {
    LISTS: ["tasks", "list"],
    LIST: (params: TaskListParams) => ["tasks", "list", params],
    DETAIL: (id: string) => ["tasks", "detail", id],
  },
  TIME_LOGS: {
    LISTS: ["timeLogs", "list"],
    LIST: (params: TimeLogListParams) => ["timeLogs", "list", params],
    DETAIL: (id: string) => ["timeLogs", "detail", id],
    CURRENT: ["timeLogs", "current"],
  },
} as const;

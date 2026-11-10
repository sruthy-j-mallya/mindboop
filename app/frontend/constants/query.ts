import type { TaskListParams, TimeLogListParams } from "@/apis/types";

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
    CURRENT: ["timeLogs", "current"],
  },
} as const;

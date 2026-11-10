import type { TaskListParams } from "@/apis/types";

export const QUERY_KEYS = {
  SESSION: ["session"],
  TASKS: {
    LISTS: ["tasks", "list"],
    LIST: (params: TaskListParams) => ["tasks", "list", params],
    DETAIL: (id: string) => ["tasks", "detail", id],
  },
  TIME_LOGS: {
    CURRENT: ["timeLogs", "current"],
  },
} as const;

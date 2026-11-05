import type { TaskListParams } from "@/apis/tasks";

export const QUERY_KEYS = {
  SESSION: ["session"],
  TASKS: {
    LISTS: ["tasks", "list"],
    LIST: (params: TaskListParams) => ["tasks", "list", params],
    DETAIL: (id: string) => ["tasks", "detail", id],
  },
} as const;

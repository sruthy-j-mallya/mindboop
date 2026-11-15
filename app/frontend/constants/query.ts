import type { CalendarEventsParams, TaskFilters, TaskListParams } from "@/apis/types";

export const QUERY_KEYS = {
  SESSION: ["session"],
  TASKS: {
    LISTS: ["tasks", "list"],
    LIST: (params: TaskListParams) => ["tasks", "list", params],
    // Every page loaded so far, under LISTS so a mutation refreshes it with the paged lists.
    INFINITE_LIST: (filters: TaskFilters) => ["tasks", "list", "infinite", filters],
    DETAIL: (id: string) => ["tasks", "detail", id],
  },
  TIME_LOGS: {
    CURRENT: ["timeLogs", "current"],
  },
  CALENDAR_EVENTS: {
    // Every range loaded so far; task and time log mutations refresh them all.
    ALL: ["calendarEvents"],
    LIST: (params: CalendarEventsParams) => ["calendarEvents", params],
  },
} as const;

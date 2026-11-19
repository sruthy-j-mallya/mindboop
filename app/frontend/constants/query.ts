import type {
  CalendarEventsParams,
  ParkingLotItemFilters,
  ParkingLotItemListParams,
  RoutineTimeLogsParams,
  TaskFilters,
  TaskListParams,
} from "@/apis/types";

export const QUERY_KEYS = {
  SESSION: ["session"],
  TASKS: {
    // Every task query: moving a task between areas, or deleting an area, changes lists and open tasks alike.
    ALL: ["tasks"],
    LISTS: ["tasks", "list"],
    LIST: (params: TaskListParams) => ["tasks", "list", params],
    // Every page loaded so far, under LISTS so a mutation refreshes it with the paged lists.
    INFINITE_LIST: (filters: TaskFilters) => ["tasks", "list", "infinite", filters],
    DETAIL: (id: string) => ["tasks", "detail", id],
  },
  PARKING_LOT_ITEMS: {
    // Every parking lot query: lists and the curiosity time. Changing an item can end its curiosity time.
    ALL: ["parkingLotItems"],
    LISTS: ["parkingLotItems", "list"],
    LIST: (params: ParkingLotItemListParams) => ["parkingLotItems", "list", params],
    // Every page loaded so far, under LISTS so a mutation refreshes it with the paged lists.
    INFINITE_LIST: (filters: ParkingLotItemFilters) => ["parkingLotItems", "list", "infinite", filters],
    CURIOSITY_TIME: ["parkingLotItems", "curiosityTime"],
  },
  TIME_LOGS: {
    CURRENT: ["timeLogs", "current"],
  },
  USER_PREFERENCE: ["userPreference"],
  LIFE_AREAS: {
    LIST: ["lifeAreas", "list"],
  },
  ROUTINES: {
    // Every routine query: finishing or moving a routine's session changes its stats and history.
    ALL: ["routines"],
    LIST: ["routines", "list"],
    TIME_LOGS: (params: RoutineTimeLogsParams) => ["routines", "timeLogs", params],
  },
  CALENDAR_EVENTS: {
    // Every range loaded so far; task and time log mutations refresh them all.
    ALL: ["calendarEvents"],
    LIST: (params: CalendarEventsParams) => ["calendarEvents", params],
  },
} as const;

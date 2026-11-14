import type {
  ParkingLotItemFilters,
  ParkingLotItemListParams,
  TaskFilters,
  TaskListParams,
} from "@/apis/types";

export const QUERY_KEYS = {
  SESSION: ["session"],
  TASKS: {
    LISTS: ["tasks", "list"],
    LIST: (params: TaskListParams) => ["tasks", "list", params],
    // Every page loaded so far, under LISTS so a mutation refreshes it with the paged lists.
    INFINITE_LIST: (filters: TaskFilters) => ["tasks", "list", "infinite", filters],
    DETAIL: (id: string) => ["tasks", "detail", id],
  },
  PARKING_LOT_ITEMS: {
    LISTS: ["parkingLotItems", "list"],
    LIST: (params: ParkingLotItemListParams) => ["parkingLotItems", "list", params],
    // Every page loaded so far, under LISTS so a mutation refreshes it with the paged lists.
    INFINITE_LIST: (filters: ParkingLotItemFilters) => ["parkingLotItems", "list", "infinite", filters],
  },
  TIME_LOGS: {
    CURRENT: ["timeLogs", "current"],
  },
} as const;

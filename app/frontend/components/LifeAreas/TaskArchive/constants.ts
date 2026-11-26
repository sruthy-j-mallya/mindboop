import type { TaskFilters } from "@/apis/types";

export const COMPLETED_NAME = "Completed";
export const COMPLETED_FILTERS: TaskFilters = { isCompleted: true };

export const DELETED_NAME = "Trash";
export const DELETED_FILTERS: TaskFilters = { isDeleted: true };

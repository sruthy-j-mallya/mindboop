import type { TaskFilters } from "@/apis/types";

// Every list's open tasks, by title, description or step.
export const SEARCH_FILTERS: TaskFilters = { isCompleted: false, isSearchingDetails: true };

export const SEARCH_DEBOUNCE_DELAY = 300; // milliseconds

// How much of a description shows before and after the match.
export const EXCERPT_PADDING = 40; // characters

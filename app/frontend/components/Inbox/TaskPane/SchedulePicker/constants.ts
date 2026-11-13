import type { UpdateTaskPayload } from "@/apis/types";

export const DATE_TAB = "date";

export const DURATION_TAB = "duration";

// A new timed slot starts at the next full hour today, or at 9am on any other day, and lasts an hour.
export const DEFAULT_START_HOUR = 9;

export const DATE_INPUT_FORMAT = "yyyy-MM-dd";

export const TIME_INPUT_FORMAT = "HH:mm";

export const CLEARED_SCHEDULE: Omit<UpdateTaskPayload, "id"> = {
  isDuration: false,
  isAllDay: false,
  startsAt: null,
  endsAt: null,
};

export const END_BEFORE_START_ERROR = "The end can't be before the start";

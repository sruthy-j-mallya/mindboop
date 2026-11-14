import { format } from "date-fns";

import type { UpdateTaskPayload } from "@/apis/types";
import { MINUTES_PER_HOUR } from "@/constants";

export const DATE_TAB = "date";

export const DURATION_TAB = "duration";

// A new timed slot starts at the next full hour today, or at 9am on any other day, and lasts an hour.
export const DEFAULT_START_HOUR = 9;

// How a day reads in the Duration tab's date fields ("14 Nov 2026"), short enough to sit beside a time.
export const DATE_LABEL_FORMAT = "d MMM yyyy";

export const TIME_INPUT_FORMAT = "HH:mm";

// How a time reads in the time picker ("3:30 PM").
export const TIME_LABEL_FORMAT = "h:mm a";

export const TIME_SLOT_MINUTES = 30;

// The time picker's options: every half hour of the day, as "HH:mm".
export const TIME_SLOTS = Array.from({ length: (24 * MINUTES_PER_HOUR) / TIME_SLOT_MINUTES }, (_, index) =>
  format(new Date(2000, 0, 1, 0, index * TIME_SLOT_MINUTES), TIME_INPUT_FORMAT),
);

// The slot the picker's list opens on when there's no time yet.
export const DEFAULT_TIME_SLOT_INDEX = (DEFAULT_START_HOUR * MINUTES_PER_HOUR) / TIME_SLOT_MINUTES;

// Typed times: "3", "3pm", "3:30 p.m.", "15:30", "1530", "9.30am". parseTimeText rejects an "m" without "a" or "p".
// Anchored with only single optional tokens (no nested quantifiers), so it can't backtrack; safe-regex is a heuristic.
// eslint-disable-next-line security/detect-unsafe-regex
export const TIME_TEXT_PATTERN = /^(\d{1,2})[:.]?(\d{2})?\s*([ap])?\.?(m)?\.?$/i;

export const CLEARED_SCHEDULE: Omit<UpdateTaskPayload, "id"> = {
  isDuration: false,
  isAllDay: false,
  startsAt: null,
  endsAt: null,
};

export const END_BEFORE_START_ERROR = "The end can't be before the start";

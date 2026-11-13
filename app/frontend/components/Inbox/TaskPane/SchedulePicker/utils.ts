import {
  addHours,
  addMilliseconds,
  format,
  isBefore,
  isSameDay,
  isValid,
  parse,
  parseISO,
  set,
  setHours,
  startOfDay,
  startOfHour,
} from "date-fns";

import type { Task, UpdateTaskPayload } from "@/apis/types";

import {
  DATE_INPUT_FORMAT,
  DEFAULT_START_HOUR,
  END_BEFORE_START_ERROR,
  TIME_INPUT_FORMAT,
} from "./constants";
import type { ScheduleDraft } from "./types";

export const toDateInputValue = (date: Date) => format(date, DATE_INPUT_FORMAT);

export const toTimeInputValue = (date: Date) => format(date, TIME_INPUT_FORMAT);

// The day picked in a date input, or null while it's cleared or half typed.
export const parseDateInputValue = (value: string) => {
  const day = parse(value, DATE_INPUT_FORMAT, new Date());

  return isValid(day) ? day : null;
};

// Moves `date` to `day`, keeping its time of day.
export const withDay = (date: Date, day: Date) =>
  set(date, { year: day.getFullYear(), month: day.getMonth(), date: day.getDate() });

// Sets `date`'s time of day from an "HH:mm" value.
export const withTime = (date: Date, time: string) => {
  const [hours, minutes] = time.split(":").map(Number);

  return set(date, { hours, minutes, seconds: 0, milliseconds: 0 });
};

// Moves the start and the end together, so a duration keeps its length.
export const moveStart = (draft: ScheduleDraft, startsAt: Date): ScheduleDraft => ({
  ...draft,
  startsAt,
  endsAt: addMilliseconds(draft.endsAt, startsAt.getTime() - draft.startsAt.getTime()),
});

const getDefaultStart = (day: Date, now: number) => {
  const nextHour = startOfHour(addHours(now, 1));
  if (isSameDay(day, now) && isSameDay(nextHour, now)) return nextHour;

  return setHours(startOfDay(day), DEFAULT_START_HOUR);
};

export const setAllDay = (draft: ScheduleDraft, isAllDay: boolean, now: number): ScheduleDraft => {
  if (isAllDay) {
    return { ...draft, isAllDay, startsAt: startOfDay(draft.startsAt), endsAt: startOfDay(draft.endsAt) };
  }

  const startsAt = getDefaultStart(draft.startsAt, now);
  const endsAt = addHours(startsAt, 1);
  // A slot over several days keeps its last day.
  const isMultiDay = isBefore(startOfDay(draft.startsAt), startOfDay(draft.endsAt));

  return { ...draft, isAllDay, startsAt, endsAt: isMultiDay ? withDay(endsAt, draft.endsAt) : endsAt };
};

// The Date tab's time: an "HH:mm" value sets it, an empty one makes the date all day.
export const setDateTime = (draft: ScheduleDraft, time: string): ScheduleDraft => {
  if (!time) return moveStart({ ...draft, isAllDay: true }, startOfDay(draft.startsAt));

  return moveStart({ ...draft, isAllDay: false }, withTime(draft.startsAt, time));
};

// Switching to Duration gives a date without a usable end one: the same day when all day, an hour when timed.
export const setIsDuration = (draft: ScheduleDraft, isDuration: boolean): ScheduleDraft => {
  if (!isDuration || isBefore(draft.startsAt, draft.endsAt)) return { ...draft, isDuration };

  return { ...draft, isDuration, endsAt: draft.isAllDay ? draft.startsAt : addHours(draft.startsAt, 1) };
};

// Opens on the task's schedule, or on today (all day) for an unscheduled task.
export const toDraft = ({ isDuration, isAllDay, startsAt, endsAt }: Task, now: number): ScheduleDraft => {
  if (!startsAt) {
    const today = startOfDay(now);

    return { isDuration: false, isAllDay: true, startsAt: today, endsAt: today };
  }

  const start = parseISO(startsAt);
  const fallbackEnd = isAllDay ? start : addHours(start, 1);

  return { isDuration, isAllDay, startsAt: start, endsAt: endsAt ? parseISO(endsAt) : fallbackEnd };
};

export const toPayload = ({
  isDuration,
  isAllDay,
  startsAt,
  endsAt,
}: ScheduleDraft): Omit<UpdateTaskPayload, "id"> => ({
  isDuration,
  isAllDay,
  startsAt: startsAt.toISOString(),
  endsAt: isDuration ? endsAt.toISOString() : null,
});

export const getDraftError = ({ isDuration, startsAt, endsAt }: ScheduleDraft) =>
  isDuration && isBefore(endsAt, startsAt) ? END_BEFORE_START_ERROR : null;

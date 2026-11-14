import {
  addHours,
  addMilliseconds,
  format,
  isBefore,
  isSameDay,
  parseISO,
  set,
  setHours,
  startOfDay,
  startOfHour,
} from "date-fns";

import type { Task, UpdateTaskPayload } from "@/apis/types";
import { MINUTES_PER_HOUR } from "@/constants";

import {
  DEFAULT_START_HOUR,
  END_BEFORE_START_ERROR,
  TIME_INPUT_FORMAT,
  TIME_LABEL_FORMAT,
  TIME_SLOT_MINUTES,
  TIME_TEXT_PATTERN,
} from "./constants";
import type { ScheduleDraft } from "./types";

export const toTimeInputValue = (date: Date) => format(date, TIME_INPUT_FORMAT);

// Moves `date` to `day`, keeping its time of day.
export const withDay = (date: Date, day: Date) =>
  set(date, { year: day.getFullYear(), month: day.getMonth(), date: day.getDate() });

// Sets `date`'s time of day from an "HH:mm" value.
export const withTime = (date: Date, time: string) => {
  const [hours, minutes] = time.split(":").map(Number);

  return set(date, { hours, minutes, seconds: 0, milliseconds: 0 });
};

// "15:30" → "3:30 PM".
export const toTimeLabel = (time: string) => format(withTime(new Date(), time), TIME_LABEL_FORMAT);

// The half-hour slot a "HH:mm" time falls in (3:45 PM → the 3:30 PM slot).
export const toTimeSlotIndex = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);

  return Math.floor((hours * MINUTES_PER_HOUR + minutes) / TIME_SLOT_MINUTES);
};

// A 12-hour hour with am/pm becomes 0–23; without one it is already on the 24-hour clock.
const toHours = (hour: number, meridiem?: string) => {
  if (!meridiem) return hour < 24 ? hour : null;
  if (hour < 1 || hour > 12) return null;

  return (hour % 12) + (meridiem.toLowerCase() === "p" ? 12 : 0);
};

// A typed time as "HH:mm", or null when it isn't one.
export const parseTimeText = (text: string) => {
  const match = TIME_TEXT_PATTERN.exec(text.trim());
  if (!match) return null;

  const [, hourText, minuteText = "0", meridiem, meridiemM] = match;
  if (meridiemM && !meridiem) return null;

  const hours = toHours(Number(hourText), meridiem);
  const minutes = Number(minuteText);
  if (hours === null || minutes >= MINUTES_PER_HOUR) return null;

  return format(new Date(2000, 0, 1, hours, minutes), TIME_INPUT_FORMAT);
};

// Callback refs for the time picker's list. Module-level so React attaches them once, not on every render.
export const scrollIntoViewIfNeeded = (option: HTMLElement | null) =>
  option?.scrollIntoView?.({ block: "nearest" });

export const centerSelectedOption = (list: HTMLElement | null) => {
  const option = list?.querySelector<HTMLElement>('[aria-selected="true"], [data-active="true"]');
  if (!list || !option) return;

  list.scrollTop = option.offsetTop - (list.clientHeight - option.offsetHeight) / 2;
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

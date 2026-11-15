import {
  addDays,
  addMinutes,
  addYears,
  endOfMonth,
  endOfWeek,
  isSameDay,
  max,
  min,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subHours,
  subMilliseconds,
} from "date-fns";
import type { SyntheticEvent } from "react";

import type { Task, TimeLog } from "@/apis/types";
import type { Schedule } from "@/components/commons/ScheduleLabel/types";
import type { SchedulePayload } from "@/components/commons/SchedulePicker/types";

import {
  CALENDAR_VIEWS,
  DEFAULT_TASK_MINUTES,
  EVENT_KINDS,
  MOVE_ERRORS,
  MULTI_DAY_COUNT,
  SELECTION_ERRORS,
  SLOT_MINUTES,
  TIME_LOG_WINDOW_HOURS,
  WEEK_OPTIONS,
} from "./constants";
import type {
  AnchorRect,
  CalendarEvent,
  CalendarView,
  EventTimes,
  SelectionIntent,
  TaskEvent,
  TimeLogEvent,
  TimeRange,
} from "./types";

const MILLISECONDS_PER_MINUTE = 60_000;

export const getMultiDayRange = (date: Date): TimeRange => {
  const start = startOfDay(date);

  return { start, end: addDays(start, MULTI_DAY_COUNT) };
};

// The days a view shows, as a half-open range: what the Calendar asks the API for.
export const getVisibleRange = (view: CalendarView, date: Date): TimeRange => {
  switch (view) {
    case CALENDAR_VIEWS.DAY:
      return { start: startOfDay(date), end: addDays(startOfDay(date), 1) };
    case CALENDAR_VIEWS.MULTI_DAY:
      return getMultiDayRange(date);
    case CALENDAR_VIEWS.WEEK: {
      const start = startOfWeek(date, WEEK_OPTIONS);

      return { start, end: addDays(start, 7) };
    }
    case CALENDAR_VIEWS.MONTH:
      return {
        start: startOfWeek(startOfMonth(date), WEEK_OPTIONS),
        end: addDays(startOfDay(endOfWeek(endOfMonth(date), WEEK_OPTIONS)), 1),
      };
    default:
      return { start: startOfYear(date), end: addYears(startOfYear(date), 1) };
  }
};

// The start of the quarter hour now falls in: a click in that slot still counts as now.
export const getCurrentSlotStart = (now: number) => {
  const minutes = Math.floor(now / MILLISECONDS_PER_MINUTE);

  return new Date((minutes - (minutes % SLOT_MINUTES)) * MILLISECONDS_PER_MINUTE);
};

export const getLogWindowStart = (now: number) => subHours(now, TIME_LOG_WINDOW_HOURS);

export const isWithinLogWindow = ({ start, end }: TimeRange, now: number) =>
  start >= getLogWindowStart(now) && end <= new Date(now) && start < end;

// The last day an all-day event covers, from its exclusive end.
const getLastDay = (end: Date) => startOfDay(subMilliseconds(end, 1));

export const toTaskTimes = ({
  isAllDay,
  isDuration,
  startsAt,
  endsAt,
  estimatedMinutes,
}: Task): EventTimes => {
  const start = parseISO(startsAt ?? "");
  if (isAllDay) {
    const lastDay = isDuration && endsAt ? parseISO(endsAt) : start;

    return { start: startOfDay(start), end: addDays(startOfDay(lastDay), 1), allDay: true };
  }

  const end =
    isDuration && endsAt ? parseISO(endsAt) : addMinutes(start, estimatedMinutes ?? DEFAULT_TASK_MINUTES);

  return { start, end, allDay: false };
};

const toTaskEvent = (task: Task): TaskEvent => ({
  ...toTaskTimes(task),
  id: task.id,
  kind: EVENT_KINDS.TASK,
  title: task.title,
  isEditable: true,
  task,
});

// A running session reaches up to now. Only a finished one inside the last 24 hours can be moved.
const toTimeLogEvent = (timeLog: TimeLog, now: number): TimeLogEvent => {
  const start = parseISO(timeLog.startedAt);
  const end = timeLog.completedAt ? parseISO(timeLog.completedAt) : new Date(now);

  return {
    id: timeLog.id,
    kind: EVENT_KINDS.TIME_LOG,
    title: timeLog.title ?? timeLog.taskTitle ?? "Untitled session",
    start,
    end,
    allDay: false,
    isEditable: !!timeLog.completedAt && isWithinLogWindow({ start, end }, now),
    timeLog,
  };
};

// Drawn time logs first, so tasks sit on top where they overlap. `movedTimes` holds where events were just dragged,
// so they stay put until the refetched data agrees.
export const toCalendarEvents = (
  { tasks, timeLogs }: { tasks: Task[]; timeLogs: TimeLog[] },
  now: number,
  movedTimes: Record<string, EventTimes>,
): CalendarEvent[] =>
  [
    ...timeLogs.map((timeLog) => toTimeLogEvent(timeLog, now)),
    ...tasks.filter(({ startsAt }) => !!startsAt).map(toTaskEvent),
  ].map((event) => ({ ...event, ...movedTimes[event.id] }));

const isMidnight = (date: Date) => date.getTime() === startOfDay(date).getTime();

// Whole days, as the month view and the all-day row select them.
export const isAllDayRange = ({ start, end }: TimeRange) =>
  isMidnight(start) && isMidnight(end) && start < end;

const toAllDaySchedule = (start: Date, end: Date): Schedule => {
  const lastDay = getLastDay(end);
  const isDuration = !isSameDay(start, lastDay);

  return {
    isAllDay: true,
    isDuration,
    startsAt: startOfDay(start).toISOString(),
    endsAt: isDuration ? lastDay.toISOString() : null,
  };
};

// A click on a future slot makes a task at that time; dragging across slots makes one for that span. In the past, the
// same gestures log time, as far back as 24 hours. Past whole days take nothing.
export const getSelectionIntent = (range: TimeRange, isClick: boolean, now: number): SelectionIntent => {
  const { start, end } = range;
  if (isAllDayRange(range)) {
    if (start < startOfDay(now)) return { kind: "none" };

    return { kind: "task", schedule: toAllDaySchedule(start, end) };
  }

  if (start >= getCurrentSlotStart(now)) {
    const startsAt = start.toISOString();
    const schedule = isClick
      ? { isAllDay: false, isDuration: false, startsAt, endsAt: null }
      : { isAllDay: false, isDuration: true, startsAt, endsAt: end.toISOString() };

    return { kind: "task", schedule };
  }

  const logRange = { start, end: min([end, new Date(now)]) };
  if (start < getLogWindowStart(now)) return { kind: "none", error: SELECTION_ERRORS.TOO_FAR_BACK };

  return { kind: "timeLog", range: logRange };
};

// The schedule a dragged or resized task saves. Resizing on the time grid makes it a duration; moving keeps what it was.
export const getMovedTaskSchedule = (
  { isDuration }: Task,
  { start, end, allDay }: EventTimes,
  isResize: boolean,
): SchedulePayload => {
  if (allDay) return toAllDaySchedule(start, max([end, addDays(start, 1)]));

  const hasEnd = isDuration || isResize;

  return {
    isAllDay: false,
    isDuration: hasEnd,
    startsAt: start.toISOString(),
    endsAt: hasEnd ? end.toISOString() : null,
  };
};

// Why a drag can't land where it was dropped, or null when it can.
export const getMoveError = (event: CalendarEvent, times: EventTimes, isResize: boolean, now: number) => {
  if (event.kind === EVENT_KINDS.TIME_LOG) {
    if (times.allDay) return MOVE_ERRORS.TIME_LOG_ALL_DAY;

    return isWithinLogWindow(times, now) ? null : MOVE_ERRORS.TIME_LOG_OUTSIDE_WINDOW;
  }

  // An overdue task can still be stretched, as long as it then ends in the future.
  if (isResize) return times.end > new Date(now) ? null : MOVE_ERRORS.TASK_IN_PAST;

  const earliest = times.allDay ? startOfDay(now) : getCurrentSlotStart(now);

  return times.start >= earliest ? null : MOVE_ERRORS.TASK_IN_PAST;
};

const toRect = (left: number, top: number, width = 0, height = 0): AnchorRect => ({
  left,
  top,
  width,
  height,
});

// A drag-selection gives its bounds (in page coordinates) and a click the point; the popover opens beside either.
export const toAnchorRect = (
  box?: { clientX: number; clientY: number },
  bounds?: { left: number; top: number; right: number; bottom: number },
): AnchorRect => {
  if (bounds) {
    const { left, top, right, bottom } = bounds;

    return toRect(left - window.scrollX, top - window.scrollY, right - left, bottom - top);
  }

  return toRect(box?.clientX ?? 0, box?.clientY ?? 0);
};

// A clicked event: the point of a mouse click, since an event can span the whole column; the event itself when it was
// picked with the keyboard.
export const eventToAnchorRect = ({
  nativeEvent,
  currentTarget,
}: SyntheticEvent<HTMLElement>): AnchorRect => {
  if (nativeEvent instanceof MouseEvent && nativeEvent.detail > 0)
    return toRect(nativeEvent.clientX, nativeEvent.clientY);

  const { left, top, width, height } = currentTarget.getBoundingClientRect();

  return toRect(left, top, width, height);
};

// react-big-calendar's addons are CommonJS. Under Node's ESM rules (package.json has "type": "module") the production
// build hands over the whole `exports` object as the default import, while the dev server and Vitest unwrap
// `exports.default`. This accepts either.
export const unwrapDefault = <T>(module: T | { default: T }): T =>
  typeof module === "object" && module !== null && "default" in module ? module.default : (module as T);

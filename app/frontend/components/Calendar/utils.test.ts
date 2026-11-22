import { afterEach, describe, expect, it } from "vitest";

import type { Task, TimeLog } from "@/apis/types";

import {
  CALENDAR_VIEWS,
  DAY_COUNT_STORAGE_KEY,
  DEFAULT_MULTI_DAY_COUNT,
  DEFAULT_VIEW,
  INITIAL_WHEEL_GESTURE,
  MOVE_ERRORS,
  SELECTION_ERRORS,
  VIEW_STORAGE_KEY,
} from "./constants";
import type { CalendarEvent, CalendarView, WheelInput } from "./types";
import {
  getCurrentSlotStart,
  getMovedTaskSchedule,
  getMoveError,
  getPagingDistance,
  getSelectionIntent,
  getVisibleRange,
  readStoredDayCount,
  readStoredView,
  shiftDate,
  stepWheelGesture,
  toCalendarEvents,
  toTaskTimes,
  toWheelDelta,
} from "./utils";

// Thursday 12 Nov 2026, 10:07 local time.
const NOW = new Date(2026, 10, 12, 10, 7).getTime();

const at = (day: number, hours = 0, minutes = 0) => new Date(2026, 10, day, hours, minutes);

const buildTask = (overrides: Partial<Task> = {}): Task => ({
  id: "task-1",
  title: "Write the report",
  description: null,
  estimatedMinutes: null,
  isDuration: false,
  isAllDay: false,
  isCompleted: false,
  startsAt: at(13, 9).toISOString(),
  endsAt: null,
  createdAt: "2026-11-05T10:00:00.000Z",
  updatedAt: "2026-11-05T10:00:00.000Z",
  checklistItems: [],
  breadcrumbs: [],
  ...overrides,
});

const buildTimeLog = (overrides: Partial<TimeLog> = {}): TimeLog => ({
  id: "log-1",
  taskId: null,
  title: "Answer emails",
  taskTitle: null,
  isTaskDeleted: false,
  mode: "manual",
  timerPreset: null,
  bufferMinutes: 0,
  accumulatedElapsedSeconds: 1800,
  isRunning: false,
  currentRunStartedAt: null,
  startedAt: at(12, 8).toISOString(),
  completedAt: at(12, 8, 30).toISOString(),
  isFinishedEarly: false,
  currentBreak: null,
  createdAt: "2026-11-12T08:30:00.000Z",
  updatedAt: "2026-11-12T08:30:00.000Z",
  ...overrides,
});

describe("readStoredView and readStoredDayCount", () => {
  afterEach(() => localStorage.clear());

  it("reads back the view and day count last picked", () => {
    localStorage.setItem(VIEW_STORAGE_KEY, CALENDAR_VIEWS.MONTH);
    localStorage.setItem(DAY_COUNT_STORAGE_KEY, "5");

    expect(readStoredView()).toBe(CALENDAR_VIEWS.MONTH);
    expect(readStoredDayCount()).toBe(5);
  });

  it("falls back to the defaults when nothing, or nothing valid, was kept", () => {
    expect(readStoredView()).toBe(DEFAULT_VIEW);
    expect(readStoredDayCount()).toBe(DEFAULT_MULTI_DAY_COUNT);

    localStorage.setItem(VIEW_STORAGE_KEY, "agenda");
    localStorage.setItem(DAY_COUNT_STORAGE_KEY, "42");

    expect(readStoredView()).toBe(DEFAULT_VIEW);
    expect(readStoredDayCount()).toBe(DEFAULT_MULTI_DAY_COUNT);
  });
});

describe("getVisibleRange", () => {
  it("covers the week from Monday", () => {
    expect(getVisibleRange("week", at(12, 15))).toEqual({ start: at(9), end: at(16) });
  });

  it("covers the week from the day it starts on", () => {
    expect(getVisibleRange("week", at(12, 15), DEFAULT_MULTI_DAY_COUNT, 0)).toEqual({
      start: at(8),
      end: at(15),
    });
    expect(getVisibleRange("week", at(12, 15), DEFAULT_MULTI_DAY_COUNT, 6)).toEqual({
      start: at(7),
      end: at(14),
    });
  });

  it("covers three days from the chosen one", () => {
    expect(getVisibleRange("multiDay", at(12, 15))).toEqual({ start: at(12), end: at(15) });
  });

  it("covers the chosen number of days in the multi-day view", () => {
    expect(getVisibleRange("multiDay", at(12, 15), 5)).toEqual({ start: at(12), end: at(17) });
  });

  it("covers the whole weeks a month touches", () => {
    expect(getVisibleRange("month", at(12))).toEqual({
      start: new Date(2026, 9, 26),
      end: new Date(2026, 11, 7),
    });
  });

  it("covers the whole weeks a month touches from the day weeks start on", () => {
    expect(getVisibleRange("month", at(12), DEFAULT_MULTI_DAY_COUNT, 0)).toEqual({
      start: new Date(2026, 10, 1),
      end: new Date(2026, 11, 6),
    });
  });

  it("covers the year and one either side, which the year view scrolls through", () => {
    expect(getVisibleRange("year", at(12))).toEqual({
      start: new Date(2025, 0, 1),
      end: new Date(2028, 0, 1),
    });
  });
});

describe("shiftDate", () => {
  it("moves by each view's page", () => {
    expect(shiftDate(CALENDAR_VIEWS.DAY, at(12), 1)).toEqual(at(13));
    expect(shiftDate(CALENDAR_VIEWS.MULTI_DAY, at(12), -1)).toEqual(at(9));
    expect(shiftDate(CALENDAR_VIEWS.WEEK, at(12), 1)).toEqual(at(19));
    expect(shiftDate(CALENDAR_VIEWS.MONTH, at(12), -1)).toEqual(new Date(2026, 9, 12));
    expect(shiftDate(CALENDAR_VIEWS.YEAR, at(12), 1)).toEqual(new Date(2027, 10, 12));
  });

  it("pages the multi-day view by its number of days", () => {
    expect(shiftDate(CALENDAR_VIEWS.MULTI_DAY, at(12), 1, 5)).toEqual(at(17));
  });
});

describe("toWheelDelta", () => {
  const wheel = (overrides: Partial<WheelInput> = {}): WheelInput => ({
    deltaX: 0,
    deltaY: 0,
    deltaMode: 0,
    shiftKey: false,
    timeStamp: 0,
    ...overrides,
  });

  it("turns a mouse wheel sideways with Shift held", () => {
    expect(toWheelDelta(wheel({ deltaY: 30, shiftKey: true }))).toEqual({ x: 30, y: 0 });
  });

  it("counts lines as pixels", () => {
    expect(toWheelDelta(wheel({ deltaX: 3, deltaMode: 1 }))).toEqual({ x: 48, y: 0 });
  });
});

describe("getPagingDistance", () => {
  it("pages sideways in every view, and up and down only in the month view", () => {
    expect(getPagingDistance(CALENDAR_VIEWS.WEEK, { x: 30, y: 10 })).toBe(30);
    expect(getPagingDistance(CALENDAR_VIEWS.DAY, { x: 10, y: 30 })).toBe(0);
    expect(getPagingDistance(CALENDAR_VIEWS.YEAR, { x: 0, y: 30 })).toBe(0);
    expect(getPagingDistance(CALENDAR_VIEWS.YEAR, { x: -30, y: 0 })).toBe(-30);
    expect(getPagingDistance(CALENDAR_VIEWS.MONTH, { x: 0, y: -30 })).toBe(-30);
  });
});

describe("stepWheelGesture", () => {
  const VERTICAL = { deltaX: 0, deltaY: 50, deltaMode: 0, shiftKey: false };

  // Plays sideways wheel events (deltaX, 16ms apart unless a time is given) and lists the pages turned.
  const swipe = (view: CalendarView, events: (number | [number, number])[], deltaY = 0) => {
    let gesture = INITIAL_WHEEL_GESTURE;
    const steps: number[] = [];
    events.forEach((event, index) => {
      const [deltaX, timeStamp] = Array.isArray(event) ? event : [event, index * 16];
      const result = stepWheelGesture(view, gesture, {
        deltaX,
        deltaY,
        deltaMode: 0,
        shiftKey: false,
        timeStamp,
      });
      gesture = result.gesture;
      if (result.step !== 0) steps.push(result.step);
    });

    return steps;
  };

  it("turns one page per swipe, ignoring its momentum", () => {
    expect(swipe(CALENDAR_VIEWS.WEEK, [-10, -30, -60, -55, -45, -35, -25, -15, -8, -4, -2, -1])).toEqual([
      -1,
    ]);
  });

  it("adds up a gentle swipe until it has gone far enough", () => {
    expect(swipe(CALENDAR_VIEWS.WEEK, [5, 8, 10, 9, 6, 3])).toEqual([1]);
    expect(swipe(CALENDAR_VIEWS.WEEK, [5, 8, 10])).toEqual([]);
  });

  it("turns a page for each quick swipe, even while the last one's momentum is still going", () => {
    const fastSwipe = [-20, -60, -90, -80, -70, -60];
    const nextFinger = [-12, -40, -90, -80, -70, -60];

    expect(swipe(CALENDAR_VIEWS.WEEK, [...fastSwipe, ...nextFinger, ...nextFinger])).toEqual([-1, -1, -1]);
  });

  it("starts a new swipe after a pause", () => {
    expect(
      swipe(CALENDAR_VIEWS.WEEK, [
        [60, 0],
        [60, 16],
        [60, 300],
      ]),
    ).toEqual([1, 1]);
  });

  it("leaves a mostly up-and-down swipe to the time grid, but pages the month view with it", () => {
    expect(swipe(CALENDAR_VIEWS.WEEK, [20, 20, 20], 50)).toEqual([]);
    expect(swipe(CALENDAR_VIEWS.MONTH, [0, 0], 50)).toEqual([1]);
  });

  it("pages with a sideways swipe straight after scrolling the time grid", () => {
    let gesture = INITIAL_WHEEL_GESTURE;
    [0, 16, 32].forEach((timeStamp) => {
      gesture = stepWheelGesture(CALENDAR_VIEWS.WEEK, gesture, { ...VERTICAL, timeStamp }).gesture;
    });

    expect(
      stepWheelGesture(CALENDAR_VIEWS.WEEK, gesture, { ...VERTICAL, deltaX: -60, timeStamp: 48 }).step,
    ).toBe(-1);
  });
});

describe("toTaskTimes", () => {
  it("draws a timed date as long as its estimate", () => {
    expect(toTaskTimes(buildTask({ estimatedMinutes: 45 }))).toEqual({
      start: at(13, 9),
      end: at(13, 9, 45),
      allDay: false,
    });
  });

  it("draws a timed date without an estimate as half an hour", () => {
    expect(toTaskTimes(buildTask())).toEqual({ start: at(13, 9), end: at(13, 9, 30), allDay: false });
  });

  it("ends an all-day duration after its last day", () => {
    const task = buildTask({
      isAllDay: true,
      isDuration: true,
      startsAt: at(13).toISOString(),
      endsAt: at(15).toISOString(),
    });

    expect(toTaskTimes(task)).toEqual({ start: at(13), end: at(16), allDay: true });
  });
});

describe("toCalendarEvents", () => {
  it("leaves out unscheduled tasks and lets only recent finished logs move", () => {
    const events = toCalendarEvents(
      {
        tasks: [buildTask(), buildTask({ id: "task-2", startsAt: null })],
        timeLogs: [
          buildTimeLog(),
          buildTimeLog({
            id: "log-2",
            startedAt: at(11, 8).toISOString(),
            completedAt: at(11, 9).toISOString(),
          }),
          buildTimeLog({ id: "log-3", completedAt: null, isRunning: true }),
        ],
      },
      NOW,
      {},
    );

    expect(events.map(({ id, isEditable }) => [id, isEditable])).toEqual([
      ["log-1", true],
      ["log-2", false],
      ["log-3", false],
      ["task-1", true],
    ]);
    expect(events[2].end).toEqual(new Date(NOW));
  });

  it("names a log after its task when it has no title of its own", () => {
    const [event] = toCalendarEvents(
      {
        tasks: [],
        timeLogs: [buildTimeLog({ title: null, taskId: "task-1", taskTitle: "Write the report" })],
      },
      NOW,
      {},
    );

    expect(event.title).toBe("Write the report");
  });

  it("keeps a moved event where it was dropped", () => {
    const moved = { start: at(14, 11), end: at(14, 12), allDay: false };
    const [event] = toCalendarEvents({ tasks: [buildTask()], timeLogs: [] }, NOW, { "task-1": moved });

    expect(event).toMatchObject(moved);
  });
});

describe("getSelectionIntent", () => {
  it("makes a timed task from a click in the current quarter hour or later", () => {
    expect(getSelectionIntent({ start: at(12, 10), end: at(12, 10, 15) }, true, NOW)).toEqual({
      kind: "task",
      schedule: { isAllDay: false, isDuration: false, startsAt: at(12, 10).toISOString(), endsAt: null },
    });
  });

  it("makes a duration from a drag across future slots", () => {
    expect(getSelectionIntent({ start: at(12, 11), end: at(12, 12, 30) }, false, NOW)).toEqual({
      kind: "task",
      schedule: {
        isAllDay: false,
        isDuration: true,
        startsAt: at(12, 11).toISOString(),
        endsAt: at(12, 12, 30).toISOString(),
      },
    });
  });

  it("makes an all-day task from a whole future day", () => {
    expect(getSelectionIntent({ start: at(13), end: at(14) }, true, NOW)).toEqual({
      kind: "task",
      schedule: { isAllDay: true, isDuration: false, startsAt: at(13).toISOString(), endsAt: null },
    });
  });

  it("logs time for a past slot, up to now", () => {
    expect(getSelectionIntent({ start: at(12, 9, 30), end: at(12, 10, 30) }, false, NOW)).toEqual({
      kind: "timeLog",
      range: { start: at(12, 9, 30), end: new Date(NOW) },
    });
  });

  it("refuses time more than 24 hours back", () => {
    expect(getSelectionIntent({ start: at(11, 9), end: at(11, 9, 15) }, true, NOW)).toEqual({
      kind: "none",
      error: SELECTION_ERRORS.TOO_FAR_BACK,
    });
  });

  it("ignores past whole days", () => {
    expect(getSelectionIntent({ start: at(11), end: at(12) }, true, NOW)).toEqual({ kind: "none" });
  });
});

describe("getMovedTaskSchedule", () => {
  it("keeps a date a date when moved", () => {
    expect(
      getMovedTaskSchedule(buildTask(), { start: at(14, 11), end: at(14, 11, 30), allDay: false }, false),
    ).toEqual({
      isAllDay: false,
      isDuration: false,
      startsAt: at(14, 11).toISOString(),
      endsAt: null,
    });
  });

  it("turns a date into a duration when resized", () => {
    expect(
      getMovedTaskSchedule(buildTask(), { start: at(13, 9), end: at(13, 11), allDay: false }, true),
    ).toEqual({
      isAllDay: false,
      isDuration: true,
      startsAt: at(13, 9).toISOString(),
      endsAt: at(13, 11).toISOString(),
    });
  });

  it("makes a multi-day all-day duration from the all-day row", () => {
    expect(getMovedTaskSchedule(buildTask(), { start: at(14), end: at(16), allDay: true }, true)).toEqual({
      isAllDay: true,
      isDuration: true,
      startsAt: at(14).toISOString(),
      endsAt: at(15).toISOString(),
    });
  });
});

describe("getMoveError", () => {
  const taskEvent = { kind: "task", start: at(12, 9) } as CalendarEvent;
  const timeLogEvent = { kind: "timeLog" } as CalendarEvent;

  it("lets a task move to the current quarter hour or later", () => {
    expect(
      getMoveError(
        taskEvent,
        { start: getCurrentSlotStart(NOW), end: at(12, 11), allDay: false },
        false,
        NOW,
      ),
    ).toBeNull();
    expect(getMoveError(taskEvent, { start: at(12, 9), end: at(12, 9, 30), allDay: false }, false, NOW)).toBe(
      MOVE_ERRORS.TASK_IN_PAST,
    );
  });

  it("lets an overdue task be stretched into the future", () => {
    expect(
      getMoveError(taskEvent, { start: at(12, 9), end: at(12, 11), allDay: false }, true, NOW),
    ).toBeNull();
    expect(getMoveError(taskEvent, { start: at(12, 9), end: at(12, 10), allDay: false }, true, NOW)).toBe(
      MOVE_ERRORS.TASK_IN_PAST,
    );
  });

  it("lets a task's start be stretched only to the current quarter hour or later", () => {
    const upcoming = { kind: "task", start: at(12, 11) } as CalendarEvent;

    expect(
      getMoveError(upcoming, { start: getCurrentSlotStart(NOW), end: at(12, 12), allDay: false }, true, NOW),
    ).toBeNull();
    expect(getMoveError(upcoming, { start: at(12, 9), end: at(12, 12), allDay: false }, true, NOW)).toBe(
      MOVE_ERRORS.TASK_IN_PAST,
    );
  });

  it("keeps time logs inside the last 24 hours", () => {
    expect(
      getMoveError(timeLogEvent, { start: at(12, 8), end: at(12, 9), allDay: false }, false, NOW),
    ).toBeNull();
    expect(getMoveError(timeLogEvent, { start: at(11, 9), end: at(11, 10), allDay: false }, false, NOW)).toBe(
      MOVE_ERRORS.TIME_LOG_OUTSIDE_WINDOW,
    );
    expect(
      getMoveError(timeLogEvent, { start: at(12, 10), end: at(12, 11), allDay: false }, false, NOW),
    ).toBe(MOVE_ERRORS.TIME_LOG_OUTSIDE_WINDOW);
    expect(getMoveError(timeLogEvent, { start: at(12), end: at(13), allDay: true }, false, NOW)).toBe(
      MOVE_ERRORS.TIME_LOG_ALL_DAY,
    );
  });
});

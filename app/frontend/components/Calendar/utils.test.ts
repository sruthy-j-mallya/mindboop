import { describe, expect, it } from "vitest";

import type { Task, TimeLog } from "@/apis/types";

import { MOVE_ERRORS, SELECTION_ERRORS } from "./constants";
import type { CalendarEvent } from "./types";
import {
  getCurrentSlotStart,
  getMovedTaskSchedule,
  getMoveError,
  getSelectionIntent,
  getVisibleRange,
  toCalendarEvents,
  toTaskTimes,
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
  ...overrides,
});

const buildTimeLog = (overrides: Partial<TimeLog> = {}): TimeLog => ({
  id: "log-1",
  taskId: null,
  title: "Answer emails",
  taskTitle: null,
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

describe("getVisibleRange", () => {
  it("covers the week from Monday", () => {
    expect(getVisibleRange("week", at(12, 15))).toEqual({ start: at(9), end: at(16) });
  });

  it("covers three days from the chosen one", () => {
    expect(getVisibleRange("multiDay", at(12, 15))).toEqual({ start: at(12), end: at(15) });
  });

  it("covers the whole weeks a month touches", () => {
    expect(getVisibleRange("month", at(12))).toEqual({
      start: new Date(2026, 9, 26),
      end: new Date(2026, 11, 7),
    });
  });

  it("covers the year", () => {
    expect(getVisibleRange("year", at(12))).toEqual({
      start: new Date(2026, 0, 1),
      end: new Date(2027, 0, 1),
    });
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

import { describe, expect, it } from "vitest";

import type { TimeLog } from "@/apis/types";

import { describeReminder, formatLastDone, formatTotalTime, getMinutesByDay, getWeekdays } from "./utils";

describe("Routines utils", () => {
  it("describes a reminder by its days", () => {
    expect(describeReminder({ reminderTime: null, reminderDays: [] }, "12h")).toBeNull();
    expect(describeReminder({ reminderTime: "08:30", reminderDays: [0, 1, 2, 3, 4, 5, 6] }, "12h")).toMatch(
      /^Daily at 8:30am$/,
    );
    expect(describeReminder({ reminderTime: "08:30", reminderDays: [1] }, "12h")).toMatch(
      /^Mondays at 8:30am$/,
    );
    expect(describeReminder({ reminderTime: "18:00", reminderDays: [5, 1, 3] }, "12h")).toMatch(
      /^Mon, Wed, Fri at 6pm$/,
    );
  });

  it("orders the weekdays from the one weeks start on", () => {
    expect(getWeekdays(1).map(({ value }) => value)).toEqual([1, 2, 3, 4, 5, 6, 0]);
    expect(getWeekdays(0).map(({ value }) => value)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(getWeekdays(6).map(({ value }) => value)).toEqual([6, 0, 1, 2, 3, 4, 5]);
  });

  it("says when it was last done in plain words", () => {
    const now = new Date(2026, 10, 19, 12);

    expect(formatLastDone(new Date(2026, 10, 19, 8).toISOString(), now)).toBe("Today");
    expect(formatLastDone(new Date(2026, 10, 18, 23).toISOString(), now)).toBe("Yesterday");
    expect(formatLastDone(new Date(2026, 10, 12, 9).toISOString(), now)).toBe("7 days ago");
  });

  it("rounds the total time to the minute", () => {
    expect(formatTotalTime(0)).toBe("0 min");
    expect(formatTotalTime(7170)).toBe("2 h");
    expect(formatTotalTime(7140)).toBe("1 h 59 min");
  });

  it("adds up the minutes of each day's sessions", () => {
    const session = (startedAt: Date, seconds: number) =>
      ({ startedAt: startedAt.toISOString(), accumulatedElapsedSeconds: seconds }) as TimeLog;

    const minutesByDay = getMinutesByDay([
      session(new Date(2026, 10, 18, 8), 600),
      session(new Date(2026, 10, 18, 20), 300),
      session(new Date(2026, 10, 19, 7), 1500),
    ]);

    expect(Object.fromEntries(minutesByDay)).toEqual({ "2026-11-18": 15, "2026-11-19": 25 });
  });
});

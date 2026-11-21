import { describe, expect, it } from "vitest";

import type { CalendarEvent } from "../types";
import { getDayCounts, getDayLabel } from "./utils";

const event = (kind: CalendarEvent["kind"], start: Date, end: Date) =>
  ({ kind, start, end }) as CalendarEvent;

describe("getDayCounts", () => {
  it("counts every day an event touches, by kind", () => {
    const counts = getDayCounts([
      event("task", new Date(2026, 10, 12), new Date(2026, 10, 14)),
      event("timeLog", new Date(2026, 10, 12, 9), new Date(2026, 10, 12, 10)),
    ]);

    expect(counts.get("2026-11-12")).toEqual({ tasks: 1, timeLogs: 1 });
    expect(counts.get("2026-11-13")).toEqual({ tasks: 1, timeLogs: 0 });
    expect(counts.has("2026-11-14")).toBe(false);
  });
});

describe("getDayLabel", () => {
  it("reads the day and its counts", () => {
    expect(getDayLabel(new Date(2026, 10, 16), { tasks: 2, timeLogs: 1 })).toBe(
      "Monday, 16 November 2026: 2 tasks, 1 time log",
    );
  });
});

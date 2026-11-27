import { describe, expect, it } from "vitest";

import type { ScheduleDraft } from "./types";
import {
  getDraftError,
  getFirstSlotIndex,
  getMinStartTime,
  getQuickDays,
  moveStart,
  parseTimeText,
  setAllDay,
  setDateTime,
  setIsDuration,
  toTimeLabel,
  toTimeSlotIndex,
} from "./utils";

const NOW = new Date(2026, 10, 12, 10, 20).getTime();

const draftOf = (overrides: Partial<ScheduleDraft>): ScheduleDraft => ({
  isDuration: false,
  isAllDay: true,
  startsAt: new Date(2026, 10, 12),
  endsAt: new Date(2026, 10, 12),
  ...overrides,
});

describe("SchedulePicker utils", () => {
  it("moves the end with the start, so a duration keeps its length", () => {
    const draft = draftOf({
      isAllDay: false,
      startsAt: new Date(2026, 10, 12, 9),
      endsAt: new Date(2026, 10, 12, 10),
    });

    const moved = moveStart(draft, new Date(2026, 10, 14, 15));

    expect(moved.endsAt).toEqual(new Date(2026, 10, 14, 16));
  });

  it("sets and removes a date's time", () => {
    const timed = setDateTime(draftOf({}), "17:30");
    expect(timed).toMatchObject({ isAllDay: false, startsAt: new Date(2026, 10, 12, 17, 30) });

    expect(setDateTime(timed, "")).toMatchObject({ isAllDay: true, startsAt: new Date(2026, 10, 12) });
  });

  it("starts a timed slot today at the next full hour, lasting an hour", () => {
    const draft = setAllDay(draftOf({ isDuration: true }), false, NOW);

    expect(draft).toMatchObject({ startsAt: new Date(2026, 10, 12, 11), endsAt: new Date(2026, 10, 12, 12) });
  });

  it("starts a timed slot on another day at 9am and keeps the last day of a longer one", () => {
    const draft = setAllDay(
      draftOf({ isDuration: true, startsAt: new Date(2026, 10, 14), endsAt: new Date(2026, 10, 16) }),
      false,
      NOW,
    );

    expect(draft).toMatchObject({ startsAt: new Date(2026, 10, 14, 9), endsAt: new Date(2026, 10, 16, 10) });
  });

  it("gives a timed date an hour when it becomes a duration", () => {
    const draft = draftOf({
      isAllDay: false,
      startsAt: new Date(2026, 10, 12, 9),
      endsAt: new Date(2026, 10, 12, 9),
    });

    expect(setIsDuration(draft, true).endsAt).toEqual(new Date(2026, 10, 12, 10));
  });

  it("rejects a duration that ends before it starts", () => {
    const draft = draftOf({
      isDuration: true,
      startsAt: new Date(2026, 10, 12, 9),
      endsAt: new Date(2026, 10, 12, 8),
    });

    expect(getDraftError(draft, null, NOW)).toBe("The end can't be before the start");
    expect(getDraftError({ ...draft, isDuration: false }, null, NOW)).toBeNull();
  });

  it("rejects a start moved into the past, from the current quarter hour for a timed one", () => {
    const timed = (hours: number, minutes: number) =>
      draftOf({ isAllDay: false, startsAt: new Date(2026, 10, 12, hours, minutes) });

    expect(getDraftError(timed(10, 15), null, NOW)).toBeNull();
    expect(getDraftError(timed(10, 14), null, NOW)).toBe("Tasks can only be scheduled from now on");
    expect(getDraftError(draftOf({ startsAt: new Date(2026, 10, 12) }), null, NOW)).toBeNull();
    expect(getDraftError(draftOf({ startsAt: new Date(2026, 10, 11) }), null, NOW)).toBe(
      "Tasks can only be scheduled from now on",
    );
  });

  it("keeps an overdue task's start where it was saved", () => {
    const savedStart = new Date(2026, 10, 10, 9);
    const draft = draftOf({
      isAllDay: false,
      isDuration: true,
      startsAt: savedStart,
      endsAt: new Date(2026, 10, 13, 9),
    });

    expect(getDraftError(draft, savedStart, NOW)).toBeNull();
  });

  it("offers times from the current quarter hour today, and any time on a later day", () => {
    expect(getMinStartTime(new Date(2026, 10, 12, 9), NOW)).toBe("10:15");
    expect(getMinStartTime(new Date(2026, 10, 13, 9), NOW)).toBeUndefined();
    expect(getFirstSlotIndex("10:15")).toBe(21);
    expect(getFirstSlotIndex("10:00")).toBe(20);
    expect(getFirstSlotIndex(undefined)).toBe(0);
    expect(getFirstSlotIndex("23:45")).toBe(48);
  });

  it("reads typed times on a 12- or 24-hour clock", () => {
    expect(parseTimeText("3pm")).toBe("15:00");
    expect(parseTimeText(" 3:30 P.M. ")).toBe("15:30");
    expect(parseTimeText("12am")).toBe("00:00");
    expect(parseTimeText("12:15pm")).toBe("12:15");
    expect(parseTimeText("17:45")).toBe("17:45");
    expect(parseTimeText("930")).toBe("09:30");
    expect(parseTimeText("9")).toBe("09:00");
  });

  it("rejects text that isn't a time", () => {
    ["", "lunch", "13pm", "0am", "24:00", "9:60", "9:5", "9m"].forEach((text) =>
      expect(parseTimeText(text)).toBeNull(),
    );
  });

  it("labels times and finds their half-hour slot", () => {
    expect(toTimeLabel("15:30", "12h")).toBe("3:30pm");
    expect(toTimeLabel("15:30", "24h")).toBe("15:30");
    expect(toTimeSlotIndex("15:30")).toBe(31);
    expect(toTimeSlotIndex("15:45")).toBe(31);
    expect(toTimeSlotIndex("00:00")).toBe(0);
  });
});

describe("getQuickDays", () => {
  it("offers today, tomorrow and the first day of next week", () => {
    // A Thursday.
    const days = (weekStartsOn: 0 | 1) =>
      getQuickDays(new Date(2026, 10, 12), weekStartsOn).map(({ day }) => day.getDate());

    expect(days(1)).toEqual([12, 13, 16]);
    expect(days(0)).toEqual([12, 13, 15]);
  });
});

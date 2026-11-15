import { describe, expect, it } from "vitest";

import type { Schedule } from "./types";
import { formatSchedule, getScheduleTone } from "./utils";

// Thursday 12 Nov 2026, 10:00 local time; its week runs from Monday 9 Nov to Sunday 15 Nov.
const NOW = new Date(2026, 10, 12, 10, 0).getTime();

const at = (month: number, day: number, hours = 0, minutes = 0, year = 2026) =>
  new Date(year, month, day, hours, minutes).toISOString();

const onDate = (startsAt: string, isAllDay = true): Schedule => ({
  isDuration: false,
  isAllDay,
  startsAt,
  endsAt: null,
});

const forDuration = (startsAt: string, endsAt: string, isAllDay = false): Schedule => ({
  isDuration: true,
  isAllDay,
  startsAt,
  endsAt,
});

describe("formatSchedule", () => {
  it("is null for an unscheduled task", () => {
    expect(
      formatSchedule({ isDuration: false, isAllDay: false, startsAt: null, endsAt: null }, NOW),
    ).toBeNull();
  });

  it.each([
    [at(10, 12), "Today"],
    [at(10, 13), "Tomorrow"],
    [at(10, 11), "Yesterday"],
    [at(10, 15), "Sun, Nov 15"],
    [at(10, 9), "Mon, Nov 9"],
    [at(10, 16), "16 Nov"],
    [at(7, 12), "12 Aug"],
    [at(0, 3, 0, 0, 2027), "3 Jan 2027"],
  ])("names the day of an all-day date %s as %s", (startsAt, label) => {
    expect(formatSchedule(onDate(startsAt), NOW)).toBe(label);
  });

  it("adds the time to a timed date", () => {
    expect(formatSchedule(onDate(at(10, 12, 17, 30), false), NOW)).toBe("Today 5:30pm");
    expect(formatSchedule(onDate(at(7, 12, 12, 0), false), NOW)).toBe("12 Aug 12:00pm");
  });

  it("shows a duration within a day once, with both times", () => {
    expect(formatSchedule(forDuration(at(10, 13, 1), at(10, 13, 2)), NOW)).toBe("Tomorrow 1:00am – 2:00am");
  });

  it("shows both ends of a duration over several days", () => {
    expect(formatSchedule(forDuration(at(10, 12, 23), at(10, 13, 1)), NOW)).toBe(
      "Today 11:00pm – Tomorrow 1:00am",
    );
    expect(formatSchedule(forDuration(at(10, 20), at(10, 22), true), NOW)).toBe("20 Nov – 22 Nov");
    expect(formatSchedule(forDuration(at(10, 20), at(10, 20), true), NOW)).toBe("20 Nov");
  });
});

describe("getScheduleTone", () => {
  it("is overdue once an all-day date's day has passed", () => {
    expect(getScheduleTone(onDate(at(10, 11)), NOW)).toBe("overdue");
    expect(getScheduleTone(onDate(at(10, 12)), NOW)).toBe("today");
  });

  it("is overdue once a timed date or a duration's end has passed", () => {
    expect(getScheduleTone(onDate(at(10, 12, 9), false), NOW)).toBe("overdue");
    expect(getScheduleTone(forDuration(at(10, 12, 9), at(10, 12, 11)), NOW)).toBe("today");
  });

  it("is today while a duration over several days covers today", () => {
    expect(getScheduleTone(forDuration(at(10, 11), at(10, 13), true), NOW)).toBe("today");
  });

  it("is upcoming after today", () => {
    expect(getScheduleTone(onDate(at(10, 13)), NOW)).toBe("upcoming");
  });
});

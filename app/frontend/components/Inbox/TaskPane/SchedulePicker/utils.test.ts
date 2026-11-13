import { describe, expect, it } from "vitest";

import type { ScheduleDraft } from "./types";
import { getDraftError, moveStart, setAllDay, setDateTime, setIsDuration } from "./utils";

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

    expect(getDraftError(draft)).toBe("The end can't be before the start");
    expect(getDraftError({ ...draft, isDuration: false })).toBeNull();
  });
});

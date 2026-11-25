import { describe, expect, it } from "vitest";

import { getInitialValues, getLoggedRange } from "./utils";

const NOW = new Date(2026, 10, 25, 18, 30, 40);

describe("getInitialValues", () => {
  it("ends now when logging today", () => {
    expect(getInitialValues(new Date(2026, 10, 25), 20, NOW)).toEqual({ startTime: "18:10", minutes: 20 });
  });

  it("doesn't reach back into yesterday", () => {
    const now = new Date(2026, 10, 25, 0, 5);

    expect(getInitialValues(new Date(2026, 10, 25), 20, now).startTime).toBe("00:00");
  });

  it("starts a past day at a plain time", () => {
    expect(getInitialValues(new Date(2026, 10, 2), 20, NOW)).toEqual({ startTime: "09:00", minutes: 20 });
  });
});

describe("getLoggedRange", () => {
  it("can run past midnight", () => {
    expect(getLoggedRange(new Date(2026, 10, 2), { startTime: "23:50", minutes: 20 })).toEqual({
      start: new Date(2026, 10, 2, 23, 50),
      end: new Date(2026, 10, 3, 0, 10),
    });
  });
});

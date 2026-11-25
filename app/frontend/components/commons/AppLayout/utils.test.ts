import { describe, expect, it } from "vitest";

import { isReminderDue } from "./utils";

// Thursday 19 November 2026, local time.
const at = (hours: number, minutes: number) => new Date(2026, 10, 19, hours, minutes);

describe("isReminderDue", () => {
  const reminder = { reminderTime: "08:30", reminderDays: [4] };

  it("is due from its time until the grace period ends, on its days", () => {
    expect(isReminderDue(reminder, at(8, 29))).toBe(false);
    expect(isReminderDue(reminder, at(8, 30))).toBe(true);
    expect(isReminderDue(reminder, at(9, 0))).toBe(true);
    expect(isReminderDue(reminder, at(9, 1))).toBe(false);
  });

  it("isn't due on other days, or without a time", () => {
    expect(isReminderDue({ ...reminder, reminderDays: [1, 5] }, at(8, 45))).toBe(false);
    expect(isReminderDue({ reminderTime: null, reminderDays: [] }, at(8, 45))).toBe(false);
  });
});

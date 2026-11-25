import { describe, expect, it } from "vitest";

import {
  formatDate,
  formatDateTime,
  formatDayRange,
  formatLongDate,
  formatTime,
  formatTimeRange,
  formatWeekdayDate,
} from "./dateTime";

const NOW = new Date(2026, 10, 12, 10);

const at = (hours: number, minutes = 0) => new Date(2026, 10, 12, hours, minutes);

describe("dateTime", () => {
  it("formats dates, with the year only when it's another one", () => {
    expect(formatDate(NOW, NOW)).toBe("12 Nov");
    expect(formatDate(new Date(2027, 7, 2), NOW)).toBe("2 Aug 2027");
    expect(formatWeekdayDate(NOW)).toBe("Thu, 12 Nov");
    expect(formatLongDate(NOW)).toBe("Thursday, 12 November");
  });

  it("formats times on either clock", () => {
    expect(formatTime(at(17, 30), "12h")).toBe("5:30pm");
    expect(formatTime(at(0), "12h")).toBe("12am");
    expect(formatTime(at(17, 30), "24h")).toBe("17:30");
    expect(formatTime(at(9), "24h")).toBe("09:00");
    expect(formatDateTime(at(17, 30), NOW, "12h")).toBe("12 Nov, 5:30pm");
    expect(formatDateTime(at(17, 30), NOW, "24h")).toBe("12 Nov, 17:30");
  });

  it("formats time ranges, with am or pm once when they share it", () => {
    expect(formatTimeRange(at(10), at(11, 30), "12h")).toBe("10 – 11:30am");
    expect(formatTimeRange(at(11), at(13), "12h")).toBe("11am – 1pm");
    expect(formatTimeRange(at(10), at(11, 30), "24h")).toBe("10:00 – 11:30");
  });

  it("formats ranges of days", () => {
    expect(formatDayRange(new Date(2026, 10, 23), new Date(2026, 10, 29))).toBe("23 – 29 November");
    expect(formatDayRange(new Date(2026, 10, 30), new Date(2026, 11, 6))).toBe("30 Nov – 6 Dec");
  });
});

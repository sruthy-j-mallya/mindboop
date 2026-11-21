import { describe, expect, it } from "vitest";

import { buildLogTimePayload, formatTimeRange } from "./utils";

const RANGE = { start: new Date(2026, 10, 12, 9, 15), end: new Date(2026, 10, 12, 10) };

describe("buildLogTimePayload", () => {
  it("links the time to a task when one is picked", () => {
    expect(
      buildLogTimePayload({ title: "Emails", task: { id: "task-1", title: "Inbox zero" } }, RANGE),
    ).toEqual({
      mode: "manual",
      startedAt: RANGE.start.toISOString(),
      completedAt: RANGE.end.toISOString(),
      taskId: "task-1",
    });
  });

  it("saves a title of its own otherwise", () => {
    expect(buildLogTimePayload({ title: "Emails", task: null }, RANGE)).toMatchObject({ title: "Emails" });
  });

  it("saves nothing without either", () => {
    expect(buildLogTimePayload({ title: "", task: null }, RANGE)).toBeNull();
  });
});

describe("formatTimeRange", () => {
  it("names the day once for a range inside it", () => {
    expect(formatTimeRange(RANGE)).toBe("Thu 12 Nov, 9:15 AM – 10:00 AM");
  });
});

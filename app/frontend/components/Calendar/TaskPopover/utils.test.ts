import { describe, expect, it } from "vitest";

import { buildCreatePayload, getNewTaskFormValues } from "./utils";

const SCHEDULE = { isDuration: false, isAllDay: false, startsAt: "2026-11-13T09:00:00.000Z", endsAt: null };

describe("buildCreatePayload", () => {
  it("sends the schedule, estimate and steps, and leaves out an empty description", () => {
    const values = {
      ...getNewTaskFormValues(SCHEDULE),
      title: "Plan the week",
      estimatedMinutes: 45,
      steps: [{ text: "List the goals", isDone: false }],
    };

    expect(buildCreatePayload(values)).toEqual({
      title: "Plan the week",
      estimatedMinutes: 45,
      ...SCHEDULE,
      checklistItemsAttributes: [{ title: "List the goals", isCompleted: false }],
    });
  });
});

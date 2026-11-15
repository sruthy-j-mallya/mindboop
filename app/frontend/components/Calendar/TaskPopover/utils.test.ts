import { describe, expect, it } from "vitest";

import type { Task } from "@/apis/types";

import { buildCreatePayload, buildUpdatePayload, getNewTaskFormValues, toFormValues } from "./utils";

const TASK: Task = {
  id: "task-1",
  title: "Write the report",
  description: "Draft first",
  estimatedMinutes: 30,
  isDuration: false,
  isAllDay: false,
  isCompleted: false,
  startsAt: "2026-11-13T09:00:00.000Z",
  endsAt: null,
  createdAt: "2026-11-05T10:00:00.000Z",
  updatedAt: "2026-11-05T10:00:00.000Z",
  checklistItems: [],
};

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

describe("buildUpdatePayload", () => {
  it("sends nothing for an untouched task", () => {
    expect(buildUpdatePayload(TASK, toFormValues(TASK))).toBeNull();
  });

  it("sends only what changed", () => {
    const values = { ...toFormValues(TASK), title: "Write the summary", estimatedMinutes: null };

    expect(buildUpdatePayload(TASK, values)).toEqual({
      id: "task-1",
      title: "Write the summary",
      estimatedMinutes: null,
    });
  });

  it("sends the whole schedule when any part of it changed", () => {
    const schedule = { ...SCHEDULE, isAllDay: true };

    expect(buildUpdatePayload(TASK, { ...toFormValues(TASK), schedule })).toEqual({
      id: "task-1",
      ...schedule,
    });
  });
});

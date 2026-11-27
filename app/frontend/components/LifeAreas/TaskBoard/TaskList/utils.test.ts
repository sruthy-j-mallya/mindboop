import { describe, expect, it } from "vitest";

import type { Task } from "@/apis/types";

import { groupTasks } from "./utils";

const NOW = new Date(2026, 10, 12, 10).getTime();

const buildTask = (id: string, startsAt: Date | null) =>
  ({
    id,
    isDuration: false,
    isAllDay: true,
    startsAt: startsAt?.toISOString() ?? null,
    endsAt: null,
  }) as Task;

describe("groupTasks", () => {
  it("groups tasks by when they're due, in order, without empty groups", () => {
    const groups = groupTasks(
      [
        buildTask("late", new Date(2026, 10, 10)),
        buildTask("later", new Date(2026, 10, 11)),
        buildTask("now", new Date(2026, 10, 12)),
        buildTask("someday", null),
      ],
      NOW,
    );

    expect(groups.map(({ label, tasks }) => [label, tasks.map(({ id }) => id)])).toEqual([
      ["Overdue", ["late", "later"]],
      ["Today", ["now"]],
      ["No date", ["someday"]],
    ]);
  });
});

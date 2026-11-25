import { describe, expect, it } from "vitest";

import type { Routine } from "@/apis/types";

import { INITIAL_FORM_VALUES } from "./constants";
import { toRoutineFormValues, toRoutinePayload } from "./utils";

const ROUTINE: Routine = {
  id: "routine-1",
  title: "Shower",
  emoji: "🛁",
  color: "teal",
  sound: "rain",
  durationMinutes: 15,
  reminderTime: null,
  reminderDays: [],
  sessionsCount: 0,
  totalSeconds: 0,
  lastDoneAt: null,
  createdAt: "2026-11-19T08:00:00.000Z",
  updatedAt: "2026-11-19T08:00:00.000Z",
};

describe("Routine form utils", () => {
  it("sends no reminder when it's off, whatever days were picked", () => {
    const payload = toRoutinePayload({ ...INITIAL_FORM_VALUES, title: "Shower", reminderDays: [1, 2] });

    expect(payload).toMatchObject({ reminderTime: null, reminderDays: [] });
    expect(payload).not.toHaveProperty("reminderFrequency");
  });

  it("turns each frequency into the days it stands for", () => {
    const values = { ...INITIAL_FORM_VALUES, reminderTime: "07:30", reminderDays: [3, 5] };

    expect(toRoutinePayload({ ...values, reminderFrequency: "daily" }).reminderDays).toEqual([
      0, 1, 2, 3, 4, 5, 6,
    ]);
    expect(toRoutinePayload({ ...values, reminderFrequency: "weekly" }).reminderDays).toEqual([3]);
    expect(toRoutinePayload({ ...values, reminderFrequency: "custom" }).reminderDays).toEqual([3, 5]);
  });

  it("reads the frequency back from the days", () => {
    const withDays = (reminderDays: number[]) =>
      toRoutineFormValues({ ...ROUTINE, reminderTime: "07:30", reminderDays });

    expect(toRoutineFormValues(ROUTINE).reminderFrequency).toBe("off");
    expect(withDays([0, 1, 2, 3, 4, 5, 6]).reminderFrequency).toBe("daily");
    expect(withDays([2]).reminderFrequency).toBe("weekly");
    expect(withDays([1, 4]).reminderFrequency).toBe("custom");
  });
});

import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { UserPreference } from "@/apis/types";
import userPreferencesApi from "@/apis/user_preferences";
import SchedulePicker from "@/components/commons/SchedulePicker";
import { renderWithProviders } from "@/test/utils";

const PREFERENCE: UserPreference = {
  theme: "system",
  completionSound: "rising",
  breakAlarmSound: "classic",
  weekStartsOn: 1,
  timeFormat: "12h",
};

const renderPicker = async (preference: Partial<UserPreference> = {}) => {
  vi.spyOn(userPreferencesApi, "show").mockResolvedValue({
    userPreference: { ...PREFERENCE, ...preference },
  });
  renderWithProviders(
    <SchedulePicker onSave={vi.fn()}>
      <button type="button">Schedule</button>
    </SchedulePicker>,
  );
  await userEvent.click(screen.getByRole("button", { name: "Schedule" }));
};

// The day picker hides its weekday row from assistive tech (each day's label already names it), so it's queried hidden.
const firstWeekday = async (container: HTMLElement) =>
  (await within(container).findAllByRole("columnheader", { hidden: true }))[0];

describe("SchedulePicker", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts the week on Monday by default", async () => {
    await renderPicker();

    expect(await firstWeekday(await screen.findByRole("dialog"))).toHaveAccessibleName("Monday");
  });

  it("starts the Date tab's weeks on the day picked in Settings", async () => {
    await renderPicker({ weekStartsOn: 0 });

    const dialog = await screen.findByRole("dialog");
    await vi.waitFor(async () => expect(await firstWeekday(dialog)).toHaveAccessibleName("Sunday"));
  });

  it("starts the Duration tab's date pickers' weeks on the day picked in Settings", async () => {
    await renderPicker({ weekStartsOn: 6 });
    await userEvent.click(await screen.findByRole("tab", { name: "Duration" }));
    await userEvent.click(screen.getByRole("button", { name: "Start date" }));

    const [, startDatePicker] = await screen.findAllByRole("dialog");
    expect(await firstWeekday(startDatePicker)).toHaveAccessibleName("Saturday");
  });
});

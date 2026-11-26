import { useState } from "react";

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/apis/axios";
import lifeAreasApi from "@/apis/life_areas";
import tasksApi from "@/apis/tasks";
import userPreferencesApi from "@/apis/user_preferences";
import type { Schedule } from "@/components/commons/ScheduleLabel/types";
import { renderWithProviders } from "@/test/utils";

import New from "./New";

const ANCHOR = { top: 100, left: 100, width: 100, height: 40 };
const SCHEDULE: Schedule = {
  isDuration: false,
  isAllDay: false,
  startsAt: new Date(Date.now() + 2 * 60 * 60_000).toISOString(),
  endsAt: null,
};
const PAST_START_ERROR = "Starts at can't be in the past";

// Unmounts the popover on close, as the Calendar does.
const PopoverHarness = ({ onClose }: { onClose: () => void }) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    onClose();
    setIsOpen(false);
  };

  return isOpen && <New anchor={ANCHOR} schedule={SCHEDULE} onClose={handleClose} />;
};

describe("New task popover", () => {
  beforeEach(() => {
    vi.spyOn(lifeAreasApi, "fetchList").mockResolvedValue({ lifeAreas: [] });
    vi.spyOn(userPreferencesApi, "show").mockResolvedValue({
      userPreference: {
        theme: "system",
        completionSound: "bell",
        breakAlarmSound: "classic",
        weekStartsOn: 1,
        timeFormat: "12h",
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps a refused task open with the reason, and closes once it's saved", async () => {
    const create = vi
      .spyOn(tasksApi, "create")
      .mockRejectedValueOnce(new ApiError(422, PAST_START_ERROR))
      .mockResolvedValueOnce({ task: {} as never });
    const onClose = vi.fn();
    renderWithProviders(<PopoverHarness onClose={onClose} />);

    await userEvent.type(screen.getByRole("textbox", { name: "Title" }), "Plan the week");
    await userEvent.click(screen.getByRole("button", { name: "Add task" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(PAST_START_ERROR);
    expect(screen.getByRole("dialog", { name: "New task" })).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Add task" }));

    expect(create).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(screen.queryByRole("dialog", { name: "New task" })).not.toBeInTheDocument();
  });
});

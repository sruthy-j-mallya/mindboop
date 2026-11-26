import { useState } from "react";

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/apis/axios";
import timeLogsApi from "@/apis/time_logs";
import userPreferencesApi from "@/apis/user_preferences";
import { renderWithProviders } from "@/test/utils";

import TimeLogPopover from ".";

const ANCHOR = { top: 100, left: 100, width: 100, height: 40 };
const RANGE = { start: new Date(2026, 10, 26, 20, 0), end: new Date(2026, 10, 26, 20, 45) };
const OVERLAP_ERROR = "This overlaps another session. You can only do one thing at a time.";

// Unmounts the popover on close, as the Calendar does.
const PopoverHarness = ({ onClose }: { onClose: () => void }) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    onClose();
    setIsOpen(false);
  };

  return isOpen && <TimeLogPopover anchor={ANCHOR} range={RANGE} onClose={handleClose} />;
};

const renderPopover = (onClose = vi.fn()) => renderWithProviders(<PopoverHarness onClose={onClose} />);

const typeTime = async (label: string, text: string) => {
  const field = screen.getByRole("combobox", { name: label });
  await userEvent.clear(field);
  await userEvent.type(field, `${text}{Enter}`);
};

describe("TimeLogPopover", () => {
  beforeEach(() => {
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

  it("logs the times typed to the minute", async () => {
    const create = vi.spyOn(timeLogsApi, "create").mockResolvedValue({ timeLog: {} as never });
    const onClose = vi.fn();
    renderPopover(onClose);

    await userEvent.type(screen.getByRole("textbox", { name: "What did you work on?" }), "Watched a talk");
    await typeTime("Start time", "8:07pm");
    await typeTime("End time", "8:41pm");
    await userEvent.click(screen.getByRole("button", { name: "Log time" }));

    expect(create).toHaveBeenCalledWith(
      {
        mode: "manual",
        title: "Watched a talk",
        startedAt: new Date(2026, 10, 26, 20, 7).toISOString(),
        completedAt: new Date(2026, 10, 26, 20, 41).toISOString(),
      },
      expect.anything(),
    );
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("asks for an end after the start", async () => {
    const create = vi.spyOn(timeLogsApi, "create");
    renderPopover();

    await userEvent.type(screen.getByRole("textbox", { name: "What did you work on?" }), "Watched a talk");
    await typeTime("End time", "7:30pm");
    await userEvent.click(screen.getByRole("button", { name: "Log time" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("End must be after the start");
    expect(create).not.toHaveBeenCalled();

    await typeTime("End time", "8:30pm");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("keeps a refused log open with the reason under the times, until the times are fixed", async () => {
    const create = vi
      .spyOn(timeLogsApi, "create")
      .mockRejectedValueOnce(new ApiError(422, OVERLAP_ERROR))
      .mockResolvedValueOnce({ timeLog: {} as never });
    const onClose = vi.fn();
    renderPopover(onClose);

    await userEvent.type(
      screen.getByRole("textbox", { name: "What did you work on?" }),
      "Watched a talk{Enter}",
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(OVERLAP_ERROR);
    expect(screen.getByRole("dialog", { name: "Log time" })).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();

    await typeTime("Start time", "8:13pm");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Log time" }));

    expect(create).toHaveBeenLastCalledWith(
      expect.objectContaining({ startedAt: new Date(2026, 10, 26, 20, 13).toISOString() }),
      expect.anything(),
    );
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(screen.queryByRole("dialog", { name: "Log time" })).not.toBeInTheDocument();
  });
});

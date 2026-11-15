import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { addMonths, format, startOfHour, subHours } from "date-fns";
import { afterEach, describe, expect, it, vi } from "vitest";

import calendarEventsApi from "@/apis/calendar_events";
import type { Task, TimeLog } from "@/apis/types";
import { renderWithProviders } from "@/test/utils";

import Calendar from ".";

const startsAt = startOfHour(new Date(Date.now() + 2 * 60 * 60_000));

const TASK: Task = {
  id: "task-1",
  title: "Plan the week",
  description: null,
  estimatedMinutes: 30,
  isDuration: false,
  isAllDay: false,
  isCompleted: false,
  startsAt: startsAt.toISOString(),
  endsAt: null,
  createdAt: "2026-11-05T10:00:00.000Z",
  updatedAt: "2026-11-05T10:00:00.000Z",
  checklistItems: [],
};

const loggedAt = startOfHour(subHours(new Date(), 2));

const TIME_LOG: TimeLog = {
  id: "log-1",
  taskId: null,
  title: "Answer emails",
  taskTitle: null,
  mode: "manual",
  timerPreset: null,
  bufferMinutes: 0,
  accumulatedElapsedSeconds: 1800,
  isRunning: false,
  currentRunStartedAt: null,
  startedAt: loggedAt.toISOString(),
  completedAt: new Date(loggedAt.getTime() + 30 * 60_000).toISOString(),
  isFinishedEarly: false,
  currentBreak: null,
  createdAt: "2026-11-05T10:00:00.000Z",
  updatedAt: "2026-11-05T10:00:00.000Z",
};

describe("Calendar", () => {
  afterEach(() => vi.restoreAllMocks());

  it("shows the visible range's tasks and time logs, each in its own style", async () => {
    const fetchList = vi
      .spyOn(calendarEventsApi, "fetchList")
      .mockResolvedValue({ tasks: [TASK], timeLogs: [TIME_LOG] });
    renderWithProviders(<Calendar />);
    await userEvent.click(screen.getByRole("tab", { name: "Month" }));

    const task = await screen.findByTitle("Plan the week");
    expect(task.closest(".rbc-event")).toHaveClass("calendar-event-task");
    expect(screen.getByTitle("Answer emails").closest(".rbc-event")).toHaveClass("calendar-event-time-log");
    expect(fetchList).toHaveBeenLastCalledWith({ from: expect.any(String), to: expect.any(String) });
  });

  it("opens a task for editing when it's clicked", async () => {
    vi.spyOn(calendarEventsApi, "fetchList").mockResolvedValue({ tasks: [TASK], timeLogs: [] });
    renderWithProviders(<Calendar />);
    await userEvent.click(screen.getByRole("tab", { name: "Month" }));

    await userEvent.click(await screen.findByTitle("Plan the week"));

    const dialog = await screen.findByRole("dialog", { name: "Edit task" });
    expect(within(dialog).getByRole("textbox", { name: "Title" })).toHaveValue("Plan the week");
  });

  it("switches between the views", async () => {
    vi.spyOn(calendarEventsApi, "fetchList").mockResolvedValue({ tasks: [], timeLogs: [] });
    renderWithProviders(<Calendar />);

    await userEvent.click(screen.getByRole("tab", { name: "Year" }));

    expect(screen.getByRole("region", { name: /^January / })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Year" })).toHaveAttribute("aria-selected", "true");
  });

  it("pages through months when the month view is scrolled, one page per gesture", async () => {
    vi.spyOn(calendarEventsApi, "fetchList").mockResolvedValue({ tasks: [], timeLogs: [] });
    renderWithProviders(<Calendar />);
    await userEvent.click(screen.getByRole("tab", { name: "Month" }));
    const grid = screen.getByRole("table");

    fireEvent.wheel(grid, { deltaY: 100 });
    // The rest of the same gesture (a trackpad's momentum) doesn't turn another page.
    fireEvent.wheel(grid, { deltaY: 100 });

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      format(addMonths(new Date(), 1), "MMMM yyyy"),
    );
  });

  it("pages back a week when scrolled sideways, but leaves scrolling up and down to the grid", async () => {
    vi.spyOn(calendarEventsApi, "fetchList").mockResolvedValue({ tasks: [], timeLogs: [] });
    renderWithProviders(<Calendar />);
    const title = screen.getByRole("heading", { level: 2 });
    const thisWeek = title.textContent;

    fireEvent.wheel(title, { deltaY: 100 });
    expect(title).toHaveTextContent(thisWeek ?? "");

    fireEvent.wheel(title, { deltaX: -100 });
    expect(title).not.toHaveTextContent(thisWeek ?? "");
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(title).toHaveTextContent(thisWeek ?? "");
  });
});

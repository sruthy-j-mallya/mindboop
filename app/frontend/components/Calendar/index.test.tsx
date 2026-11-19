import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { addDays, addMonths, format, startOfDay, startOfHour, subHours } from "date-fns";
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
  breadcrumbs: [],
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

const chooseView = async (view: string) => {
  await userEvent.click(screen.getByRole("combobox", { name: "Calendar view" }));
  await userEvent.click(screen.getByRole("option", { name: view }));
};

describe("Calendar", () => {
  afterEach(() => vi.restoreAllMocks());

  it("shows the visible range's tasks and time logs, each in its own style", async () => {
    const fetchList = vi
      .spyOn(calendarEventsApi, "fetchList")
      .mockResolvedValue({ tasks: [TASK], timeLogs: [TIME_LOG] });
    renderWithProviders(<Calendar />);
    await chooseView("Month");

    const task = await screen.findByTitle("Plan the week");
    expect(task.closest(".rbc-event")).toHaveClass("calendar-event-task");
    expect(screen.getByTitle("Answer emails").closest(".rbc-event")).toHaveClass("calendar-event-time-log");
    expect(fetchList).toHaveBeenLastCalledWith({ from: expect.any(String), to: expect.any(String) });
  });

  it("opens a task for editing when it's clicked", async () => {
    vi.spyOn(calendarEventsApi, "fetchList").mockResolvedValue({ tasks: [TASK], timeLogs: [] });
    renderWithProviders(<Calendar />);
    await chooseView("Month");

    await userEvent.click(await screen.findByTitle("Plan the week"));

    const dialog = await screen.findByRole("dialog", { name: "Edit task" });
    expect(within(dialog).getByRole("textbox", { name: "Title" })).toHaveValue("Plan the week");
  });

  it("switches between the views", async () => {
    vi.spyOn(calendarEventsApi, "fetchList").mockResolvedValue({ tasks: [], timeLogs: [] });
    renderWithProviders(<Calendar />);

    await chooseView("Year");

    expect(screen.getByRole("region", { name: /^January / })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Calendar view" })).toHaveTextContent("Year");
  });

  it("shows and pages the chosen number of days in the multi-day view", async () => {
    const fetchList = vi.spyOn(calendarEventsApi, "fetchList").mockResolvedValue({ tasks: [], timeLogs: [] });
    renderWithProviders(<Calendar />);
    expect(screen.queryByRole("combobox", { name: "Number of days" })).not.toBeInTheDocument();
    await chooseView("Multi-day");
    expect(screen.getAllByRole("columnheader")).toHaveLength(3);

    await userEvent.click(screen.getByRole("combobox", { name: "Number of days" }));
    await userEvent.click(screen.getByRole("option", { name: "5 days" }));

    expect(screen.getAllByRole("columnheader")).toHaveLength(5);
    const today = startOfDay(new Date());
    expect(fetchList).toHaveBeenLastCalledWith({
      from: today.toISOString(),
      to: addDays(today, 5).toISOString(),
    });

    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(fetchList).toHaveBeenLastCalledWith({
      from: addDays(today, 5).toISOString(),
      to: addDays(today, 10).toISOString(),
    });
  });

  it("pages through months when the month view is scrolled, one page per gesture", async () => {
    vi.spyOn(calendarEventsApi, "fetchList").mockResolvedValue({ tasks: [], timeLogs: [] });
    renderWithProviders(<Calendar />);
    await chooseView("Month");
    const grid = screen.getByRole("table");

    fireEvent.wheel(grid, { deltaY: 100 });
    // The rest of the same gesture (a trackpad's momentum) doesn't turn another page.
    fireEvent.wheel(grid, { deltaY: 100 });

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      format(addMonths(new Date(), 1), "MMMM yyyy"),
    );
  });

  it.each([
    ["up and down", { deltaY: 100 }, 1],
    ["sideways", { deltaX: -100 }, -1],
  ])("pages through years when the year view is scrolled %s", async (_, wheel, step) => {
    vi.spyOn(calendarEventsApi, "fetchList").mockResolvedValue({ tasks: [], timeLogs: [] });
    renderWithProviders(<Calendar />);
    await chooseView("Year");
    const thisYear = new Date().getFullYear();

    fireEvent.wheel(screen.getByRole("region", { name: `January ${thisYear}` }), wheel);

    expect(screen.getByRole("region", { name: `January ${thisYear + step}` })).toBeInTheDocument();
  });

  it("pages back a month when the month view is scrolled sideways", async () => {
    vi.spyOn(calendarEventsApi, "fetchList").mockResolvedValue({ tasks: [], timeLogs: [] });
    renderWithProviders(<Calendar />);
    await chooseView("Month");

    fireEvent.wheel(screen.getByRole("table"), { deltaX: -100 });

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      format(addMonths(new Date(), -1), "MMMM yyyy"),
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

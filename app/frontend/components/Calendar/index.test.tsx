import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { addDays, addMonths, format, startOfDay, startOfHour, startOfWeek, subHours } from "date-fns";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import calendarEventsApi from "@/apis/calendar_events";
import currentTimeLogsApi from "@/apis/current_time_logs";
import lifeAreasApi from "@/apis/life_areas";
import tasksApi from "@/apis/tasks";
import timeLogRestorationsApi from "@/apis/time_log_restorations";
import timeLogsApi from "@/apis/time_logs";
import type { LifeArea, Task, TimeLog, UserPreference } from "@/apis/types";
import userPreferencesApi from "@/apis/user_preferences";
import { Toaster } from "@/components/ui/sonner";
import { renderWithProviders } from "@/test/utils";

import Calendar from ".";

vi.mock("@/utils/completionSound");

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
  lifeAreaId: null,
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
  lifeAreaId: null,
  isTaskDeleted: false,
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

const PREFERENCE: UserPreference = {
  theme: "system",
  completionSound: "bell",
  breakAlarmSound: "classic",
  weekStartsOn: 1,
};

const chooseView = async (view: string) => {
  await userEvent.click(await screen.findByRole("combobox", { name: "Calendar view" }));
  await userEvent.click(screen.getByRole("option", { name: view }));
};

const LIFE_AREA: LifeArea = {
  id: "area-1",
  name: "Work",
  color: "teal",
  emoji: "💼",
  defaultSound: "none",
  isDeleted: false,
  createdAt: "2026-11-05T10:00:00.000Z",
  updatedAt: "2026-11-05T10:00:00.000Z",
};

describe("Calendar", () => {
  // Weeks start on the saved day, so the grid waits for the preference.
  beforeEach(() => {
    vi.spyOn(lifeAreasApi, "fetchList").mockResolvedValue({ lifeAreas: [LIFE_AREA] });
    vi.spyOn(userPreferencesApi, "show").mockResolvedValue({ userPreference: PREFERENCE });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    // Sonner keeps its toasts in module state and replays the active ones to each new Toaster.
    toast.dismiss();
  });

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

  it("starts the week on the day picked in Settings", async () => {
    vi.mocked(userPreferencesApi.show).mockResolvedValue({
      userPreference: { ...PREFERENCE, weekStartsOn: 0 },
    });
    const fetchList = vi.spyOn(calendarEventsApi, "fetchList").mockResolvedValue({ tasks: [], timeLogs: [] });
    renderWithProviders(<Calendar />);

    await waitFor(() =>
      expect(fetchList).toHaveBeenCalledWith({
        from: startOfWeek(new Date(), { weekStartsOn: 0 }).toISOString(),
        to: expect.any(String),
      }),
    );
    expect(fetchList).toHaveBeenCalledTimes(1);
    expect(document.querySelector(".rbc-time-header .rbc-header")).toHaveTextContent("Sun");
  });

  // A task opens in the Inbox pane's view, so the pane's own data is stubbed too.
  const openTask = async (task: Task = TASK) => {
    vi.spyOn(calendarEventsApi, "fetchList").mockResolvedValue({ tasks: [task], timeLogs: [] });
    vi.spyOn(tasksApi, "show").mockResolvedValue({ task });
    vi.spyOn(currentTimeLogsApi, "show").mockResolvedValue({ timeLog: null });
    renderWithProviders(<Calendar />);
    await chooseView("Month");
    await userEvent.click(await screen.findByTitle("Plan the week"));

    return screen.findByRole("dialog", { name: "Edit task" });
  };

  it("opens a task in the Inbox pane's view, with all its controls, when it's clicked", async () => {
    const dialog = await openTask();

    expect(within(dialog).getByRole("textbox", { name: "Task title" })).toHaveValue("Plan the week");
    expect(within(dialog).getByRole("checkbox", { name: "Mark as complete" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "30 min" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "More actions" })).toBeInTheDocument();
    expect(await within(dialog).findByRole("button", { name: "Start" })).toBeEnabled();
  });

  it("colours a task in an area of life with the area's colour", async () => {
    vi.spyOn(calendarEventsApi, "fetchList").mockResolvedValue({
      tasks: [{ ...TASK, lifeAreaId: LIFE_AREA.id }],
      timeLogs: [],
    });
    renderWithProviders(<Calendar />);
    await chooseView("Month");

    const event = (await screen.findByTitle("Plan the week")).closest<HTMLElement>(".rbc-event");
    await waitFor(() => expect(event).toHaveClass("calendar-event-area"));
    expect(event?.style.getPropertyValue("--area-color")).toBe("#0f766e");
  });

  it("moves a task to an area of life from its popover", async () => {
    const update = vi
      .spyOn(tasksApi, "update")
      .mockResolvedValue({ task: { ...TASK, lifeAreaId: LIFE_AREA.id } });
    const dialog = await openTask();

    await userEvent.click(within(dialog).getByRole("button", { name: "More actions" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Move to area" }));
    await userEvent.click(await screen.findByRole("button", { name: "Work" }));

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith({ id: "task-1", lifeAreaId: LIFE_AREA.id }, expect.anything()),
    );
  });

  it("hides an unset estimate until it's picked from the menu, and again when the picker is left", async () => {
    const dialog = await openTask({ ...TASK, estimatedMinutes: null });

    expect(within(dialog).queryByRole("button", { name: "Estimate" })).not.toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "More actions" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Add estimate" }));
    expect(await screen.findByLabelText("Hours")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByLabelText("Hours")).not.toBeInTheDocument());
    expect(screen.queryByRole("button", { name: "Estimate" })).not.toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Edit task" })).toBeInTheDocument();
  });

  it("closes the task's popover once the task is completed", async () => {
    const update = vi.spyOn(tasksApi, "update").mockResolvedValue({ task: { ...TASK, isCompleted: true } });
    const dialog = await openTask();

    await userEvent.click(within(dialog).getByRole("checkbox", { name: "Mark as complete" }));

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith({ id: "task-1", isCompleted: true }, expect.anything()),
    );
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Edit task" })).not.toBeInTheDocument());
  });

  it("shows a time log's task read only when the log is clicked", async () => {
    const task: Task = {
      ...TASK,
      isCompleted: true,
      checklistItems: [{ id: "step-1", title: "List the meetings", isCompleted: true }],
    };
    vi.spyOn(calendarEventsApi, "fetchList").mockResolvedValue({
      tasks: [],
      timeLogs: [{ ...TIME_LOG, taskId: "task-1" }],
    });
    const show = vi.spyOn(tasksApi, "show").mockResolvedValue({ task });
    renderWithProviders(<Calendar />);
    await chooseView("Month");
    await userEvent.click(await screen.findByTitle("Answer emails"));

    const dialog = await screen.findByRole("dialog", { name: "Logged time" });
    expect(await within(dialog).findByRole("heading", { name: "Plan the week" })).toBeInTheDocument();
    expect(show).toHaveBeenCalledWith("task-1");
    expect(within(dialog).getByRole("checkbox", { name: "Completed" })).toBeChecked();
    expect(within(dialog).getByRole("checkbox", { name: "Completed" })).toBeDisabled();
    expect(within(dialog).getByRole("checkbox", { name: "List the meetings" })).toBeDisabled();
    expect(within(dialog).getByText("30 min")).toBeInTheDocument();
    expect(within(dialog).queryByRole("textbox")).not.toBeInTheDocument();
    expect(within(dialog).getAllByRole("button")).toHaveLength(1);
    expect(within(dialog).getByRole("button", { name: "Delete time log" })).toBeInTheDocument();
  });

  it("shows the title of a time log without a task", async () => {
    vi.spyOn(calendarEventsApi, "fetchList").mockResolvedValue({ tasks: [], timeLogs: [TIME_LOG] });
    const show = vi.spyOn(tasksApi, "show");
    renderWithProviders(<Calendar />);
    await chooseView("Month");
    await userEvent.click(await screen.findByTitle("Answer emails"));

    const dialog = await screen.findByRole("dialog", { name: "Logged time" });
    expect(within(dialog).getByRole("heading", { name: "Answer emails" })).toBeInTheDocument();
    expect(show).not.toHaveBeenCalled();
  });

  it("shows the title of a time log whose task was deleted, without fetching the task", async () => {
    vi.spyOn(calendarEventsApi, "fetchList").mockResolvedValue({
      tasks: [],
      timeLogs: [
        { ...TIME_LOG, title: null, taskId: "task-1", taskTitle: "Plan the week", isTaskDeleted: true },
      ],
    });
    const show = vi.spyOn(tasksApi, "show");
    renderWithProviders(<Calendar />);
    await chooseView("Month");
    await userEvent.click(await screen.findByTitle("Plan the week"));

    const dialog = await screen.findByRole("dialog", { name: "Logged time" });
    expect(within(dialog).getByRole("heading", { name: "Plan the week" })).toBeInTheDocument();
    expect(show).not.toHaveBeenCalled();
  });

  it("deletes a time log and offers to undo it", async () => {
    vi.spyOn(calendarEventsApi, "fetchList").mockResolvedValue({ tasks: [], timeLogs: [TIME_LOG] });
    const destroy = vi.spyOn(timeLogsApi, "destroy").mockResolvedValue(undefined as never);
    const restore = vi.spyOn(timeLogRestorationsApi, "create").mockResolvedValue({ timeLog: TIME_LOG });
    renderWithProviders(
      <>
        <Calendar />
        <Toaster />
      </>,
    );
    await chooseView("Month");
    await userEvent.click(await screen.findByTitle("Answer emails"));
    const dialog = await screen.findByRole("dialog", { name: "Logged time" });

    await userEvent.click(within(dialog).getByRole("button", { name: "Delete time log" }));

    expect(destroy).toHaveBeenCalledWith("log-1", expect.anything());
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Logged time" })).not.toBeInTheDocument(),
    );
    expect(await screen.findByText("Deleted “Answer emails”")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Undo" }));

    await waitFor(() => expect(restore).toHaveBeenCalledWith("log-1", expect.anything()));
  });

  it("offers no delete for a session that is still running", async () => {
    vi.spyOn(calendarEventsApi, "fetchList").mockResolvedValue({
      tasks: [],
      timeLogs: [{ ...TIME_LOG, isRunning: true, completedAt: null }],
    });
    renderWithProviders(<Calendar />);
    await chooseView("Month");
    await userEvent.click(await screen.findByTitle("Answer emails"));

    const dialog = await screen.findByRole("dialog", { name: "Logged time" });
    expect(within(dialog).queryByRole("button", { name: "Delete time log" })).not.toBeInTheDocument();
  });

  it("closes the task's popover once the task is deleted", async () => {
    const destroy = vi.spyOn(tasksApi, "destroy").mockResolvedValue(undefined as never);
    const dialog = await openTask();

    await userEvent.click(within(dialog).getByRole("button", { name: "More actions" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Delete task" }));
    const confirmation = await screen.findByRole("dialog", { name: "Delete this task?" });
    await userEvent.click(within(confirmation).getByRole("button", { name: "Delete task" }));

    await waitFor(() => expect(destroy).toHaveBeenCalledWith("task-1", expect.anything()));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Edit task" })).not.toBeInTheDocument());
  });

  it("switches between the views", async () => {
    vi.spyOn(calendarEventsApi, "fetchList").mockResolvedValue({ tasks: [], timeLogs: [] });
    renderWithProviders(<Calendar />);

    await chooseView("Year");

    expect(screen.getByRole("region", { name: `January ${new Date().getFullYear()}` })).toBeInTheDocument();
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

  it("opens in the view and day count last picked after a reload", async () => {
    vi.spyOn(calendarEventsApi, "fetchList").mockResolvedValue({ tasks: [], timeLogs: [] });
    const { unmount } = renderWithProviders(<Calendar />);
    await chooseView("Multi-day");
    await userEvent.click(screen.getByRole("combobox", { name: "Number of days" }));
    await userEvent.click(screen.getByRole("option", { name: "4 days" }));
    unmount();

    renderWithProviders(<Calendar />);

    expect(await screen.findByRole("combobox", { name: "Calendar view" })).toHaveTextContent("Multi-day");
    expect(screen.getAllByRole("columnheader")).toHaveLength(4);
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

  it("pages back a year when the year view is scrolled sideways", async () => {
    vi.spyOn(calendarEventsApi, "fetchList").mockResolvedValue({ tasks: [], timeLogs: [] });
    renderWithProviders(<Calendar />);
    await chooseView("Year");
    const thisYear = new Date().getFullYear();

    fireEvent.wheel(screen.getByRole("region", { name: `January ${thisYear}` }), { deltaX: -100 });

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(String(thisYear - 1));
  });

  it("scrolls on into the next year, which the title follows", async () => {
    vi.spyOn(calendarEventsApi, "fetchList").mockResolvedValue({ tasks: [], timeLogs: [] });
    renderWithProviders(<Calendar />);
    await chooseView("Year");
    const nextYear = new Date().getFullYear() + 1;
    // Every month before next January has scrolled up past the top.
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
      const month = this.getAttribute("data-month");
      const bottom = month && month < `${nextYear}-01` ? -10 : 100;

      return { top: 0, bottom } as DOMRect;
    });

    fireEvent.scroll(
      screen.getByRole("region", { name: `January ${nextYear}` }).closest(".overflow-y-auto")!,
    );

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(String(nextYear));
    expect(screen.getByRole("region", { name: `December ${nextYear + 1}` })).toBeInTheDocument();
  });

  it("brings this month into view when the year view goes to Today", async () => {
    vi.spyOn(calendarEventsApi, "fetchList").mockResolvedValue({ tasks: [], timeLogs: [] });
    renderWithProviders(<Calendar />);
    await chooseView("Year");
    const thisMonth = screen.getByRole("region", { name: format(new Date(), "MMMM yyyy") });
    const scrollIntoView = vi.spyOn(thisMonth, "scrollIntoView");

    await userEvent.click(screen.getByRole("button", { name: "Today" }));

    expect(scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });
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
    const title = await screen.findByRole("heading", { level: 2 });
    const thisWeek = title.textContent;

    fireEvent.wheel(title, { deltaY: 100 });
    expect(title).toHaveTextContent(thisWeek ?? "");

    fireEvent.wheel(title, { deltaX: -100 });
    expect(title).not.toHaveTextContent(thisWeek ?? "");
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(title).toHaveTextContent(thisWeek ?? "");
  });
});

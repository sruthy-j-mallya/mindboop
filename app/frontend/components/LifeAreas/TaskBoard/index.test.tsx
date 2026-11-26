import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { addDays, format, set, startOfDay } from "date-fns";
import { generatePath, Route, Routes, useLocation } from "react-router";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/apis/axios";
import currentTimeLogsApi from "@/apis/current_time_logs";
import lifeAreasApi from "@/apis/life_areas";
import taskCountsApi from "@/apis/task_counts";
import taskRestorationsApi from "@/apis/task_restorations";
import tasksApi from "@/apis/tasks";
import timeLogBailOutsApi from "@/apis/time_log_bail_outs";
import timeLogCompletionsApi from "@/apis/time_log_completions";
import timeLogsApi from "@/apis/time_logs";
import type { Task, TimeLog } from "@/apis/types";
import userPreferencesApi from "@/apis/user_preferences";
import LifeAreas from "@/components/LifeAreas";
import TaskBoard from "@/components/LifeAreas/TaskBoard";
import NoTaskSelected from "@/components/LifeAreas/TaskBoard/NoTaskSelected";
import TaskPane from "@/components/LifeAreas/TaskBoard/TaskPane";
import { Toaster } from "@/components/ui/sonner";
import { PHONE_LAYOUT_QUERY } from "@/constants";
import routes from "@/routes";
import { renderWithProviders } from "@/test/utils";
import { playCompletionSound } from "@/utils/completionSound";

vi.mock("@/utils/completionSound");

const buildTask = (overrides: Partial<Task> = {}): Task => ({
  id: crypto.randomUUID(),
  title: "Write the report",
  description: null,
  estimatedMinutes: null,
  isDuration: false,
  isAllDay: false,
  isCompleted: false,
  startsAt: null,
  endsAt: null,
  lifeAreaId: null,
  createdAt: "2026-11-05T10:00:00.000Z",
  updatedAt: "2026-11-05T10:00:00.000Z",
  checklistItems: [],
  breadcrumbs: [],
  ...overrides,
});

const buildTimeLog = (overrides: Partial<TimeLog> = {}): TimeLog => {
  // Running for 5 minutes, long enough to log.
  const startedAt = new Date(Date.now() - 5 * 60_000).toISOString();

  return {
    id: crypto.randomUUID(),
    taskId: crypto.randomUUID(),
    title: null,
    taskTitle: null,
    routineId: null,
    routineTitle: null,
    lifeAreaId: null,
    isTaskDeleted: false,
    mode: "timer",
    timerPreset: 25,
    bufferMinutes: 0,
    accumulatedElapsedSeconds: 0,
    isRunning: true,
    currentRunStartedAt: startedAt,
    startedAt,
    completedAt: null,
    isFinishedEarly: false,
    currentBreak: null,
    breaks: [],
    createdAt: startedAt,
    updatedAt: startedAt,
    ...overrides,
  };
};

// Stands in for the Timer page, showing the task the Inbox sent it.
const TimerPage = () => {
  const state = useLocation().state as { taskId?: string } | null;

  return <h1>Timer for {state?.taskId ?? "nothing"}</h1>;
};

const listOf = (tasks: Task[]) => ({ tasks, tasksCount: tasks.length, page: 1, totalPages: 1 });

const renderInbox = (initialPath: string = routes.inbox.index) =>
  renderWithProviders(
    <>
      <Routes>
        <Route element={<LifeAreas />}>
          <Route element={<TaskBoard />} path={routes.inbox.index}>
            <Route index element={<NoTaskSelected />} />
            <Route element={<TaskPane />} path={routes.inbox.show} />
          </Route>
          <Route element={<TaskBoard />} path={routes.lifeAreas.show}>
            <Route index element={<NoTaskSelected />} />
            <Route element={<TaskPane />} path={routes.lifeAreas.task} />
          </Route>
        </Route>
        <Route element={<TimerPage />} path={routes.timer} />
      </Routes>
      <Toaster />
    </>,
    undefined,
    initialPath,
  );

describe("Inbox", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    vi.spyOn(userPreferencesApi, "show").mockResolvedValue({
      userPreference: {
        theme: "system",
        completionSound: "bell",
        breakAlarmSound: "classic",
        weekStartsOn: 1,
        timeFormat: "12h",
      },
    });
    // Sonner keeps its toasts in module state and replays the active ones to each new Toaster.
    toast.dismiss();
    vi.spyOn(currentTimeLogsApi, "show").mockResolvedValue({ timeLog: null });
    vi.spyOn(taskCountsApi, "fetchList").mockResolvedValue({ taskCounts: [] });
    vi.spyOn(lifeAreasApi, "fetchList").mockResolvedValue({ lifeAreas: [] });
  });

  it("lists only incomplete tasks", async () => {
    const fetchList = vi
      .spyOn(tasksApi, "fetchList")
      .mockResolvedValue(listOf([buildTask({ title: "First" }), buildTask({ title: "Second" })]));

    renderInbox();

    expect(await screen.findByRole("textbox", { name: "First" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Second" })).toBeInTheDocument();
    expect(fetchList).toHaveBeenCalledWith({ isCompleted: false, isInInbox: true, page: 1 });
  });

  it("leads from the empty pane to adding a task", async () => {
    vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([]));
    renderInbox();

    await userEvent.click(await screen.findByRole("button", { name: "Or add a new one" }));

    expect(screen.getByRole("textbox", { name: "New task" })).toHaveFocus();
  });

  it("shows the date under the title on phones", async () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query) =>
        ({
          matches: query === PHONE_LAYOUT_QUERY,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }) as unknown as MediaQueryList,
    );
    const task = buildTask({
      title: "Pay rent",
      isAllDay: true,
      startsAt: startOfDay(new Date()).toISOString(),
    });
    vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([task]));

    renderInbox();

    expect(await screen.findByText("Today")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Due date of/ })).not.toBeInTheDocument();
  });

  it("says so when there are no tasks", async () => {
    vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([]));

    renderInbox();

    expect(await screen.findByText("Your Inbox is empty")).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Tasks" })).not.toBeInTheDocument();
  });

  it("adds a task and clears the input", async () => {
    const task = buildTask({ title: "Call the bank" });
    vi.spyOn(tasksApi, "fetchList")
      .mockResolvedValueOnce(listOf([]))
      .mockResolvedValue(listOf([task]));
    const create = vi.spyOn(tasksApi, "create").mockResolvedValue({ task });
    renderInbox();
    const input = await screen.findByRole("textbox", { name: "New task" });

    await userEvent.type(input, "  Call the bank {Enter}");

    await waitFor(() =>
      expect(create).toHaveBeenCalledWith({ title: "Call the bank", lifeAreaId: null }, expect.anything()),
    );
    expect(await screen.findByRole("textbox", { name: "Call the bank" })).toBeInTheDocument();
    expect(input).toHaveValue("");
  });

  it("puts the title back when adding it fails", async () => {
    vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([]));
    vi.spyOn(tasksApi, "create").mockRejectedValue(new ApiError(422, "Title is too long"));
    renderInbox();
    const input = await screen.findByRole("textbox", { name: "New task" });

    await userEvent.type(input, "Call the bank{Enter}");

    expect(await screen.findByRole("alert")).toHaveTextContent("Title is too long");
    expect(input).toHaveValue("Call the bank");
  });

  it("asks for a title before adding a task", async () => {
    vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([]));
    const create = vi.spyOn(tasksApi, "create");
    renderInbox();

    await userEvent.click(await screen.findByRole("button", { name: "Add task" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Say what you want to get done");
    expect(create).not.toHaveBeenCalled();
  });

  it("hides the missing title error when the input loses focus", async () => {
    vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([]));
    renderInbox();
    const input = await screen.findByRole("textbox", { name: "New task" });

    await userEvent.type(input, "{Enter}");
    expect(await screen.findByRole("alert")).toHaveTextContent("Say what you want to get done");

    await userEvent.tab();

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows the picked task in the pane", async () => {
    const task = buildTask({
      title: "Plan the trip",
      checklistItems: [{ id: crypto.randomUUID(), title: "Book flights", isCompleted: false }],
    });
    vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([task]));
    const show = vi.spyOn(tasksApi, "show").mockResolvedValue({ task });
    renderInbox();

    expect(screen.getByText("Pick a task to see its steps and description.")).toBeInTheDocument();
    await userEvent.click(await screen.findByRole("textbox", { name: /Plan the trip/ }));

    expect(await screen.findByRole("heading", { name: "Plan the trip" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /Plan the trip/ })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("list", { name: "Steps" })).toHaveTextContent("Book flights");
    expect(show).toHaveBeenCalledWith(task.id);
  });

  it("shows the task's breadcrumbs in the pane, newest first", async () => {
    const task = buildTask({
      breadcrumbs: [
        {
          id: crypto.randomUUID(),
          completedDescription: null,
          restartDescription: "Book the hotel",
          createdAt: "2026-11-06T10:00:00.000Z",
        },
        {
          id: crypto.randomUUID(),
          completedDescription: "Compared flights",
          restartDescription: "Book flights",
          createdAt: "2026-11-05T10:00:00.000Z",
        },
      ],
    });
    vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([task]));
    vi.spyOn(tasksApi, "show").mockResolvedValue({ task });
    renderInbox(generatePath(routes.inbox.show, { taskId: task.id }));

    const breadcrumbs = await screen.findByRole("region", { name: "Breadcrumbs" });
    const items = within(breadcrumbs).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Book the hotel");
    expect(items[0]).not.toHaveTextContent("Got done");
    expect(items[1]).toHaveTextContent("Book flights");
    expect(items[1]).toHaveTextContent("Compared flights");
  });

  it("leaves out the breadcrumbs when the task has none", async () => {
    const task = buildTask();
    vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([task]));
    vi.spyOn(tasksApi, "show").mockResolvedValue({ task });
    renderInbox(generatePath(routes.inbox.show, { taskId: task.id }));

    expect(await screen.findByRole("heading", { name: task.title })).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Breadcrumbs" })).not.toBeInTheDocument();
  });

  it("completes the open task from its pane", async () => {
    const task = buildTask({ title: "Book a dentist" });
    vi.spyOn(tasksApi, "fetchList")
      .mockResolvedValueOnce(listOf([task]))
      .mockResolvedValue(listOf([]));
    vi.spyOn(tasksApi, "show").mockResolvedValue({ task });
    const update = vi.spyOn(tasksApi, "update").mockResolvedValue({ task: { ...task, isCompleted: true } });
    renderInbox(generatePath(routes.inbox.show, { taskId: task.id }));

    expect(await screen.findByRole("heading", { name: "Book a dentist" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("checkbox", { name: "Mark as complete" }));

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith({ id: task.id, isCompleted: true }, expect.anything()),
    );
    expect(await screen.findByText("Your Inbox is empty")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Book a dentist" })).not.toBeInTheDocument();
  });

  it("completes a task and closes its pane", async () => {
    const task = buildTask({ title: "Pay rent" });
    vi.spyOn(tasksApi, "fetchList")
      .mockResolvedValueOnce(listOf([task]))
      .mockResolvedValue(listOf([]));
    vi.spyOn(tasksApi, "show").mockResolvedValue({ task });
    const update = vi.spyOn(tasksApi, "update").mockResolvedValue({ task: { ...task, isCompleted: true } });
    renderInbox(generatePath(routes.inbox.show, { taskId: task.id }));

    expect(await screen.findByRole("heading", { name: "Pay rent" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("checkbox", { name: "Complete Pay rent" }));

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith({ id: task.id, isCompleted: true }, expect.anything()),
    );
    expect(await screen.findByText("Your Inbox is empty")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Pay rent" })).not.toBeInTheDocument();
    expect(playCompletionSound).toHaveBeenCalledExactlyOnceWith("bell");
  });

  it("undoes completing a task from the toast", async () => {
    const task = buildTask({ title: "Pay rent" });
    vi.spyOn(tasksApi, "fetchList")
      .mockResolvedValueOnce(listOf([task]))
      .mockResolvedValueOnce(listOf([]))
      .mockResolvedValue(listOf([task]));
    const update = vi
      .spyOn(tasksApi, "update")
      .mockImplementation(({ isCompleted = false }) => Promise.resolve({ task: { ...task, isCompleted } }));
    renderInbox();

    await userEvent.click(await screen.findByRole("checkbox", { name: "Complete Pay rent" }));
    expect(await screen.findByText("Completed “Pay rent”")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Undo" }));

    expect(await screen.findByRole("checkbox", { name: "Complete Pay rent" })).not.toBeChecked();
    expect(update.mock.lastCall?.[0]).toEqual({ id: task.id, isCompleted: false });
  });

  it("deletes the open task after confirming and closes its pane", async () => {
    const task = buildTask({ title: "Cancel the gym" });
    vi.spyOn(tasksApi, "fetchList")
      .mockResolvedValueOnce(listOf([task]))
      .mockResolvedValue(listOf([]));
    vi.spyOn(tasksApi, "show").mockResolvedValue({ task });
    const destroy = vi.spyOn(tasksApi, "destroy").mockResolvedValue(undefined as never);
    renderInbox(generatePath(routes.inbox.show, { taskId: task.id }));

    expect(await screen.findByRole("heading", { name: "Cancel the gym" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "More actions" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Delete task" }));
    const dialog = await screen.findByRole("dialog", { name: "Delete this task?" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Delete task" }));

    await waitFor(() => expect(destroy).toHaveBeenCalledWith(task.id, expect.anything()));
    expect(await screen.findByText("Your Inbox is empty")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Cancel the gym" })).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("Deleted “Cancel the gym”")).toBeInTheDocument();
  });

  it("deletes a task from its row and undoes it from the toast", async () => {
    const task = buildTask({ title: "Cancel the gym" });
    const other = buildTask({ title: "Sort the mail" });
    vi.spyOn(tasksApi, "fetchList")
      .mockResolvedValueOnce(listOf([task, other]))
      .mockResolvedValueOnce(listOf([other]))
      .mockResolvedValue(listOf([task, other]));
    const destroy = vi.spyOn(tasksApi, "destroy").mockResolvedValue(undefined as never);
    const restore = vi.spyOn(taskRestorationsApi, "create").mockResolvedValue({ task });
    renderInbox();

    await userEvent.click(await screen.findByRole("button", { name: "Delete Cancel the gym" }));

    await waitFor(() => expect(destroy).toHaveBeenCalledWith(task.id, expect.anything()));
    expect(await screen.findByText("Deleted “Cancel the gym”")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole("textbox", { name: "Cancel the gym" })).not.toBeInTheDocument(),
    );

    await userEvent.click(screen.getByRole("button", { name: "Undo" }));

    await waitFor(() => expect(restore).toHaveBeenCalledWith(task.id, expect.anything()));
    expect(await screen.findByRole("textbox", { name: "Cancel the gym" })).toBeInTheDocument();
  });

  it("shows the error when undoing a delete fails", async () => {
    const task = buildTask({ title: "Cancel the gym" });
    vi.spyOn(tasksApi, "fetchList")
      .mockResolvedValueOnce(listOf([task]))
      .mockResolvedValue(listOf([]));
    vi.spyOn(tasksApi, "destroy").mockResolvedValue(undefined as never);
    vi.spyOn(taskRestorationsApi, "create").mockRejectedValue(new ApiError(404, "Record not found."));
    renderInbox();

    await userEvent.click(await screen.findByRole("button", { name: "Delete Cancel the gym" }));
    await userEvent.click(await screen.findByRole("button", { name: "Undo" }));

    expect(await screen.findByText("Record not found.")).toBeInTheDocument();
    expect(screen.getByText("Your Inbox is empty")).toBeInTheDocument();
  });

  it("shows the error when deleting from a row fails", async () => {
    const task = buildTask({ title: "Cancel the gym" });
    vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([task]));
    vi.spyOn(tasksApi, "destroy").mockRejectedValue(new ApiError(403, "Not allowed"));
    renderInbox();

    await userEvent.click(await screen.findByRole("button", { name: "Delete Cancel the gym" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Not allowed");
    expect(screen.getByRole("textbox", { name: "Cancel the gym" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Undo" })).not.toBeInTheDocument();
  });

  it("starts the first step from the pane's menu, with the new row focused", async () => {
    const task = buildTask({ title: "Plan the trip" });
    vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([task]));
    vi.spyOn(tasksApi, "show").mockResolvedValue({ task });
    renderInbox(generatePath(routes.inbox.show, { taskId: task.id }));

    await userEvent.click(await screen.findByRole("button", { name: "More actions" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Add step" }));

    await waitFor(() => expect(screen.getByRole("textbox", { name: "New step" })).toHaveFocus());
  });

  it("leaves adding a step out of the pane's menu once the task has steps", async () => {
    const task = buildTask({
      title: "Plan the trip",
      checklistItems: [{ id: crypto.randomUUID(), title: "Book flights", isCompleted: false }],
    });
    vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([task]));
    vi.spyOn(tasksApi, "show").mockResolvedValue({ task });
    renderInbox(generatePath(routes.inbox.show, { taskId: task.id }));

    await userEvent.click(await screen.findByRole("button", { name: "More actions" }));

    expect(screen.getByRole("menuitem", { name: "Delete task" })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Add step" })).not.toBeInTheDocument();
  });

  it("keeps the task when deleting is cancelled", async () => {
    const task = buildTask({ title: "Cancel the gym" });
    vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([task]));
    vi.spyOn(tasksApi, "show").mockResolvedValue({ task });
    const destroy = vi.spyOn(tasksApi, "destroy");
    renderInbox(generatePath(routes.inbox.show, { taskId: task.id }));

    await userEvent.click(await screen.findByRole("button", { name: "More actions" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Delete task" }));
    await userEvent.click(await screen.findByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Cancel the gym" })).toBeInTheDocument();
    expect(destroy).not.toHaveBeenCalled();
  });

  it("shows the error when deleting fails", async () => {
    const task = buildTask({ title: "Cancel the gym" });
    vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([task]));
    vi.spyOn(tasksApi, "show").mockResolvedValue({ task });
    vi.spyOn(tasksApi, "destroy").mockRejectedValue(new ApiError(403, "Not allowed"));
    renderInbox(generatePath(routes.inbox.show, { taskId: task.id }));

    await userEvent.click(await screen.findByRole("button", { name: "More actions" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Delete task" }));
    const dialog = await screen.findByRole("dialog", { name: "Delete this task?" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Delete task" }));

    expect(await within(dialog).findByRole("alert")).toHaveTextContent("Not allowed");
    // The open dialog hides the pane from the accessibility tree.
    expect(screen.getByRole("heading", { name: "Cancel the gym", hidden: true })).toBeInTheDocument();
  });

  it("keeps a detail that couldn't be saved on show, with its error", async () => {
    const task = buildTask({ title: "Plan the week" });
    vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([task]));
    vi.spyOn(tasksApi, "show").mockResolvedValue({ task });
    vi.spyOn(tasksApi, "update").mockRejectedValue(new ApiError(422, "Not allowed"));
    renderInbox(generatePath(routes.inbox.show, { taskId: task.id }));

    await userEvent.click(await screen.findByRole("button", { name: "Estimate" }));
    await userEvent.type(screen.getByLabelText("Minutes"), "30");
    await userEvent.click(screen.getByRole("button", { name: "OK" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Not allowed");
    expect(screen.getByRole("button", { name: "Estimate" })).toBeInTheDocument();
  });

  it("shows a set detail, and offers the rest beside it", async () => {
    const task = buildTask({ title: "Plan the week", estimatedMinutes: 30 });
    vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([task]));
    vi.spyOn(tasksApi, "show").mockResolvedValue({ task });
    renderInbox(generatePath(routes.inbox.show, { taskId: task.id }));

    expect(await screen.findByRole("button", { name: "30 min" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Due date" })).toBeInTheDocument();
  });

  describe("when deleting the task on the clock", () => {
    const task = buildTask({ title: "Cancel the gym" });

    const openDialog = async (timeLog: TimeLog) => {
      vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([task]));
      vi.spyOn(tasksApi, "show").mockResolvedValue({ task });
      vi.spyOn(currentTimeLogsApi, "show").mockResolvedValue({ timeLog });
      const destroyTask = vi.spyOn(tasksApi, "destroy").mockResolvedValue(undefined as never);
      const destroyTimeLog = vi.spyOn(timeLogsApi, "destroy").mockResolvedValue(undefined as never);
      renderInbox(generatePath(routes.inbox.show, { taskId: task.id }));

      await screen.findByRole("button", { name: "On the clock" });
      await userEvent.click(screen.getByRole("button", { name: "More actions" }));
      await userEvent.click(screen.getByRole("menuitem", { name: "Delete task" }));
      const dialog = await screen.findByRole("dialog", { name: "Delete this task?" });

      return { dialog, destroyTask, destroyTimeLog };
    };

    it("records the time so far", async () => {
      const { dialog, destroyTask, destroyTimeLog } = await openDialog(buildTimeLog({ taskId: task.id }));

      await userEvent.click(within(dialog).getByRole("button", { name: "Record time and delete" }));

      await waitFor(() => expect(destroyTask).toHaveBeenCalledWith(task.id, expect.anything()));
      expect(destroyTimeLog).not.toHaveBeenCalled();
    });

    it("discards the time so far, then deletes the task", async () => {
      const timeLog = buildTimeLog({ taskId: task.id });
      const { dialog, destroyTask, destroyTimeLog } = await openDialog(timeLog);

      await userEvent.click(within(dialog).getByRole("button", { name: "Discard time and delete" }));

      await waitFor(() => expect(destroyTask).toHaveBeenCalledWith(task.id, expect.anything()));
      expect(destroyTimeLog).toHaveBeenCalledWith(timeLog.id, expect.anything());
    });

    it("keeps the task when discarding the time fails", async () => {
      const { dialog, destroyTask, destroyTimeLog } = await openDialog(buildTimeLog({ taskId: task.id }));
      destroyTimeLog.mockRejectedValue(new ApiError(500, "Something went wrong"));

      await userEvent.click(within(dialog).getByRole("button", { name: "Discard time and delete" }));

      expect(await within(dialog).findByRole("alert")).toHaveTextContent("Something went wrong");
      expect(destroyTask).not.toHaveBeenCalled();
    });

    it("only deletes the task when trying again after its delete failed", async () => {
      const { dialog, destroyTask, destroyTimeLog } = await openDialog(buildTimeLog({ taskId: task.id }));
      destroyTask.mockRejectedValueOnce(new ApiError(500, "Something went wrong"));

      await userEvent.click(within(dialog).getByRole("button", { name: "Discard time and delete" }));
      expect(await within(dialog).findByRole("alert")).toBeInTheDocument();
      expect(
        within(dialog).queryByRole("button", { name: "Record time and delete" }),
      ).not.toBeInTheDocument();
      await userEvent.click(within(dialog).getByRole("button", { name: "Discard time and delete" }));

      await waitFor(() => expect(destroyTask).toHaveBeenCalledTimes(2));
      expect(destroyTimeLog).toHaveBeenCalledTimes(1);
    });

    it("only offers to discard a session too short to log", async () => {
      const now = new Date().toISOString();
      const { dialog } = await openDialog(
        buildTimeLog({ taskId: task.id, startedAt: now, currentRunStartedAt: now }),
      );

      expect(within(dialog).getByRole("button", { name: "Discard time and delete" })).toBeInTheDocument();
      expect(
        within(dialog).queryByRole("button", { name: "Record time and delete" }),
      ).not.toBeInTheDocument();
    });

    it("asks from the task's row too", async () => {
      const { dialog, destroyTask } = await openDialog(buildTimeLog({ taskId: task.id }));
      await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));

      await userEvent.click(await screen.findByRole("button", { name: "Delete Cancel the gym" }));

      expect(await screen.findByRole("button", { name: "Record time and delete" })).toBeInTheDocument();
      expect(destroyTask).not.toHaveBeenCalled();
    });
  });

  it("renames a task in its row", async () => {
    const task = buildTask({ title: "Cancel the gym" });
    const renamed = { ...task, title: "Cancel the gym membership" };
    vi.spyOn(tasksApi, "fetchList")
      .mockResolvedValueOnce(listOf([task]))
      .mockResolvedValue(listOf([renamed]));
    vi.spyOn(tasksApi, "show").mockResolvedValue({ task });
    const update = vi.spyOn(tasksApi, "update").mockResolvedValue({ task: renamed });
    renderInbox();

    const input = await screen.findByRole("textbox", { name: "Cancel the gym" });
    await userEvent.clear(input);
    await userEvent.type(input, "  Cancel the gym membership {Enter}");

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith(
        { id: task.id, title: "Cancel the gym membership" },
        expect.anything(),
      ),
    );
    expect(await screen.findByRole("textbox", { name: "Cancel the gym membership" })).toHaveValue(
      "Cancel the gym membership",
    );
    expect(await screen.findByRole("heading", { name: "Cancel the gym membership" })).toBeInTheDocument();
  });

  it("opens the task when its title is focused", async () => {
    const task = buildTask({ title: "Cancel the gym" });
    vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([task]));
    vi.spyOn(tasksApi, "show").mockResolvedValue({ task });
    renderInbox();

    await userEvent.click(await screen.findByRole("textbox", { name: "Cancel the gym" }));

    expect(await screen.findByRole("heading", { name: "Cancel the gym" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Cancel the gym" })).toHaveFocus();
  });

  it("keeps the old title when renaming is cancelled, left blank or unchanged", async () => {
    const task = buildTask({ title: "Cancel the gym" });
    vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([task]));
    vi.spyOn(tasksApi, "show").mockResolvedValue({ task });
    const update = vi.spyOn(tasksApi, "update");
    renderInbox();

    const input = await screen.findByRole("textbox", { name: "Cancel the gym" });
    await userEvent.type(input, " and the pool{Escape}");
    expect(input).toHaveValue("Cancel the gym");

    await userEvent.clear(input);
    await userEvent.keyboard("{Enter}");
    expect(input).toHaveValue("Cancel the gym");

    await userEvent.type(input, " {Backspace}");
    await userEvent.tab();

    expect(input).toHaveValue("Cancel the gym");
    expect(update).not.toHaveBeenCalled();
  });

  it("shows the error when renaming from a row fails", async () => {
    const task = buildTask({ title: "Cancel the gym" });
    vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([task]));
    vi.spyOn(tasksApi, "show").mockResolvedValue({ task });
    vi.spyOn(tasksApi, "update").mockRejectedValue(new ApiError(422, "Title is too long"));
    renderInbox();

    await userEvent.type(
      await screen.findByRole("textbox", { name: "Cancel the gym" }),
      " and the pool{Enter}",
    );

    expect(await screen.findByRole("alert")).toHaveTextContent("Title is too long");
    expect(screen.getByRole("textbox", { name: "Cancel the gym" })).toHaveValue("Cancel the gym");
  });

  it("renames a task from its pane", async () => {
    const task = buildTask({ title: "Cancel the gym" });
    const renamed = { ...task, title: "Cancel the gym membership" };
    vi.spyOn(tasksApi, "fetchList")
      .mockResolvedValueOnce(listOf([task]))
      .mockResolvedValue(listOf([renamed]));
    vi.spyOn(tasksApi, "show").mockResolvedValue({ task });
    const update = vi.spyOn(tasksApi, "update").mockResolvedValue({ task: renamed });
    renderInbox(generatePath(routes.inbox.show, { taskId: task.id }));

    const input = await screen.findByRole("textbox", { name: "Task title" });
    expect(input).toHaveValue("Cancel the gym");
    await userEvent.clear(input);
    await userEvent.type(input, "  Cancel the gym membership {Enter}");

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith(
        { id: task.id, title: "Cancel the gym membership" },
        expect.anything(),
      ),
    );
    expect(await screen.findByRole("heading", { name: "Cancel the gym membership" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Task title" })).toHaveValue("Cancel the gym membership");
    expect(await screen.findByRole("textbox", { name: "Cancel the gym membership" })).toBeInTheDocument();
  });

  it("keeps the old title when renaming from the pane is cancelled, left blank or unchanged", async () => {
    const task = buildTask({ title: "Cancel the gym" });
    vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([task]));
    vi.spyOn(tasksApi, "show").mockResolvedValue({ task });
    const update = vi.spyOn(tasksApi, "update");
    renderInbox(generatePath(routes.inbox.show, { taskId: task.id }));

    const input = await screen.findByRole("textbox", { name: "Task title" });
    await userEvent.type(input, " and the pool{Escape}");
    expect(input).toHaveValue("Cancel the gym");

    await userEvent.clear(input);
    await userEvent.keyboard("{Enter}");
    expect(input).toHaveValue("Cancel the gym");

    await userEvent.type(input, " {Backspace}");
    await userEvent.tab();

    expect(input).toHaveValue("Cancel the gym");
    expect(update).not.toHaveBeenCalled();
  });

  it("shows the error when renaming from the pane fails", async () => {
    const task = buildTask({ title: "Cancel the gym" });
    vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([task]));
    vi.spyOn(tasksApi, "show").mockResolvedValue({ task });
    vi.spyOn(tasksApi, "update").mockRejectedValue(new ApiError(422, "Title is too long"));
    renderInbox(generatePath(routes.inbox.show, { taskId: task.id }));

    await userEvent.type(await screen.findByRole("textbox", { name: "Task title" }), " and the pool{Enter}");

    expect(await screen.findByRole("alert")).toHaveTextContent("Title is too long");
    expect(screen.getByRole("textbox", { name: "Task title" })).toHaveValue("Cancel the gym");
  });

  it("shows each task's date in the list", async () => {
    const startsAt = startOfDay(addDays(new Date(), 1)).toISOString();
    vi.spyOn(tasksApi, "fetchList").mockResolvedValue(
      listOf([buildTask({ title: "Water the plants", isAllDay: true, startsAt })]),
    );

    renderInbox();

    expect(
      await screen.findByRole("button", { name: "Due date of Water the plants: Tomorrow" }),
    ).toBeInTheDocument();
  });

  it("clears a date from the picker the list row's date opens", async () => {
    const startsAt = startOfDay(addDays(new Date(), 1)).toISOString();
    const task = buildTask({ title: "Water the plants", isAllDay: true, startsAt });
    vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([task]));
    const update = vi.spyOn(tasksApi, "update").mockResolvedValue({ task });

    renderInbox();

    await userEvent.click(await screen.findByRole("button", { name: /Due date of Water the plants/ }));
    expect(screen.getByRole("dialog", { name: "Schedule" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Clear" }));

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith(
        { id: task.id, isDuration: false, isAllDay: false, startsAt: null, endsAt: null },
        expect.anything(),
      ),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("sets a date from the pane's due date picker", async () => {
    const task = buildTask({ title: "Renew the passport" });
    vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([task]));
    vi.spyOn(tasksApi, "show").mockResolvedValue({ task });
    const update = vi.spyOn(tasksApi, "update").mockResolvedValue({ task });
    renderInbox(generatePath(routes.inbox.show, { taskId: task.id }));

    await userEvent.click(await screen.findByRole("button", { name: "Due date" }));
    const tomorrow = addDays(new Date(), 1);
    await userEvent.click(
      screen.getByRole("button", { name: (name) => name.includes(format(tomorrow, "EEEE, MMMM do, yyyy")) }),
    );
    await userEvent.click(screen.getByRole("combobox", { name: "Time" }));
    await userEvent.click(screen.getByRole("option", { name: "5:30pm" }));
    await userEvent.click(screen.getByRole("button", { name: "OK" }));

    const startsAt = set(tomorrow, { hours: 17, minutes: 30, seconds: 0, milliseconds: 0 });
    await waitFor(() =>
      expect(update).toHaveBeenCalledWith(
        { id: task.id, isDuration: false, isAllDay: false, startsAt: startsAt.toISOString(), endsAt: null },
        expect.anything(),
      ),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("sets a duration and refuses one that ends before it starts", async () => {
    const startsAt = set(new Date(), { hours: 9, minutes: 0, seconds: 0, milliseconds: 0 });
    const task = buildTask({ title: "Team offsite", startsAt: startsAt.toISOString() });
    vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([task]));
    vi.spyOn(tasksApi, "show").mockResolvedValue({ task });
    const update = vi.spyOn(tasksApi, "update").mockResolvedValue({ task });
    renderInbox(generatePath(routes.inbox.show, { taskId: task.id }));

    // The list row shows the date too; this is the pane's.
    const pane = await screen.findByRole("article");
    await userEvent.click(within(pane).getByRole("button", { name: /Today, 9am/ }));
    await userEvent.click(screen.getByRole("tab", { name: "Duration" }));
    const endTime = screen.getByRole("combobox", { name: "End time" });
    expect(endTime).toHaveValue("10am");

    await userEvent.clear(endTime);
    await userEvent.type(endTime, "8am{Enter}");
    await userEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(screen.getByRole("alert")).toHaveTextContent("The end can't be before the start");
    expect(update).not.toHaveBeenCalled();

    await userEvent.clear(endTime);
    await userEvent.type(endTime, "11:30{Enter}");
    await userEvent.click(screen.getByRole("button", { name: "OK" }));

    const endsAt = set(startsAt, { hours: 11, minutes: 30 });
    await waitFor(() =>
      expect(update).toHaveBeenCalledWith(
        {
          id: task.id,
          isDuration: true,
          isAllDay: false,
          startsAt: startsAt.toISOString(),
          endsAt: endsAt.toISOString(),
        },
        expect.anything(),
      ),
    );
  });

  it("clears a task's schedule", async () => {
    const task = buildTask({
      title: "Dentist",
      isAllDay: true,
      startsAt: startOfDay(new Date()).toISOString(),
    });
    vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([task]));
    vi.spyOn(tasksApi, "show").mockResolvedValue({ task });
    const update = vi.spyOn(tasksApi, "update").mockResolvedValue({ task });
    renderInbox(generatePath(routes.inbox.show, { taskId: task.id }));

    await userEvent.click(await screen.findByRole("button", { name: "Today" }));
    await userEvent.click(screen.getByRole("button", { name: "Clear" }));

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith(
        { id: task.id, isDuration: false, isAllDay: false, startsAt: null, endsAt: null },
        expect.anything(),
      ),
    );
  });

  it("keeps the list row to the title and date, without the estimate", async () => {
    vi.spyOn(tasksApi, "fetchList").mockResolvedValue(
      listOf([buildTask({ title: "Plan the week", estimatedMinutes: 90 })]),
    );

    renderInbox();

    expect(await screen.findByRole("list", { name: "Tasks" })).not.toHaveTextContent("1 h 30 min");
  });

  it("sets an estimate from hours and minutes", async () => {
    const task = buildTask({ title: "Plan the week" });
    vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([task]));
    vi.spyOn(tasksApi, "show").mockResolvedValue({ task });
    const update = vi.spyOn(tasksApi, "update").mockResolvedValue({ task });
    renderInbox(generatePath(routes.inbox.show, { taskId: task.id }));

    await userEvent.click(await screen.findByRole("button", { name: "Estimate" }));
    await userEvent.type(screen.getByLabelText("Hours"), "1");
    await userEvent.type(screen.getByLabelText("Minutes"), "30");
    await userEvent.click(screen.getByRole("button", { name: "OK" }));

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith({ id: task.id, estimatedMinutes: 90 }, expect.anything()),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("splits an existing estimate into hours and minutes", async () => {
    const task = buildTask({ title: "Plan the week", estimatedMinutes: 100 });
    vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([task]));
    vi.spyOn(tasksApi, "show").mockResolvedValue({ task });
    renderInbox(generatePath(routes.inbox.show, { taskId: task.id }));

    await userEvent.click(await screen.findByRole("button", { name: "1 h 40 min" }));

    expect(screen.getByLabelText("Hours")).toHaveValue(1);
    expect(screen.getByLabelText("Minutes")).toHaveValue(40);
  });

  it("sets a custom estimate and refuses an invalid one", async () => {
    const task = buildTask({ title: "Plan the week", estimatedMinutes: 30 });
    vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([task]));
    vi.spyOn(tasksApi, "show").mockResolvedValue({ task });
    const update = vi.spyOn(tasksApi, "update").mockResolvedValue({ task });
    renderInbox(generatePath(routes.inbox.show, { taskId: task.id }));

    await userEvent.click(await screen.findByRole("button", { name: "30 min" }));
    const hours = screen.getByLabelText("Hours");
    const minutes = screen.getByLabelText("Minutes");
    expect(hours).toHaveValue(null);
    expect(minutes).toHaveValue(30);

    await userEvent.clear(minutes);
    await userEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(await screen.findByText("Enter 1 min to 24 h")).toBeInTheDocument();

    await userEvent.type(minutes, "75");
    await userEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(await screen.findByText("Enter 0–59 whole minutes")).toBeInTheDocument();

    await userEvent.clear(minutes);
    await userEvent.type(hours, "25");
    await userEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(await screen.findByText("Enter 0–24 whole hours")).toBeInTheDocument();

    await userEvent.clear(hours);
    await userEvent.type(hours, "24");
    await userEvent.type(minutes, "1");
    await userEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(await screen.findByText("Enter 1 min to 24 h")).toBeInTheDocument();
    expect(update).not.toHaveBeenCalled();

    await userEvent.clear(hours);
    await userEvent.type(hours, "1");
    await userEvent.clear(minutes);
    await userEvent.type(minutes, "40");
    await userEvent.click(screen.getByRole("button", { name: "OK" }));

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith({ id: task.id, estimatedMinutes: 100 }, expect.anything()),
    );
  });

  it("clears a task's estimate", async () => {
    const task = buildTask({ title: "Plan the week", estimatedMinutes: 120 });
    vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([task]));
    vi.spyOn(tasksApi, "show").mockResolvedValue({ task });
    const update = vi.spyOn(tasksApi, "update").mockResolvedValue({ task });
    renderInbox(generatePath(routes.inbox.show, { taskId: task.id }));

    await userEvent.click(await screen.findByRole("button", { name: "2 h" }));
    await userEvent.click(screen.getByRole("button", { name: "Clear" }));

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith({ id: task.id, estimatedMinutes: null }, expect.anything()),
    );
  });

  describe("when starting a task from its pane", () => {
    const task = buildTask({ title: "Write the report" });
    const running = buildTask({ title: "Sort the mail" });

    const renderPane = (timeLog: TimeLog | null) => {
      vi.spyOn(currentTimeLogsApi, "show").mockResolvedValue({ timeLog });
      vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([task, running]));
      vi.spyOn(tasksApi, "show").mockImplementation((id) =>
        Promise.resolve({ task: id === running.id ? running : task }),
      );
      renderInbox(generatePath(routes.inbox.show, { taskId: task.id }));
    };

    const clickStart = async () => {
      const start = await screen.findByRole("button", { name: "Start" });
      await waitFor(() => expect(start).toBeEnabled());
      await userEvent.click(start);
    };

    it("opens the Timer with the task picked when nothing is on the clock", async () => {
      renderPane(null);

      await clickStart();

      expect(await screen.findByRole("heading", { name: `Timer for ${task.id}` })).toBeInTheDocument();
    });

    it("leads to the Timer when the task is already on the clock", async () => {
      renderPane(buildTimeLog({ taskId: task.id }));

      await userEvent.click(await screen.findByRole("button", { name: "On the clock" }));

      expect(await screen.findByRole("heading", { name: "Timer for nothing" })).toBeInTheDocument();
    });

    it("shows the running session and stays put on cancel", async () => {
      renderPane(buildTimeLog({ taskId: running.id }));

      await clickStart();
      const dialog = await screen.findByRole("dialog", { name: "Switch tasks?" });
      const session = within(dialog).getByRole("region", { name: "Running session" });
      expect(await within(session).findByText("Sort the mail")).toBeInTheDocument();
      expect(within(session).getByRole("timer")).toHaveTextContent(/^Timer · 2\d:\d\d left$/);
      await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));

      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      expect(screen.getByRole("heading", { name: "Write the report" })).toBeInTheDocument();
    });

    it("marks the running task as done, then opens the Timer", async () => {
      const timeLog = buildTimeLog({ taskId: running.id });
      renderPane(timeLog);
      const complete = vi.spyOn(timeLogCompletionsApi, "create").mockImplementation(() => {
        vi.spyOn(currentTimeLogsApi, "show").mockResolvedValue({ timeLog: null });

        return Promise.resolve({ timeLog: { ...timeLog, completedAt: new Date().toISOString() } });
      });

      await clickStart();
      const dialog = await screen.findByRole("dialog", { name: "Switch tasks?" });
      await userEvent.click(within(dialog).getByRole("button", { name: "Mark as done" }));

      expect(await screen.findByRole("heading", { name: `Timer for ${task.id}` })).toBeInTheDocument();
      expect(complete).toHaveBeenCalledWith({ timeLogId: timeLog.id }, expect.anything());
    });

    it("bails out of the running task with breadcrumbs, then opens the Timer", async () => {
      const timeLog = buildTimeLog({ taskId: running.id, mode: "stopwatch", timerPreset: null });
      renderPane(timeLog);
      const bailOut = vi.spyOn(timeLogBailOutsApi, "create").mockImplementation(() => {
        vi.spyOn(currentTimeLogsApi, "show").mockResolvedValue({ timeLog: null });

        return Promise.resolve({ timeLog: { ...timeLog, completedAt: new Date().toISOString() } });
      });

      await clickStart();
      const dialog = await screen.findByRole("dialog", { name: "Switch tasks?" });
      expect(within(dialog).getByRole("timer")).toHaveTextContent(/^Stopwatch · 05:0\d elapsed$/);
      await userEvent.click(within(dialog).getByRole("button", { name: "Bail out" }));
      const breadcrumbs = await screen.findByRole("dialog", { name: "Leave breadcrumbs" });
      await userEvent.type(within(breadcrumbs).getByLabelText("Very next step"), "Reply to the bank");
      await userEvent.click(within(breadcrumbs).getByRole("button", { name: "Save & exit" }));

      expect(await screen.findByRole("heading", { name: `Timer for ${task.id}` })).toBeInTheDocument();
      expect(bailOut).toHaveBeenCalledWith(
        { timeLogId: timeLog.id, completedDescription: "", restartDescription: "Reply to the bank" },
        expect.anything(),
      );
    });

    it("only offers to discard a session too short to log", async () => {
      const now = new Date().toISOString();
      const timeLog = buildTimeLog({ taskId: running.id, startedAt: now, currentRunStartedAt: now });
      renderPane(timeLog);
      const destroy = vi.spyOn(timeLogsApi, "destroy").mockImplementation(() => {
        vi.spyOn(currentTimeLogsApi, "show").mockResolvedValue({ timeLog: null });

        return Promise.resolve(undefined as never);
      });

      await clickStart();
      const dialog = await screen.findByRole("dialog", { name: "Switch tasks?" });
      expect(within(dialog).queryByRole("button", { name: "Mark as done" })).not.toBeInTheDocument();
      expect(within(dialog).queryByRole("button", { name: "Bail out" })).not.toBeInTheDocument();
      await userEvent.click(within(dialog).getByRole("button", { name: "Discard and switch" }));

      expect(await screen.findByRole("heading", { name: `Timer for ${task.id}` })).toBeInTheDocument();
      expect(destroy).toHaveBeenCalledWith(timeLog.id, expect.anything());
    });

    it("stays open with the error when ending the running session fails", async () => {
      renderPane(buildTimeLog({ taskId: running.id }));
      vi.spyOn(timeLogCompletionsApi, "create").mockRejectedValue(new ApiError(422, "Something went wrong"));

      await clickStart();
      const dialog = await screen.findByRole("dialog", { name: "Switch tasks?" });
      await userEvent.click(within(dialog).getByRole("button", { name: "Mark as done" }));

      expect(await within(dialog).findByRole("alert")).toHaveTextContent("Something went wrong");
      expect(screen.queryByRole("heading", { name: /^Timer for/ })).not.toBeInTheDocument();
    });
  });
});

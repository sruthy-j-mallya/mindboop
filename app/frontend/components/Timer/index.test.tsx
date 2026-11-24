import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AxiosResponse } from "axios";
import { addDays, format, startOfDay } from "date-fns";
import type { InitialEntry } from "react-router";

import { ApiError } from "@/apis/axios";
import breaksApi from "@/apis/breaks";
import checklistItemsApi from "@/apis/checklist_items";
import currentTimeLogsApi from "@/apis/current_time_logs";
import lifeAreasApi from "@/apis/life_areas";
import parkingLotItemsApi from "@/apis/parking_lot_items";
import tasksApi from "@/apis/tasks";
import timeLogBailOutsApi from "@/apis/time_log_bail_outs";
import timeLogCompletionsApi from "@/apis/time_log_completions";
import timeLogExtensionsApi from "@/apis/time_log_extensions";
import timeLogsApi from "@/apis/time_logs";
import type { ParkingLotItem, Task, TimeLog } from "@/apis/types";
import userPreferencesApi from "@/apis/user_preferences";
import Timer from "@/components/Timer";
import routes from "@/routes";
import { renderWithProviders } from "@/test/utils";
import { playCompletionSound } from "@/utils/completionSound";

vi.mock("@/utils/completionSound");

const STARTED_AT = "2026-11-05T10:00:00.000Z";

const TASK_ID = "2f6e3c1a-0b7d-4c55-9a1e-7d0a4b8e1f23";

const TIME_LOG: TimeLog = {
  id: "5b7c9e14-2a3d-4f60-8e1b-6c4d2f0a9b37",
  taskId: TASK_ID,
  title: null,
  taskTitle: null,
  lifeAreaId: null,
  isTaskDeleted: false,
  mode: "timer",
  timerPreset: 25,
  bufferMinutes: 0,
  accumulatedElapsedSeconds: 0,
  isRunning: true,
  currentRunStartedAt: STARTED_AT,
  startedAt: STARTED_AT,
  completedAt: null,
  isFinishedEarly: false,
  currentBreak: null,
  createdAt: STARTED_AT,
  updatedAt: STARTED_AT,
};

// With the 37 seconds of the current run set up in beforeEach.
const TIME_LOG_AT_TWO_MINUTES: TimeLog = { ...TIME_LOG, accumulatedElapsedSeconds: 83 };

const TASK: Task = {
  id: TASK_ID,
  title: "Draft permission",
  description: null,
  estimatedMinutes: 25,
  isDuration: false,
  isAllDay: false,
  isCompleted: false,
  startsAt: null,
  endsAt: null,
  lifeAreaId: null,
  createdAt: STARTED_AT,
  updatedAt: STARTED_AT,
  checklistItems: [
    { id: "8a1d5e02-3c4f-4e6b-b7a9-1c2d3e4f5a6b", title: "Camera statistics", isCompleted: false },
    { id: "9b2e6f13-4d5a-4f7c-a8ba-2d3e4f5a6b7c", title: "Cuba economics", isCompleted: true },
  ],
  breadcrumbs: [],
};

const parkingLotListOf = (parkingLotItems: ParkingLotItem[]) => ({
  parkingLotItems,
  parkingLotItemsCount: parkingLotItems.length,
  page: 1,
  totalPages: 1,
});

const buildParkingLotItem = (overrides: Partial<ParkingLotItem> = {}): ParkingLotItem => ({
  id: crypto.randomUUID(),
  content: "Call the bank",
  status: "parked",
  taskId: null,
  timeLogId: null,
  curiosityEndsAt: null,
  isCuriosityExtended: false,
  createdAt: STARTED_AT,
  updatedAt: STARTED_AT,
  ...overrides,
});

const taskListOf = (tasks: Task[]) => ({ tasks, tasksCount: tasks.length, page: 1, totalPages: 1 });

const renderTimer = (
  timeLog: TimeLog | null,
  task = TASK,
  parkingLotItems: ParkingLotItem[] = [],
  initialPath: InitialEntry = routes.timer,
) => {
  vi.spyOn(currentTimeLogsApi, "show").mockResolvedValue({ timeLog });
  vi.spyOn(tasksApi, "fetchList").mockResolvedValue(taskListOf([task]));
  vi.spyOn(parkingLotItemsApi, "fetchList").mockResolvedValue(parkingLotListOf(parkingLotItems));
  vi.spyOn(tasksApi, "show").mockResolvedValue({ task });
  vi.spyOn(userPreferencesApi, "show").mockResolvedValue({
    userPreference: {
      theme: "system",
      completionSound: "glass",
      breakAlarmSound: "classic",
      weekStartsOn: 1,
    },
  });
  renderWithProviders(<Timer />, undefined, initialPath);
};

describe("Timer", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "Date"] });
    vi.setSystemTime(new Date(STARTED_AT).getTime() + 37_000);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("shows the task and its steps", async () => {
    renderTimer(TIME_LOG);

    expect(await screen.findByRole("heading", { level: 1, name: "Draft permission" })).toBeVisible();
    expect(screen.getByRole("checkbox", { name: "Camera statistics" })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Cuba economics" })).toBeChecked();
  });

  it("offers the task's title, due date, estimate and area, but not completing, starting or deleting it", async () => {
    vi.spyOn(lifeAreasApi, "fetchList").mockResolvedValue({
      lifeAreas: [
        {
          id: crypto.randomUUID(),
          name: "Work",
          color: "teal",
          emoji: "💼",
          defaultSound: "none",
          isDeleted: false,
          createdAt: STARTED_AT,
          updatedAt: STARTED_AT,
        },
      ],
    });
    renderTimer(TIME_LOG, { ...TASK, estimatedMinutes: null });

    expect(await screen.findByRole("textbox", { name: "Task title" })).toHaveValue("Draft permission");
    expect(screen.queryByRole("checkbox", { name: "Mark as complete" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "On the clock" })).not.toBeInTheDocument();
    await userEvent.click(await screen.findByRole("button", { name: "More actions" }));
    expect(screen.getByRole("menuitem", { name: "Add due date" })).toBeVisible();
    expect(screen.getByRole("menuitem", { name: "Add estimate" })).toBeVisible();
    expect(await screen.findByRole("menuitem", { name: "Move to area" })).toBeVisible();
    expect(screen.queryByRole("menuitem", { name: "Delete task" })).not.toBeInTheDocument();
  });

  it("hides the menu when there's nothing left to add", async () => {
    renderTimer(TIME_LOG, { ...TASK, estimatedMinutes: 30, isAllDay: true, startsAt: STARTED_AT });

    expect(await screen.findByRole("button", { name: "30 min" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "More actions" })).not.toBeInTheDocument();
  });

  it("sets the due date from the task details", async () => {
    vi.useRealTimers();
    const update = vi.spyOn(tasksApi, "update").mockResolvedValue({ task: TASK });
    renderTimer(TIME_LOG);

    await userEvent.click(await screen.findByRole("button", { name: "More actions" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Add due date" }));
    const tomorrow = addDays(new Date(), 1);
    await userEvent.click(
      screen.getByRole("button", { name: (name) => name.includes(format(tomorrow, "EEEE, MMMM do, yyyy")) }),
    );
    await userEvent.click(screen.getByRole("button", { name: "OK" }));

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith(
        expect.objectContaining({ id: TASK.id, startsAt: startOfDay(tomorrow).toISOString() }),
        expect.anything(),
      ),
    );
  });

  it("shows the task's description as formatted text", async () => {
    renderTimer(TIME_LOG, { ...TASK, description: "Start with the **intro**\n\n- Cite sources" });

    const description = await screen.findByRole("region", { name: "Description" });
    // The viewer loads lazily, so wait for its content.
    expect((await within(description).findByText("intro")).tagName).toBe("STRONG");
    expect(within(description).getByRole("listitem")).toHaveTextContent("Cite sources");
  });

  it("offers an empty description to write in when the task has none", async () => {
    renderTimer(TIME_LOG);

    const description = await screen.findByRole("region", { name: "Description" });
    expect(await within(description).findByRole("textbox", { name: "Description" })).toHaveTextContent("");
    expect(screen.queryByRole("button", { name: "Add a description" })).not.toBeInTheDocument();
  });

  it("shows the task's breadcrumbs, newest first", async () => {
    renderTimer(TIME_LOG, {
      ...TASK,
      breadcrumbs: [
        {
          id: crypto.randomUUID(),
          completedDescription: null,
          restartDescription: "Write the conclusion",
          createdAt: "2026-11-04T10:00:00.000Z",
        },
        {
          id: crypto.randomUUID(),
          completedDescription: "Drafted the intro",
          restartDescription: "Find sources",
          createdAt: "2026-11-03T10:00:00.000Z",
        },
      ],
    });

    const breadcrumbs = await screen.findByRole("region", { name: "Breadcrumbs" });
    const items = within(breadcrumbs).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Write the conclusion");
    expect(items[1]).toHaveTextContent("Find sources");
    expect(items[1]).toHaveTextContent("Drafted the intro");
  });

  it("leaves out the breadcrumbs when the task has none", async () => {
    renderTimer(TIME_LOG);

    expect(await screen.findByRole("heading", { level: 1, name: "Draft permission" })).toBeVisible();
    expect(screen.queryByRole("region", { name: "Breadcrumbs" })).not.toBeInTheDocument();
  });

  describe("when editing the steps", () => {
    const [FIRST_ITEM, SECOND_ITEM] = TASK.checklistItems;

    it("ticks a step off and saves it", async () => {
      const updatedTask = {
        ...TASK,
        checklistItems: [{ ...FIRST_ITEM, isCompleted: true }, SECOND_ITEM],
      };
      const update = vi.spyOn(checklistItemsApi, "update").mockResolvedValue({ task: updatedTask });
      renderTimer(TIME_LOG);

      const step = await screen.findByRole("checkbox", { name: "Camera statistics" });
      await userEvent.click(step);

      expect(update).toHaveBeenCalledWith(
        { taskId: TASK.id, id: FIRST_ITEM.id, isCompleted: true },
        expect.anything(),
      );
      expect(step).toBeChecked();
    });

    it("puts the tick back and shows the error when saving fails", async () => {
      vi.spyOn(checklistItemsApi, "update").mockRejectedValue(new ApiError(500, "Something went wrong"));
      renderTimer(TIME_LOG);

      const step = await screen.findByRole("checkbox", { name: "Camera statistics" });
      await userEvent.click(step);

      expect(await screen.findByRole("alert")).toHaveTextContent("Something went wrong");
      expect(step).not.toBeChecked();
    });

    it("offers to add a step only while the task has no steps", async () => {
      renderTimer(TIME_LOG);

      expect(await screen.findByRole("checkbox", { name: FIRST_ITEM.title })).toBeVisible();
      await userEvent.click(await screen.findByRole("button", { name: "More actions" }));
      expect(screen.queryByRole("menuitem", { name: "Add step" })).not.toBeInTheDocument();
    });

    it("adds the first step from the menu beside the title", async () => {
      const newItem = { id: "0c3f7a24-5e6b-4a8d-b9cb-3e4f5a6b7c8d", title: "Conclusion", isCompleted: false };
      const create = vi
        .spyOn(checklistItemsApi, "create")
        .mockResolvedValue({ task: { ...TASK, checklistItems: [newItem] } });
      renderTimer(TIME_LOG, { ...TASK, checklistItems: [] });

      await userEvent.click(await screen.findByRole("button", { name: "More actions" }));
      await userEvent.click(screen.getByRole("menuitem", { name: "Add step" }));
      await userEvent.keyboard("Conclusion{Enter}");

      expect(create).toHaveBeenCalledWith({ taskId: TASK.id, title: "Conclusion" }, expect.anything());
      expect(await screen.findByRole("checkbox", { name: "Conclusion" })).not.toBeChecked();
      expect(screen.getByRole("textbox", { name: "New step" })).toHaveFocus();
    });

    it("shows a step added below another at once, at its place", async () => {
      const create = vi.spyOn(checklistItemsApi, "create").mockReturnValue(new Promise(() => {}));
      renderTimer(TIME_LOG);

      await userEvent.click(await screen.findByRole("button", { name: "Edit Camera statistics" }));
      await userEvent.keyboard("{Enter}Middle{Enter}");

      expect(create).toHaveBeenCalledWith(
        { taskId: TASK.id, title: "Middle", position: 1 },
        expect.anything(),
      );
      const stepNames = () =>
        within(screen.getByRole("list", { name: "Steps" }))
          .getAllByRole("checkbox")
          .map((step) => step.getAttribute("aria-label"));
      await waitFor(() => expect(stepNames()).toEqual([FIRST_ITEM.title, "Middle", SECOND_ITEM.title]));
      expect(screen.getByRole("textbox", { name: "New step" })).toHaveFocus();
    });

    it("takes a new step back out when saving it fails", async () => {
      vi.spyOn(checklistItemsApi, "create").mockRejectedValue(new ApiError(500, "Something went wrong"));
      renderTimer(TIME_LOG, { ...TASK, checklistItems: [] });

      await userEvent.click(await screen.findByRole("button", { name: "More actions" }));
      await userEvent.click(screen.getByRole("menuitem", { name: "Add step" }));
      await userEvent.keyboard("Conclusion{Enter}");

      expect(await screen.findByRole("alert")).toHaveTextContent("Something went wrong");
      expect(screen.queryByRole("checkbox", { name: "Conclusion" })).not.toBeInTheDocument();
    });

    it("renames a step", async () => {
      const update = vi.spyOn(checklistItemsApi, "update").mockResolvedValue({
        task: { ...TASK, checklistItems: [{ ...FIRST_ITEM, title: "Camera stats" }, SECOND_ITEM] },
      });
      renderTimer(TIME_LOG);

      await userEvent.click(await screen.findByRole("button", { name: "Edit Camera statistics" }));
      const input = screen.getByRole("textbox", { name: "Step text" });
      await userEvent.clear(input);
      await userEvent.type(input, "Camera stats{Enter}");

      expect(update).toHaveBeenCalledWith(
        { taskId: TASK.id, id: FIRST_ITEM.id, title: "Camera stats" },
        expect.anything(),
      );
      expect(screen.getByRole("checkbox", { name: "Camera stats" })).toBeVisible();
    });

    it("removes a step", async () => {
      const destroy = vi
        .spyOn(checklistItemsApi, "destroy")
        .mockResolvedValue({ task: { ...TASK, checklistItems: [SECOND_ITEM] } });
      renderTimer(TIME_LOG);

      await userEvent.click(await screen.findByRole("button", { name: "Remove Camera statistics" }));

      expect(destroy).toHaveBeenCalledWith({ taskId: TASK.id, id: FIRST_ITEM.id }, expect.anything());
      await waitFor(() =>
        expect(screen.queryByRole("checkbox", { name: "Camera statistics" })).not.toBeInTheDocument(),
      );
    });
  });

  describe("when editing the description", () => {
    const DESCRIPTION = "Start with the intro";

    // jsdom can't type into the editor reliably (Playwright covers typing), so edits go through the toolbar.
    const makeBulletList = async () => {
      await userEvent.click(await screen.findByRole("textbox", { name: "Description" }));
      await userEvent.click(screen.getByRole("button", { name: "Show formatting" }));
      await userEvent.click(screen.getByRole("button", { name: "Bullet list" }));
    };

    it("is editable right away, with no edit or save buttons", async () => {
      renderTimer(TIME_LOG, { ...TASK, description: DESCRIPTION });

      expect(await screen.findByRole("textbox", { name: "Description" })).toHaveTextContent(DESCRIPTION);
      expect(screen.queryByRole("button", { name: "Edit description" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument();
      expect(screen.queryByRole("toolbar", { name: "Formatting" })).not.toBeInTheDocument();
    });

    it("saves the edit when the editor loses focus", async () => {
      const update = vi
        .spyOn(tasksApi, "update")
        .mockResolvedValue({ task: { ...TASK, description: `- ${DESCRIPTION}` } });
      renderTimer(TIME_LOG, { ...TASK, description: DESCRIPTION });

      await makeBulletList();
      expect(update).not.toHaveBeenCalled();
      await userEvent.click(screen.getByRole("heading", { level: 1, name: "Draft permission" }));

      expect(update).toHaveBeenCalledOnce();
      expect(update).toHaveBeenCalledWith(
        { id: TASK.id, description: `- ${DESCRIPTION}` },
        expect.anything(),
      );
    });

    it("saves the edit after a pause in typing", async () => {
      const update = vi
        .spyOn(tasksApi, "update")
        .mockResolvedValue({ task: { ...TASK, description: `- ${DESCRIPTION}` } });
      renderTimer(TIME_LOG, { ...TASK, description: DESCRIPTION });

      await makeBulletList();

      await waitFor(() =>
        expect(update).toHaveBeenCalledWith(
          { id: TASK.id, description: `- ${DESCRIPTION}` },
          expect.anything(),
        ),
      );
    });

    it("doesn't save when nothing changed", async () => {
      const update = vi.spyOn(tasksApi, "update");
      renderTimer(TIME_LOG, { ...TASK, description: DESCRIPTION });

      await userEvent.click(await screen.findByRole("textbox", { name: "Description" }));
      await userEvent.click(screen.getByRole("heading", { level: 1, name: "Draft permission" }));

      expect(update).not.toHaveBeenCalled();
    });

    it("keeps the edit and shows the error when saving fails", async () => {
      vi.spyOn(tasksApi, "update").mockRejectedValue(new ApiError(500, "Something went wrong"));
      renderTimer(TIME_LOG, { ...TASK, description: DESCRIPTION });

      await makeBulletList();
      await userEvent.click(screen.getByRole("heading", { level: 1, name: "Draft permission" }));

      expect(await screen.findByRole("alert")).toHaveTextContent("Something went wrong");
      expect(
        within(screen.getByRole("textbox", { name: "Description" })).getByRole("listitem"),
      ).toHaveTextContent(DESCRIPTION);
    });
  });

  it("counts down from the time log's start time", async () => {
    renderTimer(TIME_LOG);

    expect(await screen.findByRole("timer")).toHaveTextContent("24:23");

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByRole("timer")).toHaveTextContent("24:21");
  });

  describe("ring", () => {
    // Decorative (aria-hidden), so there's no accessible handle; the arc is the primary-coloured circle.
    const arcFill = () => {
      const dashArray = document.querySelector("circle.stroke-primary")?.getAttribute("stroke-dasharray");

      return dashArray === undefined ? null : Number(dashArray?.split(" ")[0]);
    };

    it("shows the time left, emptying as the timer counts down", async () => {
      renderTimer({ ...TIME_LOG, timerPreset: 10, accumulatedElapsedSeconds: 263 });

      await screen.findByRole("timer");
      // 5 of the 10 minutes are left.
      expect(arcFill()).toBeCloseTo(0.5);

      act(() => {
        vi.advanceTimersByTime(60_000);
      });

      expect(arcFill()).toBeCloseTo(0.4);
    });

    it("is gone once the time runs out", async () => {
      renderTimer({ ...TIME_LOG, timerPreset: 1, accumulatedElapsedSeconds: 60 });

      expect(await screen.findByRole("timer")).toHaveTextContent("00:00");
      expect(arcFill()).toBeNull();
    });

    it("starts full before a timer is started", async () => {
      renderTimer(null);

      await screen.findByRole("heading", { name: "Start a session" });

      expect(arcFill()).toBe(1);
    });
  });

  it("adds the time from earlier runs", async () => {
    renderTimer({ ...TIME_LOG, accumulatedElapsedSeconds: 60 });

    expect(await screen.findByRole("timer")).toHaveTextContent("23:23");
  });

  it("holds the time while the time log isn't running", async () => {
    renderTimer({ ...TIME_LOG, isRunning: false, currentRunStartedAt: null, accumulatedElapsedSeconds: 60 });

    expect(await screen.findByRole("timer")).toHaveTextContent("24:00");

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByRole("timer")).toHaveTextContent("24:00");
  });

  it("stops at zero when the time runs out", async () => {
    renderTimer({ ...TIME_LOG, timerPreset: 1, accumulatedElapsedSeconds: 60 });

    expect(await screen.findByRole("timer")).toHaveTextContent("00:00");
  });

  describe("when the timer runs past zero", () => {
    // A 2 minute timer, 37 seconds past zero.
    const OVERRUN_TIME_LOG: TimeLog = { ...TIME_LOG, timerPreset: 2, accumulatedElapsedSeconds: 120 };

    const overrunToggle = () => screen.findByRole("button", { name: /extra time/ });

    const mockCompletion = () =>
      vi.spyOn(timeLogCompletionsApi, "create").mockImplementation(() => {
        vi.spyOn(currentTimeLogsApi, "show").mockResolvedValue({ timeLog: null });

        return Promise.resolve({
          timeLog: { ...OVERRUN_TIME_LOG, isRunning: false, completedAt: STARTED_AT },
        });
      });

    it("stays at zero and counts the extra time up underneath", async () => {
      renderTimer(OVERRUN_TIME_LOG);

      expect(await screen.findByRole("timer")).toHaveTextContent("00:00");
      expect(await overrunToggle()).toHaveTextContent("00:37");

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(await overrunToggle()).toHaveTextContent("00:39");
      expect(screen.getByRole("timer")).toHaveTextContent("00:00");
    });

    it("offers only Bail and Done", async () => {
      renderTimer(OVERRUN_TIME_LOG);

      await overrunToggle();

      expect(screen.queryByRole("button", { name: "Extend" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Pause" })).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Bail" })).toBeEnabled();
      expect(screen.getByRole("button", { name: "Done" })).toBeEnabled();
    });

    it("shows no extra time before zero", async () => {
      renderTimer(TIME_LOG);

      await screen.findByRole("timer");

      expect(screen.queryByRole("button", { name: /extra time/ })).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Pause" })).toBeVisible();
    });

    it("leaves the extra time out by default", async () => {
      const create = mockCompletion();
      renderTimer(OVERRUN_TIME_LOG);

      expect(await overrunToggle()).toHaveAccessibleName("Add the extra time to the log");
      expect(screen.getByText("extra time not logged")).toBeVisible();
      await userEvent.click(screen.getByRole("button", { name: "Done" }));

      await screen.findByRole("dialog", { name: /Finished/ });
      expect(create).toHaveBeenCalledWith(
        { timeLogId: TIME_LOG.id, discardOverrun: true },
        expect.anything(),
      );
    });

    it("logs the extra time once it is added, and leaves it out again when removed", async () => {
      const create = mockCompletion();
      renderTimer(OVERRUN_TIME_LOG);

      await userEvent.click(await overrunToggle());
      expect(await overrunToggle()).toHaveAccessibleName("Remove the extra time from the log");
      expect(screen.getByText("extra time logged")).toBeVisible();

      await userEvent.click(await overrunToggle());
      expect(await overrunToggle()).toHaveAccessibleName("Add the extra time to the log");

      await userEvent.click(await overrunToggle());
      await userEvent.click(screen.getByRole("button", { name: "Done" }));

      await screen.findByRole("dialog", { name: /Finished/ });
      expect(create).toHaveBeenCalledWith(
        { timeLogId: TIME_LOG.id, discardOverrun: false },
        expect.anything(),
      );
    });

    it("bails out without the extra time by default", async () => {
      const create = vi.spyOn(timeLogBailOutsApi, "create").mockImplementation(() => {
        vi.spyOn(currentTimeLogsApi, "show").mockResolvedValue({ timeLog: null });

        return Promise.resolve({
          timeLog: { ...OVERRUN_TIME_LOG, isRunning: false, completedAt: STARTED_AT },
        });
      });
      renderTimer(OVERRUN_TIME_LOG);

      await overrunToggle();
      await userEvent.click(screen.getByRole("button", { name: "Bail" }));
      const dialog = await screen.findByRole("dialog", { name: "Leave breadcrumbs" });
      await userEvent.type(within(dialog).getByLabelText("Very next step"), "Finish paragraph 2");
      await userEvent.click(within(dialog).getByRole("button", { name: "Save & exit" }));

      await screen.findByRole("heading", { name: "Start a session" });
      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({ timeLogId: TIME_LOG.id, discardOverrun: true }),
        expect.anything(),
      );
    });

    it("offers only to discard when the timer's own time is too short to log", async () => {
      const create = vi.spyOn(timeLogCompletionsApi, "create");
      renderTimer({ ...OVERRUN_TIME_LOG, timerPreset: 1, accumulatedElapsedSeconds: 90 });

      await overrunToggle();
      await userEvent.click(screen.getByRole("button", { name: "Done" }));

      expect(await screen.findByRole("dialog", { name: "Discard this timer?" })).toBeVisible();
      expect(create).not.toHaveBeenCalled();
    });
  });

  describe("when nothing is on the clock", () => {
    const pickTask = async (title = TASK.title) => {
      await userEvent.click(await screen.findByRole("combobox", { name: "Task" }));
      await userEvent.click(await screen.findByRole("option", { name: title }));
    };

    const minutesInput = () => screen.getByRole("textbox", { name: /Timer minutes/ });

    const mockStart = (timeLog: TimeLog) =>
      vi.spyOn(timeLogsApi, "create").mockImplementation(() => {
        vi.spyOn(currentTimeLogsApi, "show").mockResolvedValue({ timeLog });

        return Promise.resolve({ timeLog });
      });

    it("sets up a 5 minute timer, waiting for a task", async () => {
      renderTimer(null);

      expect(await screen.findByRole("heading", { name: "Start a session" })).toBeVisible();
      expect(screen.getByRole("tab", { name: "Timer" })).toHaveAttribute("aria-selected", "true");
      expect(minutesInput()).toHaveValue("05");
      expect(screen.getByText("Pick a task to see its steps and description.")).toBeVisible();
      expect(screen.getByRole("button", { name: "Start" })).toBeDisabled();
      expect(screen.queryByRole("timer")).not.toBeInTheDocument();
      expect(screen.queryByRole("region", { name: "Parking lot" })).not.toBeInTheDocument();
      expect(tasksApi.fetchList).toHaveBeenCalledWith({ isCompleted: false });
    });

    it("shows the picked task's steps and description", async () => {
      renderTimer(null, { ...TASK, description: "Start with the intro" });

      await pickTask();

      expect(await screen.findByRole("checkbox", { name: "Camera statistics" })).toBeVisible();
      expect(await screen.findByRole("textbox", { name: "Description" })).toHaveTextContent(
        "Start with the intro",
      );
      expect(screen.getByRole("button", { name: "Start" })).toBeEnabled();
    });

    it("starts a timer preset to the task's estimate, then shows the session and the parking lot", async () => {
      const create = mockStart(TIME_LOG);
      renderTimer(null);

      await pickTask();
      expect(minutesInput()).toHaveValue("25");
      await userEvent.click(screen.getByRole("button", { name: "Start" }));

      expect(create).toHaveBeenCalledWith(
        { taskId: TASK.id, mode: "timer", timerPreset: 25 },
        expect.anything(),
      );
      expect(await screen.findByRole("timer")).toBeVisible();
      expect(screen.getByRole("heading", { level: 1, name: TASK.title })).toBeVisible();
      expect(screen.getByRole("region", { name: "Parking lot" })).toBeVisible();
    });

    it("keeps the 5 minute preset for a task with no estimate or one over 4 hours", async () => {
      renderTimer(null, { ...TASK, estimatedMinutes: 241 });

      await pickTask();

      await waitFor(() => expect(screen.getByRole("button", { name: "Start" })).toBeEnabled());
      expect(minutesInput()).toHaveValue("05");
    });

    it("switches to a timer when the picked task has an estimate", async () => {
      renderTimer(null, { ...TASK, estimatedMinutes: 240 });

      await userEvent.click(await screen.findByRole("tab", { name: "Stopwatch" }));
      await pickTask();

      expect(await screen.findByRole("tab", { name: "Timer" })).toHaveAttribute("aria-selected", "true");
      expect(minutesInput()).toHaveValue("240");
    });

    it("preselects the task sent from the Inbox, preset to its estimate", async () => {
      const create = mockStart(TIME_LOG);
      renderTimer(null, TASK, [], { pathname: routes.timer, state: { taskId: TASK.id } });

      await waitFor(() => expect(screen.getByRole("combobox", { name: "Task" })).toHaveValue(TASK.title));
      expect(tasksApi.show).toHaveBeenCalledWith(TASK.id);
      expect(minutesInput()).toHaveValue("25");
      expect(await screen.findByRole("checkbox", { name: "Camera statistics" })).toBeVisible();
      await userEvent.click(screen.getByRole("button", { name: "Start" }));

      expect(create).toHaveBeenCalledWith(
        { taskId: TASK.id, mode: "timer", timerPreset: 25 },
        expect.anything(),
      );
    });

    it("edits the preset minutes in place", async () => {
      const create = mockStart(TIME_LOG);
      renderTimer(null);

      await pickTask();
      await userEvent.click(minutesInput());
      await userEvent.keyboard("45{Enter}");
      expect(minutesInput()).toHaveValue("45");
      await userEvent.click(screen.getByRole("button", { name: "Start" }));

      expect(create).toHaveBeenCalledWith(
        { taskId: TASK.id, mode: "timer", timerPreset: 45 },
        expect.anything(),
      );
    });

    it.each([
      ["1.5", "15"],
      ["-3", "03"],
      ["0", "05"],
      ["1", "05"],
      ["", "05"],
      ["999", "240"],
    ])("turns %j typed minutes into %s", async (typed, shown) => {
      renderTimer(null);

      await userEvent.click(await screen.findByRole("textbox", { name: /Timer minutes/ }));
      await userEvent.keyboard(`{Backspace}${typed}`);
      await userEvent.tab();

      expect(minutesInput()).toHaveValue(shown);
    });

    it("puts the minutes back on Escape", async () => {
      renderTimer(null);

      await userEvent.click(await screen.findByRole("textbox", { name: /Timer minutes/ }));
      await userEvent.keyboard("30{Escape}");

      expect(minutesInput()).toHaveValue("05");
    });

    it("starts a stopwatch from zero", async () => {
      const create = mockStart({ ...TIME_LOG, mode: "stopwatch", timerPreset: null });
      renderTimer(null);

      await pickTask();
      await userEvent.click(screen.getByRole("tab", { name: "Stopwatch" }));
      expect(screen.getByText("00:00")).toBeVisible();
      await userEvent.click(screen.getByRole("button", { name: "Start" }));

      expect(create).toHaveBeenCalledWith({ taskId: TASK.id, mode: "stopwatch" }, expect.anything());
      expect(await screen.findByRole("timer")).toHaveTextContent("00:37");
    });

    it("shows the error when starting fails", async () => {
      vi.spyOn(timeLogsApi, "create").mockRejectedValue(
        new ApiError(422, "Mode is not included in the list"),
      );
      renderTimer(null);

      await pickTask();
      await userEvent.click(screen.getByRole("button", { name: "Start" }));

      expect(await screen.findByRole("alert")).toHaveTextContent("Mode is not included in the list");
      expect(screen.queryByRole("timer")).not.toBeInTheDocument();
    });

    it("points to the Inbox when there are no open tasks", async () => {
      vi.spyOn(currentTimeLogsApi, "show").mockResolvedValue({ timeLog: null });
      vi.spyOn(tasksApi, "fetchList").mockResolvedValue(taskListOf([]));
      renderWithProviders(<Timer />);

      expect(await screen.findByRole("link", { name: "Inbox" })).toHaveAttribute("href", routes.inbox.index);
      await userEvent.click(screen.getByRole("combobox", { name: "Task" }));
      expect(screen.getByText("No open tasks")).toBeVisible();
    });

    describe("searching for a task", () => {
      const OTHER_TASK: Task = {
        ...TASK,
        id: "7e1a2b3c-4d5e-4f60-8a1b-2c3d4e5f6a7b",
        title: "Call the bank",
      };

      // The server's search, matching any part of the title and ignoring case.
      const renderWithTasks = (tasks: Task[]) => {
        vi.spyOn(currentTimeLogsApi, "show").mockResolvedValue({ timeLog: null });
        vi.spyOn(tasksApi, "fetchList").mockImplementation(({ searchTerm } = {}) =>
          Promise.resolve(
            taskListOf(
              tasks.filter(({ title }) => title.toLowerCase().includes((searchTerm ?? "").toLowerCase())),
            ),
          ),
        );
        vi.spyOn(tasksApi, "show").mockImplementation((id) =>
          Promise.resolve({ task: tasks.find((task) => task.id === id)! }),
        );
        renderWithProviders(<Timer />);
      };

      const optionNames = () => screen.getAllByRole("option").map((option) => option.textContent);

      it("lists the open tasks on focus and narrows them as you type", async () => {
        renderWithTasks([TASK, OTHER_TASK]);

        await userEvent.click(await screen.findByRole("combobox", { name: "Task" }));
        await waitFor(() => expect(optionNames()).toEqual([TASK.title, OTHER_TASK.title]));

        await userEvent.keyboard("BANK");

        await waitFor(() => expect(optionNames()).toEqual([OTHER_TASK.title]));
        expect(tasksApi.fetchList).toHaveBeenCalledWith({ isCompleted: false, searchTerm: "BANK" });
        expect(tasksApi.fetchList).not.toHaveBeenCalledWith(expect.objectContaining({ searchTerm: "B" }));
      });

      it("picks a match with the keyboard", async () => {
        renderWithTasks([TASK, OTHER_TASK]);

        const combobox = await screen.findByRole("combobox", { name: "Task" });
        await userEvent.click(combobox);
        await screen.findAllByRole("option");
        await userEvent.keyboard("{ArrowDown}");
        expect(screen.getByRole("option", { name: OTHER_TASK.title })).toHaveAttribute(
          "aria-selected",
          "true",
        );
        await userEvent.keyboard("{Enter}");

        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
        expect(combobox).toHaveValue(OTHER_TASK.title);
        expect(screen.getByRole("button", { name: "Start" })).toBeEnabled();
      });

      it("says when nothing matches", async () => {
        renderWithTasks([TASK]);

        await userEvent.click(await screen.findByRole("combobox", { name: "Task" }));
        await userEvent.keyboard("dentist");

        expect(await screen.findByText("No open tasks match “dentist”")).toBeVisible();
        expect(screen.queryByRole("option")).not.toBeInTheDocument();
      });

      it("keeps the picked task when closed with Escape", async () => {
        renderWithTasks([TASK, OTHER_TASK]);

        await pickTask();
        const combobox = screen.getByRole("combobox", { name: "Task" });
        await userEvent.click(combobox);
        await userEvent.keyboard("bank{Escape}");

        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
        expect(combobox).toHaveValue(TASK.title);
      });
    });
  });

  describe("with a stopwatch", () => {
    const STOPWATCH: TimeLog = { ...TIME_LOG, mode: "stopwatch", timerPreset: null };

    it("counts up from the time log's start time", async () => {
      renderTimer(STOPWATCH);

      expect(await screen.findByRole("timer")).toHaveTextContent("00:37");
      expect(screen.getByText("elapsed")).toBeVisible();

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(screen.getByRole("timer")).toHaveTextContent("00:39");
    });

    // The ring is decorative (aria-hidden), so there's no accessible handle; the arc is the primary-coloured circle.
    it("draws no progress arc, not even a dot at the top", async () => {
      renderTimer(STOPWATCH);

      await screen.findByRole("timer");

      expect(document.querySelector("circle.stroke-primary")).toBeNull();
    });

    it("offers every action but Extend", async () => {
      renderTimer(STOPWATCH);

      expect(await screen.findByRole("button", { name: "Pause" })).toBeVisible();
      expect(screen.getByRole("button", { name: "Bail" })).toBeVisible();
      expect(screen.getByRole("button", { name: "Done" })).toBeVisible();
      expect(screen.queryByRole("button", { name: "Extend" })).not.toBeInTheDocument();
      expect(screen.getByRole("region", { name: "Parking lot" })).toBeVisible();
    });
  });

  describe("when pausing", () => {
    const BREAK_ENDS_AT = new Date(new Date(STARTED_AT).getTime() + 37_000 + 270_000).toISOString();
    const PAUSED_TIME_LOG: TimeLog = {
      ...TIME_LOG,
      isRunning: false,
      currentRunStartedAt: null,
      accumulatedElapsedSeconds: 37,
      currentBreak: {
        id: "c3f8a7b2-5e6d-4a81-9b0c-3e4f5a6b7c8d",
        intention: "Delivery",
        durationMinutes: 5,
        endsAt: BREAK_ENDS_AT,
      },
    };

    const openDialog = async () => {
      await userEvent.click(await screen.findByRole("button", { name: "Pause" }));

      return screen.findByRole("dialog", { name: "Pause with a plan" });
    };

    it("pauses with the chosen preset", async () => {
      const create = vi.spyOn(breaksApi, "create").mockResolvedValue({ timeLog: PAUSED_TIME_LOG });
      renderTimer(TIME_LOG);

      const dialog = await openDialog();
      await userEvent.click(within(dialog).getByRole("button", { name: "Short walk · 10m" }));
      await userEvent.click(within(dialog).getByRole("button", { name: "Pause & set reminder" }));

      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      expect(create).toHaveBeenCalledWith(
        { timeLogId: TIME_LOG.id, intention: "Short walk", durationMinutes: 10 },
        expect.anything(),
      );
      expect(await screen.findByText("Stepped away — Delivery")).toBeVisible();
    });

    it.each(["16", "0", "1.5", ""])("rejects %j minutes", async (minutes) => {
      const create = vi.spyOn(breaksApi, "create");
      renderTimer(TIME_LOG);

      const dialog = await openDialog();
      await userEvent.type(within(dialog).getByRole("textbox"), "Delivery");
      await userEvent.clear(within(dialog).getByLabelText("Back in"));
      if (minutes) await userEvent.type(within(dialog).getByLabelText("Back in"), minutes);
      await userEvent.click(within(dialog).getByRole("button", { name: "Pause & set reminder" }));

      expect(await within(dialog).findByText("Enter 1–15 whole minutes")).toBeVisible();
      expect(create).not.toHaveBeenCalled();
    });

    it("requires saying what the break is for", async () => {
      const create = vi.spyOn(breaksApi, "create");
      renderTimer(TIME_LOG);

      const dialog = await openDialog();
      await userEvent.click(within(dialog).getByRole("button", { name: "Pause & set reminder" }));

      expect(await within(dialog).findByText("Say what you're stepping away for")).toBeVisible();
      expect(create).not.toHaveBeenCalled();
    });

    it("keeps the dialog open and shows the error when pausing fails", async () => {
      vi.spyOn(breaksApi, "create").mockRejectedValue(new ApiError(422, "This session is already finished."));
      renderTimer(TIME_LOG);

      const dialog = await openDialog();
      await userEvent.type(within(dialog).getByRole("textbox"), "Delivery");
      await userEvent.click(within(dialog).getByRole("button", { name: "Pause & set reminder" }));

      expect(await within(dialog).findByRole("alert")).toHaveTextContent("This session is already finished.");
    });

    it("holds the timer and counts down the break", async () => {
      renderTimer(PAUSED_TIME_LOG);

      expect(await screen.findByRole("timer")).toHaveTextContent("24:23");
      expect(screen.getByText("Paused")).toBeVisible();
      expect(screen.getByText("back in 04:30")).toBeVisible();
      expect(screen.getByRole("button", { name: "Pause" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Extend" })).toBeDisabled();

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(screen.getByRole("timer")).toHaveTextContent("24:23");
      expect(screen.getByText("back in 04:28")).toBeVisible();
    });

    it("stays paused once the break is over", async () => {
      renderTimer(PAUSED_TIME_LOG);
      await screen.findByRole("timer");

      act(() => {
        vi.advanceTimersByTime(271_000);
      });

      expect(screen.getByText("break's over")).toBeVisible();
      expect(screen.getByText("Break's over — Delivery")).toBeVisible();
      expect(screen.getByRole("timer")).toHaveTextContent("24:23");
    });

    it("goes back to focusing on I'm back", async () => {
      const update = vi.spyOn(breaksApi, "update").mockResolvedValue({ timeLog: TIME_LOG });
      renderTimer(PAUSED_TIME_LOG);

      await userEvent.click(await screen.findByRole("button", { name: "I'm back" }));

      expect(await screen.findByText("Focusing on")).toBeVisible();
      expect(update).toHaveBeenCalledWith(TIME_LOG.id, expect.anything());
      expect(screen.queryByRole("button", { name: "I'm back" })).not.toBeInTheDocument();
    });

    it("keeps the break and shows the error when coming back fails", async () => {
      vi.spyOn(breaksApi, "update").mockRejectedValue(new ApiError(500, "Something went wrong"));
      renderTimer(PAUSED_TIME_LOG);

      await userEvent.click(await screen.findByRole("button", { name: "I'm back" }));

      expect(await screen.findByRole("alert")).toHaveTextContent("Something went wrong");
      expect(screen.getByText("Paused")).toBeVisible();
    });
  });

  describe("when extending", () => {
    const openDialog = async () => {
      await userEvent.click(await screen.findByRole("button", { name: "Extend" }));

      return screen.findByRole("dialog", { name: "Extend carefully" });
    };

    it("adds the chosen minutes to the countdown", async () => {
      const create = vi
        .spyOn(timeLogExtensionsApi, "create")
        .mockResolvedValue({ timeLog: { ...TIME_LOG, bufferMinutes: 10 } });
      renderTimer(TIME_LOG);

      const dialog = await openDialog();
      expect(within(dialog).getByText("60 min")).toBeVisible();
      await userEvent.click(within(dialog).getByRole("button", { name: "+10" }));

      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      expect(create).toHaveBeenCalledWith({ timeLogId: TIME_LOG.id, minutes: 10 }, expect.anything());
      expect(screen.getByRole("timer")).toHaveTextContent("34:23");
    });

    it.each(["+5", "+10", "+15", "+20", "+30", "+60"])("offers %s on a new session", async (name) => {
      renderTimer(TIME_LOG);

      expect(within(await openDialog()).getByRole("button", { name })).toBeEnabled();
    });

    it("limits the options after an earlier extension", async () => {
      const create = vi.spyOn(timeLogExtensionsApi, "create");
      renderTimer({ ...TIME_LOG, bufferMinutes: 50 });

      const dialog = await openDialog();

      expect(within(dialog).getByText("10 min")).toBeVisible();
      ["+5", "+10"].forEach((name) => {
        expect(within(dialog).getByRole("button", { name })).toBeEnabled();
      });
      ["+15", "+20", "+30", "+60"].forEach((name) => {
        expect(within(dialog).getByRole("button", { name })).toBeDisabled();
      });
      expect(create).not.toHaveBeenCalled();
    });

    it("can't be opened once the limit is used", async () => {
      renderTimer({ ...TIME_LOG, bufferMinutes: 60 });

      expect(await screen.findByRole("button", { name: "Extend" })).toBeDisabled();
    });

    it("keeps the dialog open and shows the error when extending fails", async () => {
      vi.spyOn(timeLogExtensionsApi, "create").mockRejectedValue(
        new ApiError(422, "This session is already finished."),
      );
      renderTimer(TIME_LOG);

      const dialog = await openDialog();
      await userEvent.click(within(dialog).getByRole("button", { name: "+5" }));

      expect(await within(dialog).findByRole("alert")).toHaveTextContent("This session is already finished.");
    });

    it("counts the buffer in the time left", async () => {
      renderTimer({ ...TIME_LOG, bufferMinutes: 5, accumulatedElapsedSeconds: 60 });

      expect(await screen.findByRole("timer")).toHaveTextContent("28:23");
    });
  });

  describe("when bailing out before two minutes", () => {
    const openDialog = async () => {
      await userEvent.click(await screen.findByRole("button", { name: "Bail" }));

      return screen.findByRole("dialog", { name: "Discard this timer?" });
    };

    it("discards the timer on confirming", async () => {
      const destroy = vi.spyOn(timeLogsApi, "destroy").mockImplementation(() => {
        vi.spyOn(currentTimeLogsApi, "show").mockResolvedValue({ timeLog: null });

        return Promise.resolve({} as AxiosResponse);
      });
      const bailOut = vi.spyOn(timeLogBailOutsApi, "create");
      renderTimer(TIME_LOG);

      const dialog = await openDialog();
      await userEvent.click(within(dialog).getByRole("button", { name: "Discard timer" }));

      expect(await screen.findByRole("heading", { name: "Start a session" })).toBeVisible();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(destroy).toHaveBeenCalledWith(TIME_LOG.id, expect.anything());
      expect(bailOut).not.toHaveBeenCalled();
    });

    it("warns one second before the limit", async () => {
      renderTimer({ ...TIME_LOG_AT_TWO_MINUTES, accumulatedElapsedSeconds: 82 });

      expect(await openDialog()).toBeVisible();
    });

    it("counts only the time spent focusing", async () => {
      renderTimer({
        ...TIME_LOG,
        isRunning: false,
        currentRunStartedAt: null,
        accumulatedElapsedSeconds: 119,
      });

      expect(await openDialog()).toBeVisible();
    });

    it("keeps the session going when the warning is declined", async () => {
      const destroy = vi.spyOn(timeLogsApi, "destroy");
      renderTimer(TIME_LOG);

      const dialog = await openDialog();
      await userEvent.click(within(dialog).getByRole("button", { name: "Keep going" }));

      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      expect(screen.getByRole("timer")).toBeVisible();
      expect(destroy).not.toHaveBeenCalled();
    });

    it("keeps the dialog open and shows the error when discarding fails", async () => {
      vi.spyOn(timeLogsApi, "destroy").mockRejectedValue(new ApiError(500, "Something went wrong"));
      renderTimer(TIME_LOG);

      const dialog = await openDialog();
      await userEvent.click(within(dialog).getByRole("button", { name: "Discard timer" }));

      expect(await within(dialog).findByRole("alert")).toHaveTextContent("Something went wrong");
    });
  });

  describe("when bailing out after two minutes", () => {
    const openDialog = async () => {
      await userEvent.click(await screen.findByRole("button", { name: "Bail" }));

      return screen.findByRole("dialog", { name: "Leave breadcrumbs" });
    };

    const fillIn = async (dialog: HTMLElement) => {
      await userEvent.type(within(dialog).getByLabelText("What got done"), "Wrote the intro");
      await userEvent.type(within(dialog).getByLabelText("Very next step"), "Finish paragraph 2");
    };

    it("saves the breadcrumbs and ends the session", async () => {
      const create = vi.spyOn(timeLogBailOutsApi, "create").mockImplementation(() => {
        vi.spyOn(currentTimeLogsApi, "show").mockResolvedValue({ timeLog: null });

        return Promise.resolve({ timeLog: { ...TIME_LOG, isRunning: false, completedAt: STARTED_AT } });
      });
      renderTimer(TIME_LOG_AT_TWO_MINUTES);

      const dialog = await openDialog();
      await fillIn(dialog);
      await userEvent.click(within(dialog).getByRole("button", { name: "Save & exit" }));

      expect(await screen.findByRole("heading", { name: "Start a session" })).toBeVisible();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(create).toHaveBeenCalledWith(
        {
          timeLogId: TIME_LOG.id,
          discardOverrun: false,
          completedDescription: "Wrote the intro",
          restartDescription: "Finish paragraph 2",
        },
        expect.anything(),
      );
    });

    it("keeps saving disabled until the next step is filled in", async () => {
      renderTimer(TIME_LOG_AT_TWO_MINUTES);

      const dialog = await openDialog();
      const saveButton = within(dialog).getByRole("button", { name: "Save & exit" });
      expect(saveButton).toBeDisabled();

      await userEvent.type(within(dialog).getByLabelText("Very next step"), "   ");
      expect(saveButton).toBeDisabled();

      await userEvent.type(within(dialog).getByLabelText("Very next step"), "Finish paragraph 2");
      await waitFor(() => expect(saveButton).toBeEnabled());
    });

    it("saves without saying what got done", async () => {
      const create = vi
        .spyOn(timeLogBailOutsApi, "create")
        .mockResolvedValue({ timeLog: { ...TIME_LOG, isRunning: false, completedAt: STARTED_AT } });
      renderTimer(TIME_LOG_AT_TWO_MINUTES);

      const dialog = await openDialog();
      await userEvent.type(within(dialog).getByLabelText("Very next step"), "Finish paragraph 2");
      await userEvent.click(within(dialog).getByRole("button", { name: "Save & exit" }));

      await waitFor(() =>
        expect(create).toHaveBeenCalledWith(
          {
            timeLogId: TIME_LOG.id,
            discardOverrun: false,
            completedDescription: "",
            restartDescription: "Finish paragraph 2",
          },
          expect.anything(),
        ),
      );
    });

    it("keeps the session going when the dialog is dismissed", async () => {
      const create = vi.spyOn(timeLogBailOutsApi, "create");
      renderTimer(TIME_LOG_AT_TWO_MINUTES);

      await openDialog();
      await userEvent.click(screen.getByRole("button", { name: "Close" }));

      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      expect(screen.getByRole("timer")).toBeVisible();
      expect(create).not.toHaveBeenCalled();
    });

    it("keeps the dialog open and shows the error when saving fails", async () => {
      vi.spyOn(timeLogBailOutsApi, "create").mockRejectedValue(new ApiError(422, "Something went wrong"));
      renderTimer(TIME_LOG_AT_TWO_MINUTES);

      const dialog = await openDialog();
      await fillIn(dialog);
      await userEvent.click(within(dialog).getByRole("button", { name: "Save & exit" }));

      expect(await within(dialog).findByRole("alert")).toHaveTextContent("Something went wrong");
    });
  });

  describe("when the session is done", () => {
    const clickDone = async () => userEvent.click(await screen.findByRole("button", { name: "Done" }));

    const mockCompletion = (isFinishedEarly: boolean) =>
      vi.spyOn(timeLogCompletionsApi, "create").mockImplementation(() => {
        vi.spyOn(currentTimeLogsApi, "show").mockResolvedValue({ timeLog: null });

        return Promise.resolve({
          timeLog: { ...TIME_LOG, isRunning: false, completedAt: STARTED_AT, isFinishedEarly },
        });
      });

    it.each([
      ["timer", TIME_LOG],
      ["stopwatch", { ...TIME_LOG, mode: "stopwatch", timerPreset: null } satisfies TimeLog],
    ])("offers only to discard a %s under two minutes of focus", async (_, timeLog) => {
      const create = vi.spyOn(timeLogCompletionsApi, "create");
      const destroy = vi.spyOn(timeLogsApi, "destroy").mockImplementation(() => {
        vi.spyOn(currentTimeLogsApi, "show").mockResolvedValue({ timeLog: null });

        return Promise.resolve({} as AxiosResponse);
      });
      renderTimer({ ...timeLog, accumulatedElapsedSeconds: 82 });

      await clickDone();
      const dialog = await screen.findByRole("dialog", { name: "Discard this timer?" });
      expect(dialog).toHaveTextContent("too short to log");
      await userEvent.click(within(dialog).getByRole("button", { name: "Discard timer" }));

      expect(await screen.findByRole("heading", { name: "Start a session" })).toBeVisible();
      expect(destroy).toHaveBeenCalledWith(TIME_LOG.id, expect.anything());
      expect(create).not.toHaveBeenCalled();
      expect(screen.queryByRole("dialog", { name: /Finished/ })).not.toBeInTheDocument();
    });

    it("completes once two minutes of focus are in", async () => {
      const create = mockCompletion(false);
      renderTimer(TIME_LOG_AT_TWO_MINUTES);

      await clickDone();

      expect(await screen.findByRole("dialog", { name: /Finished!/ })).toBeVisible();
      expect(create).toHaveBeenCalledOnce();
    });

    it("completes the time log and celebrates finishing early", async () => {
      const create = mockCompletion(true);
      renderTimer(TIME_LOG_AT_TWO_MINUTES);

      await clickDone();

      const dialog = await screen.findByRole("dialog", { name: /Finished early!/ });
      expect(create).toHaveBeenCalledWith(
        { timeLogId: TIME_LOG.id, discardOverrun: false },
        expect.anything(),
      );
      expect(playCompletionSound).toHaveBeenCalledExactlyOnceWith("glass");
      expect(within(dialog).getByText("+1 early-finish boost")).toBeVisible();
    });

    it("leaves out the boost when the session didn't finish early", async () => {
      mockCompletion(false);
      renderTimer(TIME_LOG_AT_TWO_MINUTES);

      await clickDone();

      const dialog = await screen.findByRole("dialog", { name: /Finished!/ });
      expect(within(dialog).queryByText("+1 early-finish boost")).not.toBeInTheDocument();
    });

    it("offers to review the parking lot while thoughts from this session are parked", async () => {
      mockCompletion(true);
      renderTimer(TIME_LOG_AT_TWO_MINUTES, TASK, [buildParkingLotItem(), buildParkingLotItem()]);

      await clickDone();

      const dialog = await screen.findByRole("dialog", { name: /Finished early!/ });
      expect(await within(dialog).findByRole("link", { name: "Review parking lot · 2" })).toHaveAttribute(
        "href",
        routes.parkingLot,
      );
      expect(parkingLotItemsApi.fetchList).toHaveBeenCalledWith({ status: "parked", timeLogId: TIME_LOG.id });
    });

    describe("with nothing parked", () => {
      beforeEach(() => {
        // setTimeout too, for the fade; time still runs so Testing Library's waits work.
        vi.useFakeTimers({ shouldAdvanceTime: true });
        vi.setSystemTime(new Date(STARTED_AT).getTime() + 37_000);
      });

      const renderFinished = async () => {
        mockCompletion(true);
        renderTimer(TIME_LOG_AT_TWO_MINUTES);
        await clickDone();

        return screen.findByRole("dialog", { name: /Finished early!/ });
      };

      it("fades the dialog away on its own, then shows the setup", async () => {
        const dialog = await renderFinished();
        expect(within(dialog).queryByRole("link")).not.toBeInTheDocument();

        act(() => {
          vi.advanceTimersByTime(3900);
        });
        expect(screen.getByRole("dialog")).toBeVisible();

        act(() => {
          vi.advanceTimersByTime(200);
        });

        await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
        expect(await screen.findByRole("heading", { name: "Start a session" })).toBeVisible();
      });

      it("waits while the pointer is over the dialog", async () => {
        const dialog = await renderFinished();

        fireEvent.pointerEnter(dialog);
        act(() => {
          vi.advanceTimersByTime(10_000);
        });
        expect(screen.getByRole("dialog")).toBeVisible();

        fireEvent.pointerLeave(dialog);
        act(() => {
          vi.advanceTimersByTime(4000);
        });
        await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      });
    });

    it("shows the setup after closing the dialog", async () => {
      mockCompletion(true);
      renderTimer(TIME_LOG_AT_TWO_MINUTES);

      await clickDone();
      await userEvent.click(await screen.findByRole("button", { name: "Close" }));

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(await screen.findByRole("heading", { name: "Start a session" })).toBeVisible();
    });

    it("keeps the session and shows the error when completing fails", async () => {
      vi.spyOn(timeLogCompletionsApi, "create").mockRejectedValue(new ApiError(500, "Something went wrong"));
      renderTimer(TIME_LOG_AT_TWO_MINUTES);

      await clickDone();

      expect(await screen.findByRole("alert")).toHaveTextContent("Something went wrong");
      expect(screen.getByRole("timer")).toBeVisible();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(playCompletionSound).not.toHaveBeenCalled();
    });
  });

  describe("parking lot", () => {
    it("lists the thoughts parked during this session, oldest first", async () => {
      const older = buildParkingLotItem({ content: "Clean my scooter" });
      const newer = buildParkingLotItem({ content: "Is the shop open on Sunday?" });
      renderTimer(TIME_LOG, TASK, [older, newer]);

      const parkingLot = await screen.findByRole("region", { name: "Parking lot" });
      const thoughts = await within(parkingLot).findAllByRole("listitem");
      expect(thoughts.map((thought) => thought.textContent)).toEqual([
        expect.stringContaining("Clean my scooter"),
        expect.stringContaining("Is the shop open on Sunday?"),
      ]);
      expect(thoughts[0]).toHaveTextContent(/\d{2}:\d{2}/);
      expect(parkingLotItemsApi.fetchList).toHaveBeenCalledWith({
        status: "parked",
        timeLogId: TIME_LOG.id,
      });
    });

    it("invites a stray thought while the lot is empty", async () => {
      renderTimer(TIME_LOG);

      expect(await screen.findByText("Stray thought? Type it below.")).toBeVisible();
    });

    it("parks a thought and clears the input", async () => {
      const create = vi.spyOn(parkingLotItemsApi, "create").mockResolvedValue({
        parkingLotItem: buildParkingLotItem({ content: "Book a dentist" }),
      });
      renderTimer(TIME_LOG);

      const parkingLot = await screen.findByRole("region", { name: "Parking lot" });
      const input = within(parkingLot).getByRole("textbox", { name: "Thought to park" });
      await userEvent.type(input, "Book a dentist{Enter}");

      expect(create).toHaveBeenCalledWith(
        { content: "Book a dentist", timeLogId: TIME_LOG.id },
        expect.anything(),
      );
      expect(input).toHaveValue("");
    });

    it("asks for a thought instead of parking an empty one", async () => {
      const create = vi.spyOn(parkingLotItemsApi, "create");
      renderTimer(TIME_LOG);

      const parkingLot = await screen.findByRole("region", { name: "Parking lot" });
      await userEvent.type(within(parkingLot).getByRole("textbox", { name: "Thought to park" }), "  {Enter}");

      expect(await within(parkingLot).findByRole("alert")).toHaveTextContent(
        "Type the thought you want to park",
      );
      expect(create).not.toHaveBeenCalled();
    });

    it("is not shown without a session", async () => {
      renderTimer(null);

      expect(await screen.findByRole("heading", { name: "Start a session" })).toBeVisible();
      expect(screen.queryByRole("region", { name: "Parking lot" })).not.toBeInTheDocument();
    });
  });
});

import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AxiosResponse } from "axios";

import { ApiError } from "@/apis/axios";
import breaksApi from "@/apis/breaks";
import checklistItemsApi from "@/apis/checklist_items";
import currentTimeLogsApi from "@/apis/current_time_logs";
import tasksApi from "@/apis/tasks";
import timeLogBailOutsApi from "@/apis/time_log_bail_outs";
import timeLogCompletionsApi from "@/apis/time_log_completions";
import timeLogExtensionsApi from "@/apis/time_log_extensions";
import timeLogsApi from "@/apis/time_logs";
import type { Task, TimeLog } from "@/apis/types";
import Timer from "@/components/Timer";
import routes from "@/routes";
import { renderWithProviders } from "@/test/utils";

const STARTED_AT = "2026-11-05T10:00:00.000Z";

const TIME_LOG: TimeLog = {
  id: "5b7c9e14-2a3d-4f60-8e1b-6c4d2f0a9b37",
  taskId: "2f6e3c1a-0b7d-4c55-9a1e-7d0a4b8e1f23",
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
  id: TIME_LOG.taskId,
  title: "Draft permission",
  description: null,
  estimatedMinutes: 25,
  isDuration: false,
  isAllDay: false,
  isCompleted: false,
  startsAt: null,
  endsAt: null,
  createdAt: STARTED_AT,
  updatedAt: STARTED_AT,
  checklistItems: [
    { id: "8a1d5e02-3c4f-4e6b-b7a9-1c2d3e4f5a6b", title: "Camera statistics", isCompleted: false },
    { id: "9b2e6f13-4d5a-4f7c-a8ba-2d3e4f5a6b7c", title: "Cuba economics", isCompleted: true },
  ],
};

const renderTimer = (timeLog: TimeLog | null, task = TASK) => {
  vi.spyOn(currentTimeLogsApi, "show").mockResolvedValue({ timeLog });
  vi.spyOn(tasksApi, "show").mockResolvedValue({ task });
  renderWithProviders(<Timer />);
};

describe("Timer", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "Date"] });
    vi.setSystemTime(new Date(STARTED_AT).getTime() + 37_000);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("shows the task and its steps", async () => {
    renderTimer(TIME_LOG);

    expect(await screen.findByRole("heading", { name: "Draft permission" })).toBeVisible();
    expect(screen.getByRole("checkbox", { name: "Camera statistics" })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Cuba economics" })).toBeChecked();
  });

  it("shows the task's description as formatted text", async () => {
    renderTimer(TIME_LOG, { ...TASK, description: "Start with the **intro**\n\n- Cite sources" });

    const description = await screen.findByRole("region", { name: "Description" });
    // The viewer loads lazily, so wait for its content.
    expect((await within(description).findByText("intro")).tagName).toBe("STRONG");
    expect(within(description).getByRole("listitem")).toHaveTextContent("Cite sources");
  });

  it("leaves out the description when the task has none", async () => {
    renderTimer(TIME_LOG);

    await screen.findByRole("heading", { name: "Draft permission" });
    expect(screen.queryByRole("region", { name: "Description" })).not.toBeInTheDocument();
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

    it("offers the add button only while the task has no steps", async () => {
      renderTimer(TIME_LOG);

      expect(await screen.findByRole("checkbox", { name: FIRST_ITEM.title })).toBeVisible();
      expect(screen.queryByRole("button", { name: "Add step" })).not.toBeInTheDocument();
    });

    it("adds the first step from the button beside the title", async () => {
      const newItem = { id: "0c3f7a24-5e6b-4a8d-b9cb-3e4f5a6b7c8d", title: "Conclusion", isCompleted: false };
      const create = vi
        .spyOn(checklistItemsApi, "create")
        .mockResolvedValue({ task: { ...TASK, checklistItems: [newItem] } });
      renderTimer(TIME_LOG, { ...TASK, checklistItems: [] });

      await userEvent.click(await screen.findByRole("button", { name: "Add step" }));
      await userEvent.keyboard("Conclusion{Enter}");

      expect(create).toHaveBeenCalledWith({ taskId: TASK.id, title: "Conclusion" }, expect.anything());
      expect(await screen.findByRole("checkbox", { name: "Conclusion" })).not.toBeChecked();
      expect(screen.getByRole("textbox", { name: "New step" })).toHaveFocus();
      expect(screen.queryByRole("button", { name: "Add step" })).not.toBeInTheDocument();
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

    it("opens the first step row below the add button, which stays until a step is saved", async () => {
      renderTimer(TIME_LOG, { ...TASK, checklistItems: [] });

      const addButton = await screen.findByRole("button", { name: "Add step" });
      await userEvent.click(addButton);
      const newStep = screen.getByRole("textbox", { name: "New step" });

      expect(newStep).toHaveFocus();
      expect(addButton.compareDocumentPosition(newStep)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
      expect(screen.getByRole("button", { name: "Add step" })).toBeVisible();
    });

    it("takes a new step back out when saving it fails", async () => {
      vi.spyOn(checklistItemsApi, "create").mockRejectedValue(new ApiError(500, "Something went wrong"));
      renderTimer(TIME_LOG, { ...TASK, checklistItems: [] });

      await userEvent.click(await screen.findByRole("button", { name: "Add step" }));
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
    const DESCRIPTION = "Start with the **intro**";

    it("offers to add one when the task has none", async () => {
      renderTimer(TIME_LOG);

      await userEvent.click(await screen.findByRole("button", { name: "Add a description" }));

      expect(await screen.findByRole("textbox", { name: "Description" })).toBeVisible();
    });

    it("saves the description and shows it again", async () => {
      const update = vi
        .spyOn(tasksApi, "update")
        .mockResolvedValue({ task: { ...TASK, description: DESCRIPTION } });
      renderTimer(TIME_LOG, { ...TASK, description: DESCRIPTION });

      await userEvent.click(await screen.findByRole("button", { name: "Edit description" }));
      await screen.findByRole("textbox", { name: "Description" });
      await userEvent.click(screen.getByRole("button", { name: "Save" }));

      expect(update).toHaveBeenCalledWith({ id: TASK.id, description: DESCRIPTION }, expect.anything());
      expect(await screen.findByRole("region", { name: "Description" })).toBeVisible();
      expect(screen.queryByRole("textbox", { name: "Description" })).not.toBeInTheDocument();
    });

    it("keeps the editor open and shows the error when saving fails", async () => {
      vi.spyOn(tasksApi, "update").mockRejectedValue(new ApiError(500, "Something went wrong"));
      renderTimer(TIME_LOG, { ...TASK, description: DESCRIPTION });

      await userEvent.click(await screen.findByRole("button", { name: "Edit description" }));
      await screen.findByRole("textbox", { name: "Description" });
      await userEvent.click(screen.getByRole("button", { name: "Save" }));

      expect(await screen.findByRole("alert")).toHaveTextContent("Something went wrong");
      expect(screen.getByRole("textbox", { name: "Description" })).toBeVisible();
    });

    it("goes back to the saved description on Cancel", async () => {
      const update = vi.spyOn(tasksApi, "update");
      renderTimer(TIME_LOG, { ...TASK, description: DESCRIPTION });

      await userEvent.click(await screen.findByRole("button", { name: "Edit description" }));
      await screen.findByRole("textbox", { name: "Description" });
      await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

      expect(await screen.findByRole("region", { name: "Description" })).toBeVisible();
      expect(update).not.toHaveBeenCalled();
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

  it("offers to start a session when none is in progress", async () => {
    renderTimer(null);

    expect(await screen.findByRole("link", { name: "Start a session" })).toHaveAttribute("href", routes.root);
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
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

      expect(await screen.findByRole("heading", { name: "Nothing on the clock" })).toBeVisible();
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

      expect(await screen.findByRole("heading", { name: "Nothing on the clock" })).toBeVisible();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(create).toHaveBeenCalledWith(
        {
          timeLogId: TIME_LOG.id,
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
          { timeLogId: TIME_LOG.id, completedDescription: "", restartDescription: "Finish paragraph 2" },
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

    it("completes the time log and celebrates finishing early", async () => {
      const create = mockCompletion(true);
      renderTimer(TIME_LOG);

      await clickDone();

      const dialog = await screen.findByRole("dialog", { name: /Finished early!/ });
      expect(create).toHaveBeenCalledWith(TIME_LOG.id, expect.anything());
      expect(within(dialog).getByText("+1 early-finish boost")).toBeVisible();
      expect(within(dialog).getByRole("button", { name: /Add a progress screenshot/ })).toBeVisible();
      expect(within(dialog).getByRole("link", { name: "Move on to next" })).toHaveAttribute(
        "href",
        routes.root,
      );
    });

    it("leaves out the boost when the session didn't finish early", async () => {
      mockCompletion(false);
      renderTimer(TIME_LOG);

      await clickDone();

      const dialog = await screen.findByRole("dialog", { name: /Finished!/ });
      expect(within(dialog).queryByText("+1 early-finish boost")).not.toBeInTheDocument();
      expect(within(dialog).getByRole("link", { name: "Move on to next" })).toBeVisible();
    });

    it("shows that nothing is on the clock after closing the dialog", async () => {
      mockCompletion(true);
      renderTimer(TIME_LOG);

      await clickDone();
      await userEvent.click(await screen.findByRole("button", { name: "Close" }));

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(await screen.findByRole("heading", { name: "Nothing on the clock" })).toBeVisible();
    });

    it("keeps the session and shows the error when completing fails", async () => {
      vi.spyOn(timeLogCompletionsApi, "create").mockRejectedValue(new ApiError(500, "Something went wrong"));
      renderTimer(TIME_LOG);

      await clickDone();

      expect(await screen.findByRole("alert")).toHaveTextContent("Something went wrong");
      expect(screen.getByRole("timer")).toBeVisible();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});

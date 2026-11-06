import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ApiError } from "@/apis/axios";
import currentTimeLogsApi from "@/apis/current_time_logs";
import tasksApi from "@/apis/tasks";
import timeLogCompletionsApi from "@/apis/time_log_completions";
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
  accumulatedElapsedSeconds: 0,
  pauseCount: 0,
  isRunning: true,
  currentRunStartedAt: STARTED_AT,
  startedAt: STARTED_AT,
  completedAt: null,
  isFinishedEarly: false,
  createdAt: STARTED_AT,
  updatedAt: STARTED_AT,
};

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

import { QueryClient } from "@tanstack/react-query";
import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { addDays, format, startOfDay, subDays } from "date-fns";
import { Route, Routes, useLocation } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/apis/axios";
import currentTimeLogsApi from "@/apis/current_time_logs";
import homeTasksApi from "@/apis/home_tasks";
import tasksApi from "@/apis/tasks";
import timeLogBailOutsApi from "@/apis/time_log_bail_outs";
import type { Breadcrumb, HomeTasksResponse, Task, TimeLog } from "@/apis/types";
import userPreferencesApi from "@/apis/user_preferences";
import routes from "@/routes";
import { renderWithProviders } from "@/test/utils";
import { playCompletionSound } from "@/utils/completionSound";

import Home from ".";
import { DAY_REFRESH_INTERVAL } from "./constants";

vi.mock("@/utils/completionSound", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/utils/completionSound")>()),
  playCompletionSound: vi.fn(),
}));

const TODAY = startOfDay(new Date());
const LIFE_AREA_ID = "8d0f2b6e-4c1a-4e3b-9f7d-1a2b3c4d5e6f";
const OTHER_TASK_ID = "0c9d8e7f-6a5b-4c3d-2e1f-0a9b8c7d6e5f";

const buildTask = (id: string, fields: Partial<Task> = {}): Task => ({
  id,
  title: `Task ${id}`,
  description: null,
  estimatedMinutes: null,
  isDuration: false,
  isAllDay: false,
  isCompleted: false,
  startsAt: null,
  endsAt: null,
  lifeAreaId: null,
  createdAt: TODAY.toISOString(),
  updatedAt: TODAY.toISOString(),
  checklistItems: [],
  breadcrumbs: [],
  ...fields,
});

const buildBreadcrumb = (id: string, restartDescription: string): Breadcrumb => ({
  id,
  completedDescription: null,
  restartDescription,
  createdAt: new Date(2025, 10, 5, 17, 30).toISOString(),
});

const AGENDA_TASK = buildTask("a", {
  title: "Pay the bill",
  isAllDay: true,
  startsAt: TODAY.toISOString(),
  lifeAreaId: LIFE_AREA_ID,
});
const OVERDUE_TASK = buildTask("o", {
  title: "Renew passport",
  isDuration: true,
  startsAt: subDays(TODAY, 2).toISOString(),
  endsAt: subDays(TODAY, 1).toISOString(),
});
const RESUMABLE_TASK = buildTask("r", {
  title: "Write the report",
  breadcrumbs: [buildBreadcrumb("2", "Chapter 2"), buildBreadcrumb("1", "Chapter 1")],
});

const EMPTY: HomeTasksResponse = { today: [], overdue: [], resumable: [] };
const LISTS: HomeTasksResponse = {
  today: [AGENDA_TASK],
  overdue: [OVERDUE_TASK],
  resumable: [RESUMABLE_TASK],
};

const runningOn = (taskId: string): TimeLog => {
  const startedAt = new Date(Date.now() - 10 * 60_000).toISOString(); // 10 minutes ago

  return {
    id: "5b7c9e14-2a3d-4f60-8e1b-6c4d2f0a9b37",
    taskId,
    title: null,
    taskTitle: "Something else",
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
  };
};

const TimerPage = () => {
  const { state } = useLocation();

  return <p>Timer with {(state as { taskId?: string } | null)?.taskId ?? "nothing"} picked</p>;
};

const renderHome = () =>
  renderWithProviders(
    <Routes>
      <Route element={<Home />} path={routes.root} />
      <Route element={<TimerPage />} path={routes.timer} />
    </Routes>,
    new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  );

const card = (name: string) => within(screen.getByRole("region", { name }));

describe("Home", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(homeTasksApi, "fetchList").mockResolvedValue(LISTS);
    vi.spyOn(currentTimeLogsApi, "show").mockResolvedValue({ timeLog: null });
    vi.spyOn(userPreferencesApi, "show").mockRejectedValue(new ApiError(500, "Not needed"));
    vi.spyOn(tasksApi, "update").mockImplementation(({ id }) => Promise.resolve({ task: buildTask(id) }));
    vi.spyOn(tasksApi, "show").mockImplementation((id) => Promise.resolve({ task: buildTask(id) }));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("asks for the local day and lists its tasks under today's date", async () => {
    renderHome();

    expect(screen.getByRole("heading", { level: 1, name: format(TODAY, "EEEE, d MMMM") })).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Task" })).toBeVisible();
    expect(await screen.findByText("1 on today's agenda, 1 overdue")).toBeVisible();
    expect(homeTasksApi.fetchList).toHaveBeenCalledWith({
      from: TODAY.toISOString(),
      to: addDays(TODAY, 1).toISOString(),
    });

    const agenda = card("Today's agenda");
    expect(agenda.getByRole("link", { name: "Pay the bill" })).toHaveAttribute(
      "href",
      `/areas/${LIFE_AREA_ID}/a`,
    );
    expect(agenda.getByText("Today")).toBeVisible();
    expect(agenda.getByRole("link", { name: "Today's agenda" })).toHaveAttribute("href", routes.calendar);

    const overdue = card("Overdue");
    expect(overdue.getByRole("link", { name: "Renew passport" })).toHaveAttribute("href", "/inbox/o");
    expect(overdue.getByText(/Yesterday/)).toHaveClass("text-destructive");

    const resumable = card("Pick up where you left off");
    expect(resumable.getByText("Pick up from: Chapter 2")).toBeVisible();
    expect(resumable.queryByText(/Chapter 1/)).not.toBeInTheDocument();
    expect(resumable.getByText("Nov 5 2025, 5:30pm")).toBeVisible();
  });

  it("says when there's nothing in a list", async () => {
    vi.mocked(homeTasksApi.fetchList).mockResolvedValue(EMPTY);
    renderHome();

    expect(await screen.findByText("Your day is clear.")).toBeVisible();
    expect(screen.getByText("Nothing is due or scheduled today.")).toBeVisible();
    expect(screen.getByText("Nothing overdue.")).toBeVisible();
    expect(
      screen.getByText("When you bail out of a session, the note you leave yourself shows up here."),
    ).toBeVisible();
  });

  it("shows five tasks until all are asked for", async () => {
    const today = Array.from({ length: 7 }, (_, index) => buildTask(String(index)));
    vi.mocked(homeTasksApi.fetchList).mockResolvedValue({ ...EMPTY, today });
    renderHome();

    const showAll = await screen.findByRole("button", { name: "Show all 7" });
    expect(card("Today's agenda").getAllByRole("listitem")).toHaveLength(5);

    await userEvent.click(showAll);

    expect(card("Today's agenda").getAllByRole("listitem")).toHaveLength(7);
    expect(showAll).not.toBeInTheDocument();
  });

  it("completes a task with the chime, and refreshes the lists", async () => {
    renderHome();
    const checkbox = await screen.findByRole("checkbox", { name: "Complete Pay the bill" });
    vi.mocked(homeTasksApi.fetchList).mockResolvedValue({ ...LISTS, today: [] });

    await userEvent.click(checkbox);

    expect(playCompletionSound).toHaveBeenCalled();
    expect(vi.mocked(tasksApi.update).mock.lastCall?.[0]).toEqual({ id: "a", isCompleted: true });
    expect(await screen.findByText("Nothing is due or scheduled today.")).toBeVisible();
  });

  it("moves an overdue task to today as an all-day date", async () => {
    renderHome();

    await userEvent.click(await screen.findByRole("button", { name: "Move Renew passport to today" }));

    expect(vi.mocked(tasksApi.update).mock.lastCall?.[0]).toEqual({
      id: "o",
      isDuration: false,
      isAllDay: true,
      startsAt: TODAY.toISOString(),
      endsAt: null,
    });
  });

  it("shows why a task couldn't be moved", async () => {
    vi.mocked(tasksApi.update).mockRejectedValue(new ApiError(422, "Something went wrong"));
    renderHome();

    await userEvent.click(await screen.findByRole("button", { name: "Move Renew passport to today" }));

    expect(await card("Overdue").findByRole("alert")).toHaveTextContent("Something went wrong");
  });

  it("resumes a task on the Timer", async () => {
    renderHome();

    await userEvent.click(await screen.findByRole("button", { name: "Resume: Write the report" }));

    expect(screen.getByText("Timer with r picked")).toBeVisible();
  });

  it("leads to the Timer for the task already on the clock", async () => {
    vi.mocked(currentTimeLogsApi.show).mockResolvedValue({ timeLog: runningOn("r") });
    renderHome();

    await userEvent.click(await screen.findByRole("button", { name: "On the clock: Write the report" }));

    expect(screen.getByText("Timer with nothing picked")).toBeVisible();
  });

  it("switches from another session, even when the row is pushed out of the list by its breadcrumb", async () => {
    const resumable = Array.from({ length: 5 }, (_, index) => buildTask(String(index)));
    vi.mocked(homeTasksApi.fetchList).mockResolvedValue({ ...EMPTY, resumable });
    const timeLog = runningOn(OTHER_TASK_ID);
    vi.mocked(currentTimeLogsApi.show).mockResolvedValue({ timeLog });
    vi.spyOn(timeLogBailOutsApi, "create").mockImplementation(() => {
      vi.mocked(currentTimeLogsApi.show).mockResolvedValue({ timeLog: null });
      vi.mocked(homeTasksApi.fetchList).mockResolvedValue({
        ...EMPTY,
        resumable: [buildTask(OTHER_TASK_ID), ...resumable],
      });

      return Promise.resolve({ timeLog });
    });
    renderHome();
    await screen.findByRole("link", { name: "Return to timer" });

    await userEvent.click(await screen.findByRole("button", { name: "Resume: Task 4" }));
    const dialog = within(await screen.findByRole("dialog", { name: "Switch tasks?" }));
    await userEvent.click(dialog.getByRole("button", { name: "Bail out" }));
    await userEvent.type(screen.getByLabelText("Very next step"), "Chapter 3");
    await userEvent.click(screen.getByRole("button", { name: "Save & exit" }));

    expect(await screen.findByText("Timer with 4 picked")).toBeVisible();
  });

  it("shows an error from loading the lists, with Quick start still there", async () => {
    vi.mocked(homeTasksApi.fetchList).mockRejectedValue(new ApiError(500, "Something went wrong"));
    renderHome();

    expect(await screen.findByRole("alert")).toHaveTextContent("Something went wrong");
    expect(screen.getByRole("textbox", { name: "Task" })).toBeVisible();
    expect(screen.queryByRole("heading", { name: "Overdue" })).not.toBeInTheDocument();
  });

  it("moves on to the next day at midnight", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true, now: new Date(2026, 10, 25, 23, 59, 30) });
    renderHome();
    expect(screen.getByRole("heading", { level: 1, name: "Wednesday, 25 November" })).toBeVisible();

    act(() => vi.advanceTimersByTime(DAY_REFRESH_INTERVAL));

    expect(screen.getByRole("heading", { level: 1, name: "Thursday, 26 November" })).toBeVisible();
    await waitFor(() =>
      expect(homeTasksApi.fetchList).toHaveBeenLastCalledWith({
        from: new Date(2026, 10, 26).toISOString(),
        to: new Date(2026, 10, 27).toISOString(),
      }),
    );
  });
});

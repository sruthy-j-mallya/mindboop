import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/apis/axios";
import currentTimeLogsApi from "@/apis/current_time_logs";
import lifeAreasApi from "@/apis/life_areas";
import taskCountsApi from "@/apis/task_counts";
import taskRestorationsApi from "@/apis/task_restorations";
import tasksApi from "@/apis/tasks";
import type { LifeArea, Task } from "@/apis/types";
import LifeAreas from "@/components/LifeAreas";
import { Toaster } from "@/components/ui/sonner";
import routes from "@/routes";
import { renderWithProviders } from "@/test/utils";

import Completed from "./Completed";
import Deleted from "./Deleted";

const AT = "2026-11-05T10:00:00.000Z";

const WORK: LifeArea = {
  id: "8d0f2b6e-4c1a-4e3b-9f7d-1a2b3c4d5e6f",
  name: "Work",
  color: "indigo",
  emoji: "💼",
  defaultSound: "none",
  isDeleted: false,
  createdAt: AT,
  updatedAt: AT,
};

const TASK: Task = {
  id: "2f6e3c1a-0b7d-4c55-9a1e-7d0a4b8e1f23",
  title: "Pay rent",
  description: null,
  estimatedMinutes: null,
  isDuration: false,
  isAllDay: false,
  isCompleted: false,
  startsAt: null,
  endsAt: null,
  lifeAreaId: null,
  createdAt: AT,
  updatedAt: AT,
  checklistItems: [],
  breadcrumbs: [],
};

const listOf = (tasks: Task[]) => ({ tasks, tasksCount: tasks.length, page: 1, totalPages: 1 });

const renderArchive = (path: string) =>
  renderWithProviders(
    <>
      <Routes>
        <Route element={<LifeAreas />}>
          <Route element={<Completed />} path={routes.completedTasks} />
          <Route element={<Deleted />} path={routes.deletedTasks} />
        </Route>
      </Routes>
      <Toaster />
    </>,
    undefined,
    path,
  );

describe("TaskArchive", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Sonner keeps its toasts in module state and replays the active ones to each new Toaster.
    toast.dismiss();
    vi.spyOn(currentTimeLogsApi, "show").mockResolvedValue({ timeLog: null });
    vi.spyOn(taskCountsApi, "fetchList").mockResolvedValue({ taskCounts: [] });
    vi.spyOn(lifeAreasApi, "fetchList").mockResolvedValue({ lifeAreas: [WORK] });
  });

  it("lists completed tasks from every list, and reopens one", async () => {
    const task = { ...TASK, isCompleted: true, lifeAreaId: WORK.id };
    const fetchList = vi
      .spyOn(tasksApi, "fetchList")
      .mockResolvedValueOnce(listOf([task]))
      .mockResolvedValue(listOf([]));
    const update = vi.spyOn(tasksApi, "update").mockResolvedValue({ task: { ...task, isCompleted: false } });
    renderArchive(routes.completedTasks);

    const list = await screen.findByRole("list", { name: "Completed tasks" });
    expect(await within(list).findByText("Work")).toBeVisible();
    expect(fetchList).toHaveBeenCalledWith({ isCompleted: true, page: 1 });
    await userEvent.click(within(list).getByRole("button", { name: "Reopen Pay rent" }));

    expect(await screen.findByText("Reopened “Pay rent” to Work")).toBeVisible();
    expect(update.mock.lastCall?.[0]).toEqual({ id: task.id, isCompleted: false });
    expect(await screen.findByText("Nothing completed yet")).toBeVisible();
  });

  it("lists deleted tasks with when they were deleted, and restores one to where it goes now", async () => {
    const task = { ...TASK, lifeAreaId: WORK.id, discardedAt: new Date().toISOString() };
    const fetchList = vi
      .spyOn(tasksApi, "fetchList")
      .mockResolvedValueOnce(listOf([task]))
      .mockResolvedValue(listOf([]));
    // Its area has been deleted since.
    const restore = vi.spyOn(taskRestorationsApi, "create").mockResolvedValue({ task: TASK });
    renderArchive(routes.deletedTasks);

    const list = await screen.findByRole("list", { name: "Deleted tasks" });
    expect(fetchList).toHaveBeenCalledWith({ isDeleted: true, page: 1 });
    expect(within(list).getByText(/^Deleted \d/)).toBeVisible();
    await userEvent.click(within(list).getByRole("button", { name: "Restore Pay rent" }));

    expect(await screen.findByText("Restored “Pay rent” to your Inbox")).toBeVisible();
    expect(restore.mock.lastCall?.[0]).toBe(task.id);
    expect(await screen.findByText("Nothing deleted")).toBeVisible();
  });

  it("says when a restored task is still completed", async () => {
    const task = { ...TASK, isCompleted: true, discardedAt: AT };
    vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([task]));
    vi.spyOn(taskRestorationsApi, "create").mockResolvedValue({ task });
    renderArchive(routes.deletedTasks);

    await userEvent.click(await screen.findByRole("button", { name: "Restore Pay rent" }));

    expect(await screen.findByText("Restored “Pay rent” to Completed")).toBeVisible();
  });

  it("shows why a task couldn't be restored, and keeps it listed", async () => {
    vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([{ ...TASK, discardedAt: AT }]));
    vi.spyOn(taskRestorationsApi, "create").mockRejectedValue(new ApiError(404, "Record not found."));
    renderArchive(routes.deletedTasks);

    await userEvent.click(await screen.findByRole("button", { name: "Restore Pay rent" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Record not found.");
    expect(screen.getByRole("button", { name: "Restore Pay rent" })).toBeEnabled();
  });

  it("is reached from below the Inbox", async () => {
    vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([]));
    renderArchive(routes.completedTasks);

    const nav = within(screen.getByRole("navigation", { name: "Areas of life" }));
    expect(nav.getByRole("link", { name: "Completed" })).toHaveAttribute("aria-current", "page");
    await userEvent.click(nav.getByRole("link", { name: "Deleted" }));

    expect(await screen.findByRole("heading", { name: "Deleted" })).toBeVisible();
  });
});

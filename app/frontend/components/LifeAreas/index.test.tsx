import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { generatePath, Route, Routes, useLocation } from "react-router";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/apis/axios";
import currentTimeLogsApi from "@/apis/current_time_logs";
import lifeAreasApi from "@/apis/life_areas";
import taskCountsApi from "@/apis/task_counts";
import tasksApi from "@/apis/tasks";
import type { LifeArea, Task } from "@/apis/types";
import userPreferencesApi from "@/apis/user_preferences";
import LifeAreas from "@/components/LifeAreas";
import TaskBoard from "@/components/LifeAreas/TaskBoard";
import NoTaskSelected from "@/components/LifeAreas/TaskBoard/NoTaskSelected";
import TaskPane from "@/components/LifeAreas/TaskBoard/TaskPane";
import { Toaster } from "@/components/ui/sonner";
import routes from "@/routes";
import { renderWithProviders } from "@/test/utils";

const CREATED_AT = "2026-11-05T10:00:00.000Z";

const buildLifeArea = (overrides: Partial<LifeArea> = {}): LifeArea => ({
  id: crypto.randomUUID(),
  name: "Work",
  color: "indigo",
  emoji: "💼",
  defaultSound: "rain",
  isDeleted: false,
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
  ...overrides,
});

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
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
  checklistItems: [],
  breadcrumbs: [],
  ...overrides,
});

const listOf = (tasks: Task[]) => ({ tasks, tasksCount: tasks.length, page: 1, totalPages: 1 });

const CurrentPath = () => <p data-testid="path">{useLocation().pathname}</p>;

const renderLifeAreas = (initialPath: string = routes.inbox.index) =>
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
      </Routes>
      <CurrentPath />
      <Toaster />
    </>,
    undefined,
    initialPath,
  );

const areaPath = (lifeAreaId: string) => generatePath(routes.lifeAreas.show, { lifeAreaId });

describe("LifeAreas", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    toast.dismiss();
    vi.spyOn(userPreferencesApi, "show").mockResolvedValue({
      userPreference: {
        theme: "system",
        completionSound: "bell",
        breakAlarmSound: "classic",
        weekStartsOn: 1,
        timeFormat: "12h",
      },
    });
    vi.spyOn(currentTimeLogsApi, "show").mockResolvedValue({ timeLog: null });
    vi.spyOn(taskCountsApi, "fetchList").mockResolvedValue({ taskCounts: [] });
    vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([]));
  });

  it("suggests areas until there are some, adding all those picked at once", async () => {
    const health = buildLifeArea({ name: "Health" });
    const fetchList = vi.spyOn(lifeAreasApi, "fetchList").mockResolvedValue({ lifeAreas: [] });
    const create = vi.spyOn(lifeAreasApi, "create").mockResolvedValue({ lifeArea: health });
    renderLifeAreas();

    const nav = screen.getByRole("navigation", { name: "Areas of life" });
    expect(within(nav).getByRole("link", { name: "Inbox" })).toHaveAttribute("aria-current", "page");
    const suggestions = await within(nav).findByRole("list", { name: "Suggested areas" });
    expect(
      within(suggestions)
        .getAllByRole("button", { pressed: false })
        .map((chip) => chip.getAttribute("aria-label")),
    ).toEqual(["Work", "Health", "Relationships", "Household", "Leisure", "Learning", "Finances"]);
    expect(within(nav).getByRole("button", { name: "Add areas" })).toBeDisabled();
    expect(within(nav).queryByRole("button", { name: "Add an area" })).not.toBeInTheDocument();

    for (const name of ["Health", "Work", "Leisure", "Leisure"]) {
      await userEvent.click(within(suggestions).getByRole("button", { name }));
    }
    expect(within(suggestions).getByRole("button", { name: "Work", pressed: true })).toBeInTheDocument();
    expect(within(suggestions).getByRole("button", { name: "Leisure", pressed: false })).toBeInTheDocument();
    expect(create).not.toHaveBeenCalled();

    fetchList.mockResolvedValue({ lifeAreas: [buildLifeArea(), health] });
    await userEvent.click(within(nav).getByRole("button", { name: "Add 2 areas" }));

    expect(await within(nav).findByRole("link", { name: "Work" })).toBeInTheDocument();
    expect(create.mock.calls.map(([payload]) => payload)).toEqual([
      { name: "Work", color: "indigo", emoji: "💼", defaultSound: "rain" },
      { name: "Health", color: "emerald", emoji: "🩺", defaultSound: "waves" },
    ]);
    expect(
      within(nav)
        .getAllByRole("link")
        .map((link) => link.textContent),
    ).toEqual([
      "Inbox",
      "Completed",
      "Trash",
      expect.stringContaining("Work"),
      expect.stringContaining("Health"),
    ]);
    expect(within(nav).queryByRole("list", { name: "Suggested areas" })).not.toBeInTheDocument();
    expect(within(nav).getByRole("button", { name: "Add an area" })).toBeInTheDocument();
    expect(within(nav).queryByRole("button", { name: "Suggested areas" })).not.toBeInTheDocument();
  });

  it("lists the areas added before one that fails, and shows its error", async () => {
    const fetchList = vi.spyOn(lifeAreasApi, "fetchList").mockResolvedValue({ lifeAreas: [] });
    vi.spyOn(lifeAreasApi, "create")
      .mockResolvedValueOnce({ lifeArea: buildLifeArea() })
      .mockRejectedValueOnce(new ApiError(500, "Something went wrong"));
    renderLifeAreas();

    const nav = screen.getByRole("navigation", { name: "Areas of life" });
    await userEvent.click(await within(nav).findByRole("button", { name: "Work" }));
    await userEvent.click(within(nav).getByRole("button", { name: "Health" }));
    fetchList.mockResolvedValue({ lifeAreas: [buildLifeArea()] });
    await userEvent.click(within(nav).getByRole("button", { name: "Add 2 areas" }));

    expect(await within(nav).findByRole("link", { name: "Work" })).toBeInTheDocument();
    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
  });

  it("adds an area from the dialog and opens it", async () => {
    const lifeArea = buildLifeArea({ name: "Garden", color: "lime", emoji: "🌱", defaultSound: "wind" });
    vi.spyOn(lifeAreasApi, "fetchList").mockResolvedValue({ lifeAreas: [] });
    const create = vi.spyOn(lifeAreasApi, "create").mockResolvedValue({ lifeArea });
    renderLifeAreas();

    await userEvent.click(await screen.findByRole("button", { name: "Add your own" }));
    const dialog = screen.getByRole("dialog", { name: "New area of life" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Add area" }));
    expect(within(dialog).getByText("Give the area a name")).toBeInTheDocument();
    expect(create).not.toHaveBeenCalled();

    await userEvent.type(within(dialog).getByRole("textbox", { name: "Name" }), "  Garden ");
    await userEvent.click(within(dialog).getByRole("radio", { name: "Lime" }));
    await userEvent.click(within(dialog).getByRole("button", { name: "Emoji: sparkles" }));
    await userEvent.type(screen.getByRole("searchbox", { name: "Search emojis" }), "seedling");
    await userEvent.click(await screen.findByRole("gridcell", { name: "seedling" }));
    expect(within(dialog).getByRole("button", { name: "Emoji: seedling" })).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("radio", { name: "Wind" }));
    vi.mocked(lifeAreasApi.fetchList).mockResolvedValue({ lifeAreas: [lifeArea] });
    await userEvent.click(within(dialog).getByRole("button", { name: "Add area" }));

    expect(create).toHaveBeenCalledWith(
      { name: "Garden", color: "lime", emoji: "🌱", defaultSound: "wind" },
      expect.anything(),
    );
    await waitFor(() => expect(screen.getByTestId("path")).toHaveTextContent(areaPath(lifeArea.id)));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Garden" })).toBeInTheDocument();
  });

  it("shows the server's error when adding an area fails", async () => {
    vi.spyOn(lifeAreasApi, "fetchList").mockResolvedValue({ lifeAreas: [] });
    vi.spyOn(lifeAreasApi, "create").mockRejectedValue(new ApiError(422, "Name has already been taken"));
    renderLifeAreas();

    await userEvent.click(await screen.findByRole("button", { name: "Add your own" }));
    const dialog = screen.getByRole("dialog", { name: "New area of life" });
    await userEvent.type(within(dialog).getByRole("textbox", { name: "Name" }), "Work");
    await userEvent.click(within(dialog).getByRole("button", { name: "Add area" }));

    expect(await within(dialog).findByRole("alert")).toHaveTextContent("Name has already been taken");
  });

  it("lists an area's tasks and adds new ones to it", async () => {
    const lifeArea = buildLifeArea();
    const task = buildTask({ title: "Plan the sprint", lifeAreaId: lifeArea.id });
    vi.spyOn(lifeAreasApi, "fetchList").mockResolvedValue({ lifeAreas: [lifeArea] });
    const fetchTasks = vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([task]));
    const create = vi.spyOn(tasksApi, "create").mockResolvedValue({ task });
    renderLifeAreas(areaPath(lifeArea.id));

    expect(await screen.findByRole("heading", { name: "Work" })).toBeInTheDocument();
    expect(await screen.findByRole("textbox", { name: "Plan the sprint" })).toBeInTheDocument();
    expect(fetchTasks).toHaveBeenCalledWith({ isCompleted: false, lifeAreaId: lifeArea.id, page: 1 });
    expect(screen.getByRole("link", { name: "Work" })).toHaveAttribute("aria-current", "page");

    await userEvent.type(screen.getByRole("textbox", { name: "New task" }), "Review the PRs{Enter}");

    expect(create).toHaveBeenCalledWith(
      { title: "Review the PRs", lifeAreaId: lifeArea.id },
      expect.anything(),
    );
  });

  it("shows how many tasks are in the Inbox and each area, and refreshes the counts when one is added", async () => {
    const work = buildLifeArea();
    const health = buildLifeArea({ name: "Health" });
    vi.spyOn(lifeAreasApi, "fetchList").mockResolvedValue({ lifeAreas: [work, health] });
    vi.spyOn(tasksApi, "create").mockResolvedValue({ task: buildTask() });
    const fetchCounts = vi.spyOn(taskCountsApi, "fetchList").mockResolvedValue({
      taskCounts: [
        { lifeAreaId: null, tasksCount: 1 },
        { lifeAreaId: work.id, tasksCount: 12 },
      ],
    });
    renderLifeAreas();

    const inbox = screen.getByRole("link", { name: "Inbox" });
    await waitFor(() => expect(inbox).toHaveAccessibleDescription("1 task"));
    expect(within(inbox).getByText("1")).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: "Work" })).toHaveAccessibleDescription("12 tasks");
    expect(screen.getByRole("link", { name: "Health" })).not.toHaveAccessibleDescription();

    fetchCounts.mockResolvedValue({ taskCounts: [{ lifeAreaId: null, tasksCount: 2 }] });
    await userEvent.type(screen.getByRole("textbox", { name: "New task" }), "Call the bank{Enter}");

    await waitFor(() => expect(inbox).toHaveAccessibleDescription("2 tasks"));
  });

  it("leaves deleted areas out of the sidebar, and leads back to the Inbox from one", async () => {
    const deleted = buildLifeArea({ isDeleted: true });
    vi.spyOn(lifeAreasApi, "fetchList").mockResolvedValue({
      lifeAreas: [deleted, buildLifeArea({ name: "Health" })],
    });
    renderLifeAreas(areaPath(deleted.id));

    expect(await screen.findByRole("link", { name: "Health" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Work" })).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId("path")).toHaveTextContent(routes.inbox.index));
  });

  it("still shows a deleted area on a completed task in it, without offering it", async () => {
    const deleted = buildLifeArea({ isDeleted: true });
    const task = buildTask({ isCompleted: true, lifeAreaId: deleted.id });
    vi.spyOn(lifeAreasApi, "fetchList").mockResolvedValue({ lifeAreas: [deleted] });
    vi.spyOn(tasksApi, "show").mockResolvedValue({ task });
    renderLifeAreas(generatePath(routes.inbox.show, { taskId: task.id }));

    await userEvent.click(await screen.findByRole("button", { name: "Area of life: Work" }));

    const picker = await screen.findByRole("dialog", { name: "Areas of life" });
    expect(within(picker).getByRole("button", { name: "Inbox" })).toHaveAttribute("aria-pressed", "false");
    expect(within(picker).queryByRole("button", { name: "Work" })).not.toBeInTheDocument();
  });

  it("says so when an area has no tasks", async () => {
    const lifeArea = buildLifeArea({ name: "Health" });
    vi.spyOn(lifeAreasApi, "fetchList").mockResolvedValue({ lifeAreas: [lifeArea] });
    renderLifeAreas(areaPath(lifeArea.id));

    expect(await screen.findByText("Nothing in Health yet")).toBeInTheDocument();
  });

  it("opens an area's task beside its list", async () => {
    const lifeArea = buildLifeArea();
    const task = buildTask({ title: "Plan the sprint", lifeAreaId: lifeArea.id });
    vi.spyOn(lifeAreasApi, "fetchList").mockResolvedValue({ lifeAreas: [lifeArea] });
    vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([task]));
    vi.spyOn(tasksApi, "show").mockResolvedValue({ task });
    renderLifeAreas(areaPath(lifeArea.id));

    await userEvent.click(await screen.findByRole("textbox", { name: "Plan the sprint" }));

    expect(screen.getByTestId("path")).toHaveTextContent(
      generatePath(routes.lifeAreas.task, { lifeAreaId: lifeArea.id, taskId: task.id }),
    );
    expect(await screen.findByRole("heading", { name: "Plan the sprint" })).toBeInTheDocument();
  });

  it("leads back to the Inbox from an area that isn't there", async () => {
    vi.spyOn(lifeAreasApi, "fetchList").mockResolvedValue({ lifeAreas: [] });
    renderLifeAreas(areaPath(crypto.randomUUID()));

    await waitFor(() => expect(screen.getByTestId("path")).toHaveTextContent(routes.inbox.index));
    expect(await screen.findByRole("heading", { name: "Inbox" })).toBeInTheDocument();
  });

  it("has a handle to reorder each area, but not the Inbox", async () => {
    vi.spyOn(lifeAreasApi, "fetchList").mockResolvedValue({
      lifeAreas: [buildLifeArea(), buildLifeArea({ name: "Health" })],
    });
    renderLifeAreas();

    expect(await screen.findByRole("button", { name: "Reorder Work" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reorder Health" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reorder Inbox" })).not.toBeInTheDocument();
  });

  it("edits an area from its right-click menu in the sidebar", async () => {
    const lifeArea = buildLifeArea();
    vi.spyOn(lifeAreasApi, "fetchList").mockResolvedValue({ lifeAreas: [lifeArea] });
    const update = vi.spyOn(lifeAreasApi, "update").mockResolvedValue({ lifeArea });
    renderLifeAreas(areaPath(lifeArea.id));

    fireEvent.contextMenu(await screen.findByRole("link", { name: "Work" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Edit" }));
    const dialog = screen.getByRole("dialog", { name: "Edit Work" });
    expect(within(dialog).getByRole("radio", { name: "Indigo" })).toBeChecked();
    expect(within(dialog).getByRole("button", { name: "Emoji: briefcase" })).toBeInTheDocument();
    expect(within(dialog).getByRole("radio", { name: "Rain" })).toBeChecked();

    const name = within(dialog).getByRole("textbox", { name: "Name" });
    await userEvent.clear(name);
    await userEvent.type(name, "Career");
    await userEvent.click(within(dialog).getByRole("radio", { name: "None" }));
    await userEvent.click(within(dialog).getByRole("button", { name: "Save" }));

    expect(update).toHaveBeenCalledWith(
      { id: lifeArea.id, name: "Career", color: "indigo", emoji: "💼", defaultSound: "none" },
      expect.anything(),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  const openDeleteDialog = async (name: string) => {
    fireEvent.contextMenu(await screen.findByRole("link", { name }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Delete" }));

    return screen.getByRole("dialog", { name: `Delete ${name}?` });
  };

  const clickDelete = async (dialog: HTMLElement) => {
    const button = within(dialog).getByRole("button", { name: "Delete area" });
    await waitFor(() => expect(button).toHaveAttribute("aria-disabled", "false"));
    await userEvent.click(button);
  };

  it("focuses the delete button, so Enter deletes the area once its tasks are checked", async () => {
    const work = buildLifeArea();
    vi.spyOn(lifeAreasApi, "fetchList").mockResolvedValue({ lifeAreas: [work] });
    const fetchTasks = vi.spyOn(tasksApi, "fetchList");
    const destroy = vi.spyOn(lifeAreasApi, "destroy").mockResolvedValue({} as never);
    renderLifeAreas();
    await screen.findByRole("link", { name: "Work" });
    let finishCheck = () => {};
    fetchTasks.mockReturnValue(
      new Promise((resolve) => {
        finishCheck = () => resolve(listOf([]));
      }),
    );

    const dialog = await openDeleteDialog("Work");
    const button = within(dialog).getByRole("button", { name: "Delete area" });
    await waitFor(() => expect(button).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    expect(destroy).not.toHaveBeenCalled();

    finishCheck();
    await waitFor(() => expect(button).toHaveAttribute("aria-disabled", "false"));
    expect(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");

    expect(destroy).toHaveBeenCalledWith({ id: work.id, tasksLifeAreaId: undefined }, expect.anything());
  });

  it("asks which list to move a deleted area's tasks to, and opens it", async () => {
    const work = buildLifeArea();
    const health = buildLifeArea({ name: "Health" });
    vi.spyOn(lifeAreasApi, "fetchList").mockResolvedValue({ lifeAreas: [work, health] });
    const fetchTasks = vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([buildTask()]));
    const destroy = vi.spyOn(lifeAreasApi, "destroy").mockResolvedValue({} as never);
    renderLifeAreas(areaPath(work.id));

    fireEvent.contextMenu(await screen.findByRole("link", { name: "Work" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Edit" }));
    await userEvent.click(
      within(screen.getByRole("dialog", { name: "Edit Work" })).getByRole("button", { name: "Delete area" }),
    );
    const dialog = screen.getByRole("dialog", { name: "Delete Work?" });
    expect(destroy).not.toHaveBeenCalled();
    const picker = await within(dialog).findByRole("combobox", { name: "Move tasks to" });
    expect(fetchTasks).toHaveBeenCalledWith({ isCompleted: false, lifeAreaId: work.id });
    expect(picker).toHaveTextContent("Inbox");
    await userEvent.click(picker);
    expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual(["Inbox", "Health"]);
    await userEvent.click(screen.getByRole("option", { name: "Health" }));

    // At once, so the list can refresh before the router has moved to the new one.
    vi.mocked(lifeAreasApi.fetchList).mockResolvedValue({ lifeAreas: [health] });
    await clickDelete(dialog);

    expect(destroy).toHaveBeenCalledWith({ id: work.id, tasksLifeAreaId: health.id }, expect.anything());
    expect(await screen.findByText("Deleted Work and moved its tasks to Health")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId("path")).toHaveTextContent(areaPath(health.id)));
  });

  it("moves a deleted area's tasks to the Inbox when that's picked, staying on the list in view", async () => {
    const work = buildLifeArea();
    const health = buildLifeArea({ name: "Health" });
    vi.spyOn(lifeAreasApi, "fetchList").mockResolvedValue({ lifeAreas: [work, health] });
    vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([buildTask()]));
    const destroy = vi.spyOn(lifeAreasApi, "destroy").mockResolvedValue({} as never);
    renderLifeAreas(areaPath(health.id));

    const cancelled = await openDeleteDialog("Work");
    await userEvent.click(within(cancelled).getByRole("button", { name: "Cancel" }));
    expect(destroy).not.toHaveBeenCalled();

    const dialog = await openDeleteDialog("Work");
    await within(dialog).findByRole("combobox", { name: "Move tasks to" });
    vi.mocked(lifeAreasApi.fetchList).mockResolvedValue({ lifeAreas: [health] });
    await clickDelete(dialog);

    expect(destroy).toHaveBeenCalledWith({ id: work.id, tasksLifeAreaId: undefined }, expect.anything());
    expect(await screen.findByText("Deleted Work and moved its tasks to Inbox")).toBeInTheDocument();
    expect(screen.getByTestId("path")).toHaveTextContent(areaPath(health.id));
    await waitFor(() => expect(screen.queryByRole("link", { name: "Work" })).not.toBeInTheDocument());
  });

  it("says a deleted area's tasks go to the Inbox when there's no other area", async () => {
    vi.spyOn(lifeAreasApi, "fetchList").mockResolvedValue({ lifeAreas: [buildLifeArea()] });
    vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([buildTask()]));
    renderLifeAreas();

    const dialog = await openDeleteDialog("Work");

    expect(await within(dialog).findByText("Its uncompleted tasks move to the Inbox.")).toBeInTheDocument();
    expect(within(dialog).queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("deletes an empty area without asking where its tasks go", async () => {
    const work = buildLifeArea();
    const health = buildLifeArea({ name: "Health" });
    vi.spyOn(lifeAreasApi, "fetchList").mockResolvedValue({ lifeAreas: [work, health] });
    const destroy = vi.spyOn(lifeAreasApi, "destroy").mockResolvedValue({} as never);
    renderLifeAreas(areaPath(work.id));

    const dialog = await openDeleteDialog("Work");
    expect(await within(dialog).findByText("It has no uncompleted tasks.")).toBeInTheDocument();
    expect(within(dialog).queryByRole("combobox")).not.toBeInTheDocument();
    vi.mocked(lifeAreasApi.fetchList).mockResolvedValue({ lifeAreas: [health] });
    await clickDelete(dialog);

    expect(destroy).toHaveBeenCalledWith({ id: work.id, tasksLifeAreaId: undefined }, expect.anything());
    expect(await screen.findByText("Deleted Work")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId("path")).toHaveTextContent(routes.inbox.index));
  });

  it("shows the server's error when deleting an area fails", async () => {
    vi.spyOn(lifeAreasApi, "fetchList").mockResolvedValue({ lifeAreas: [buildLifeArea()] });
    vi.spyOn(lifeAreasApi, "destroy").mockRejectedValue(new ApiError(404, "Record not found."));
    renderLifeAreas();

    const dialog = await openDeleteDialog("Work");
    await clickDelete(dialog);

    expect(await within(dialog).findByRole("alert")).toHaveTextContent("Record not found.");
  });

  it("moves the open task to another area from its pane, which follows it", async () => {
    const lifeArea = buildLifeArea();
    const task = buildTask({ title: "Plan the sprint" });
    vi.spyOn(lifeAreasApi, "fetchList").mockResolvedValue({ lifeAreas: [lifeArea] });
    vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([task]));
    vi.spyOn(tasksApi, "show").mockResolvedValue({ task });
    const update = vi
      .spyOn(tasksApi, "update")
      .mockResolvedValue({ task: { ...task, lifeAreaId: lifeArea.id } });
    renderLifeAreas(generatePath(routes.inbox.show, { taskId: task.id }));

    const pane = await screen.findByRole("article");
    await userEvent.click(await within(pane).findByRole("button", { name: "Area of life: Inbox" }));
    const picker = await screen.findByRole("dialog", { name: "Areas of life" });
    expect(within(picker).getByRole("button", { name: "Inbox" })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(within(picker).getByRole("button", { name: "Work" }));

    expect(update).toHaveBeenCalledWith({ id: task.id, lifeAreaId: lifeArea.id }, expect.anything());
    await waitFor(() =>
      expect(screen.getByTestId("path")).toHaveTextContent(
        generatePath(routes.lifeAreas.task, { lifeAreaId: lifeArea.id, taskId: task.id }),
      ),
    );
  });
});

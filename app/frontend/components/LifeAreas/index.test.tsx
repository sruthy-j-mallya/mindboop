import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { generatePath, Route, Routes, useLocation } from "react-router";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/apis/axios";
import currentTimeLogsApi from "@/apis/current_time_logs";
import lifeAreasApi from "@/apis/life_areas";
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
  icon: "briefcase",
  defaultSound: "rain",
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
      },
    });
    vi.spyOn(currentTimeLogsApi, "show").mockResolvedValue({ timeLog: null });
    vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf([]));
  });

  it("lists the Inbox and the areas, and suggests areas until there are some", async () => {
    const fetchList = vi.spyOn(lifeAreasApi, "fetchList").mockResolvedValue({ lifeAreas: [] });
    const create = vi.spyOn(lifeAreasApi, "create").mockResolvedValue({ lifeArea: buildLifeArea() });
    renderLifeAreas();

    const nav = screen.getByRole("navigation", { name: "Areas of life" });
    expect(within(nav).getByRole("link", { name: "Inbox" })).toHaveAttribute("aria-current", "page");
    const suggestions = await within(nav).findByRole("list", { name: "Suggested areas" });
    expect(
      within(suggestions)
        .getAllByRole("button")
        .map((chip) => chip.getAttribute("aria-label")),
    ).toEqual([
      "Add Work",
      "Add Health",
      "Add Relationships",
      "Add Household",
      "Add Leisure",
      "Add Learning",
      "Add Finances",
    ]);

    fetchList.mockResolvedValue({ lifeAreas: [buildLifeArea()] });
    await userEvent.click(within(suggestions).getByRole("button", { name: "Add Work" }));

    expect(create).toHaveBeenCalledWith(
      { name: "Work", color: "indigo", icon: "briefcase", defaultSound: "rain" },
      expect.anything(),
    );
    expect(await within(nav).findByRole("link", { name: "Work" })).toBeInTheDocument();
    expect(within(nav).queryByRole("list", { name: "Suggested areas" })).not.toBeInTheDocument();
  });

  it("offers only the suggestions not added yet behind the bulb", async () => {
    vi.spyOn(lifeAreasApi, "fetchList").mockResolvedValue({
      lifeAreas: [buildLifeArea({ name: "work" }), buildLifeArea({ name: "Health" })],
    });
    renderLifeAreas();

    await userEvent.click(await screen.findByRole("button", { name: "Suggested areas" }));

    const suggestions = await screen.findByRole("list", { name: "Suggested areas" });
    const names = within(suggestions)
      .getAllByRole("button")
      .map((chip) => chip.getAttribute("aria-label"));
    expect(names).not.toContain("Add Work");
    expect(names).not.toContain("Add Health");
    expect(names).toContain("Add Leisure");
  });

  it("adds an area from the dialog and opens it", async () => {
    const lifeArea = buildLifeArea({ name: "Garden", color: "lime", icon: "sprout", defaultSound: "wind" });
    vi.spyOn(lifeAreasApi, "fetchList").mockResolvedValue({ lifeAreas: [] });
    const create = vi.spyOn(lifeAreasApi, "create").mockResolvedValue({ lifeArea });
    renderLifeAreas();

    await userEvent.click(screen.getByRole("button", { name: "Add an area" }));
    const dialog = screen.getByRole("dialog", { name: "New area of life" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Add area" }));
    expect(within(dialog).getByText("Give the area a name")).toBeInTheDocument();
    expect(create).not.toHaveBeenCalled();

    await userEvent.type(within(dialog).getByRole("textbox", { name: "Name" }), "  Garden ");
    await userEvent.click(within(dialog).getByRole("radio", { name: "Lime" }));
    await userEvent.click(within(dialog).getByRole("radio", { name: "Sprout" }));
    await userEvent.click(within(dialog).getByRole("radio", { name: "Wind" }));
    vi.mocked(lifeAreasApi.fetchList).mockResolvedValue({ lifeAreas: [lifeArea] });
    await userEvent.click(within(dialog).getByRole("button", { name: "Add area" }));

    expect(create).toHaveBeenCalledWith(
      { name: "Garden", color: "lime", icon: "sprout", defaultSound: "wind" },
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

    await userEvent.click(screen.getByRole("button", { name: "Add an area" }));
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

  it("searches the list by title", async () => {
    vi.spyOn(lifeAreasApi, "fetchList").mockResolvedValue({ lifeAreas: [] });
    const fetchTasks = vi
      .spyOn(tasksApi, "fetchList")
      .mockImplementation(({ searchTerm } = {}) =>
        Promise.resolve(listOf(searchTerm ? [] : [buildTask({ title: "Call the bank" })])),
      );
    renderLifeAreas();

    expect(await screen.findByRole("textbox", { name: "Call the bank" })).toBeInTheDocument();
    await userEvent.type(screen.getByRole("searchbox", { name: "Search tasks" }), " dentist ");

    expect(await screen.findByText("No tasks match “dentist”")).toBeInTheDocument();
    expect(fetchTasks).toHaveBeenCalledWith({
      isCompleted: false,
      isInInbox: true,
      searchTerm: "dentist",
      page: 1,
    });

    await userEvent.type(screen.getByRole("searchbox", { name: "Search tasks" }), "{Escape}");

    expect(await screen.findByRole("textbox", { name: "Call the bank" })).toBeInTheDocument();
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
    expect(within(dialog).getByRole("radio", { name: "Briefcase" })).toBeChecked();
    expect(within(dialog).getByRole("radio", { name: "Rain" })).toBeChecked();

    const name = within(dialog).getByRole("textbox", { name: "Name" });
    await userEvent.clear(name);
    await userEvent.type(name, "Career");
    await userEvent.click(within(dialog).getByRole("radio", { name: "Keep the current sound" }));
    await userEvent.click(within(dialog).getByRole("button", { name: "Save" }));

    expect(update).toHaveBeenCalledWith(
      { id: lifeArea.id, name: "Career", color: "indigo", icon: "briefcase", defaultSound: "none" },
      expect.anything(),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("deletes an area after a second click and goes back to the Inbox", async () => {
    const lifeArea = buildLifeArea();
    vi.spyOn(lifeAreasApi, "fetchList").mockResolvedValue({ lifeAreas: [lifeArea] });
    const destroy = vi.spyOn(lifeAreasApi, "destroy").mockResolvedValue({} as never);
    renderLifeAreas(areaPath(lifeArea.id));

    fireEvent.contextMenu(await screen.findByRole("link", { name: "Work" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Edit" }));
    const dialog = screen.getByRole("dialog", { name: "Edit Work" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Delete area" }));
    expect(destroy).not.toHaveBeenCalled();
    expect(
      within(dialog).getByText("Deleting the area moves its tasks back to the Inbox."),
    ).toBeInTheDocument();

    vi.mocked(lifeAreasApi.fetchList).mockResolvedValue({ lifeAreas: [] });
    await userEvent.click(within(dialog).getByRole("button", { name: "Delete area and move tasks" }));

    expect(destroy).toHaveBeenCalledWith(lifeArea.id, expect.anything());
    await waitFor(() => expect(screen.getByTestId("path")).toHaveTextContent(routes.inbox.index));
    expect(await screen.findByText("Deleted Work. Its tasks are back in the Inbox.")).toBeInTheDocument();
  });

  it("deletes an area from its right-click menu, staying on the list in view", async () => {
    const lifeArea = buildLifeArea();
    vi.spyOn(lifeAreasApi, "fetchList").mockResolvedValue({ lifeAreas: [lifeArea] });
    const destroy = vi.spyOn(lifeAreasApi, "destroy").mockResolvedValue({} as never);
    renderLifeAreas();

    fireEvent.contextMenu(await screen.findByRole("link", { name: "Work" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Delete" }));
    const dialog = screen.getByRole("dialog", { name: "Delete Work?" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(destroy).not.toHaveBeenCalled();

    fireEvent.contextMenu(screen.getByRole("link", { name: "Work" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Delete" }));
    vi.mocked(lifeAreasApi.fetchList).mockResolvedValue({ lifeAreas: [] });
    await userEvent.click(
      within(screen.getByRole("dialog", { name: "Delete Work?" })).getByRole("button", {
        name: "Delete area",
      }),
    );

    expect(destroy).toHaveBeenCalledWith(lifeArea.id, expect.anything());
    expect(await screen.findByText("Deleted Work. Its tasks are back in the Inbox.")).toBeInTheDocument();
    expect(screen.getByTestId("path")).toHaveTextContent(routes.inbox.index);
    await waitFor(() => expect(screen.queryByRole("link", { name: "Work" })).not.toBeInTheDocument());
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

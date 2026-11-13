import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { generatePath, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/apis/axios";
import tasksApi from "@/apis/tasks";
import type { Task } from "@/apis/types";
import Inbox from "@/components/Inbox";
import NoTaskSelected from "@/components/Inbox/NoTaskSelected";
import TaskPane from "@/components/Inbox/TaskPane";
import routes from "@/routes";
import { renderWithProviders } from "@/test/utils";

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
  createdAt: "2026-11-05T10:00:00.000Z",
  updatedAt: "2026-11-05T10:00:00.000Z",
  checklistItems: [],
  ...overrides,
});

const listOf = (tasks: Task[]) => ({ tasks, tasksCount: tasks.length, page: 1, totalPages: 1 });

const renderInbox = (initialPath: string = routes.inbox.index) =>
  renderWithProviders(
    <Routes>
      <Route element={<Inbox />} path={routes.inbox.index}>
        <Route index element={<NoTaskSelected />} />
        <Route element={<TaskPane />} path={routes.inbox.show} />
      </Route>
    </Routes>,
    undefined,
    initialPath,
  );

describe("Inbox", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("lists only incomplete tasks", async () => {
    const fetchList = vi
      .spyOn(tasksApi, "fetchList")
      .mockResolvedValue(listOf([buildTask({ title: "First" }), buildTask({ title: "Second" })]));

    renderInbox();

    expect(await screen.findByRole("link", { name: "First" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Second" })).toBeInTheDocument();
    expect(fetchList).toHaveBeenCalledWith({ isCompleted: false, page: 1 });
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

    await waitFor(() => expect(create).toHaveBeenCalledWith({ title: "Call the bank" }, expect.anything()));
    expect(await screen.findByRole("link", { name: "Call the bank" })).toBeInTheDocument();
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
    await userEvent.click(await screen.findByRole("link", { name: /Plan the trip/ }));

    expect(await screen.findByRole("heading", { name: "Plan the trip" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Plan the trip/ })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("list", { name: "Steps" })).toHaveTextContent("Book flights");
    expect(show).toHaveBeenCalledWith(task.id);
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
  });
});

import { useState } from "react";

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocation } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import lifeAreasApi from "@/apis/life_areas";
import tasksApi from "@/apis/tasks";
import type { LifeArea, Task } from "@/apis/types";
import { renderWithProviders } from "@/test/utils";
import { getTaskPath } from "@/utils";

import GlobalSearch from ".";

const CREATED_AT = "2026-11-05T10:00:00.000Z";

const LIFE_AREA: LifeArea = {
  id: crypto.randomUUID(),
  name: "Work",
  color: "indigo",
  emoji: "💼",
  defaultSound: "rain",
  isDeleted: false,
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
};

const buildTask = (overrides: Partial<Task> = {}): Task => ({
  id: crypto.randomUUID(),
  title: "Buy an umbrella",
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

const SearchHarness = () => {
  const [isOpen, setIsOpen] = useState(true);

  return <GlobalSearch isOpen={isOpen} onOpenChange={setIsOpen} />;
};

const renderSearch = (tasks: Task[]) => {
  vi.spyOn(tasksApi, "fetchList").mockResolvedValue(listOf(tasks));
  renderWithProviders(
    <>
      <SearchHarness />
      <CurrentPath />
    </>,
  );

  return screen.getByRole("combobox", { name: "Search tasks" });
};

describe("GlobalSearch", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(lifeAreasApi, "fetchList").mockResolvedValue({ lifeAreas: [LIFE_AREA] });
  });

  it("searches every list, with what matched and the list each task is in", async () => {
    const input = renderSearch([
      buildTask(),
      buildTask({ title: "Errands", description: "Return the **umbrella**", lifeAreaId: LIFE_AREA.id }),
      buildTask({
        title: "Pack",
        checklistItems: [
          {
            id: crypto.randomUUID(),
            title: "Fold the umbrella",
            isCompleted: false,
          },
        ],
      }),
    ]);

    await userEvent.type(input, " umbrella ");

    expect(await screen.findByRole("option", { name: /Buy an umbrella.*Inbox/ })).toBeInTheDocument();
    expect(await screen.findByRole("option", { name: /Errands.*Work.*Return the/ })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Pack.*Step: Fold the umbrella/ })).toBeInTheDocument();
    expect(tasksApi.fetchList).toHaveBeenCalledExactlyOnceWith({
      isCompleted: false,
      isSearchingDetails: true,
      searchTerm: "umbrella",
    });
  });

  it("opens the highlighted task in its list on Enter and closes", async () => {
    const task = buildTask({ title: "Umbrella stand", lifeAreaId: LIFE_AREA.id });
    const input = renderSearch([buildTask(), task]);

    await userEvent.type(input, "umbrella");
    await screen.findByRole("option", { name: /Umbrella stand/ });
    await userEvent.keyboard("{ArrowDown}{Enter}");

    expect(screen.getByTestId("path")).toHaveTextContent(getTaskPath(task.id, LIFE_AREA.id));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens a clicked task", async () => {
    const task = buildTask();
    const input = renderSearch([task]);

    await userEvent.type(input, "umbrella");
    await userEvent.click(await screen.findByRole("option"));

    expect(screen.getByTestId("path")).toHaveTextContent(getTaskPath(task.id));
  });

  it("says when nothing matches, and closes on Escape", async () => {
    const input = renderSearch([]);

    await userEvent.type(input, "umbrella");
    expect(await screen.findByText("No open tasks match “umbrella”")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("doesn't search until something is typed", async () => {
    const input = renderSearch([]);

    await userEvent.type(input, "  ");

    expect(tasksApi.fetchList).not.toHaveBeenCalled();
  });
});

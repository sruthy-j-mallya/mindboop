import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { generatePath, Route, Routes, useLocation } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/apis/axios";
import currentTimeLogsApi from "@/apis/current_time_logs";
import routineTimeLogsApi from "@/apis/routine_time_logs";
import routinesApi from "@/apis/routines";
import timeLogsApi from "@/apis/time_logs";
import type { Routine, TimeLog } from "@/apis/types";
import Routines from "@/components/Routines";
import NoRoutineSelected from "@/components/Routines/NoRoutineSelected";
import RoutinePane from "@/components/Routines/RoutinePane";
import routes from "@/routes";
import { renderWithProviders } from "@/test/utils";

const CREATED_AT = "2026-11-05T10:00:00.000Z";

const buildRoutine = (overrides: Partial<Routine> = {}): Routine => ({
  id: crypto.randomUUID(),
  title: "Meditation",
  emoji: "🧘",
  color: "violet",
  sound: "bells",
  durationMinutes: 10,
  reminderTime: null,
  reminderDays: [],
  sessionsCount: 0,
  totalSeconds: 0,
  lastDoneAt: null,
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
  ...overrides,
});

const CurrentPath = () => <p data-testid="path">{useLocation().pathname}</p>;

const routinePath = (routineId: string) => generatePath(routes.routines.show, { routineId });

const renderRoutines = (routines: Routine[], initialPath: string = routes.routines.index) => {
  vi.spyOn(routinesApi, "fetchList").mockResolvedValue({ routines });
  vi.spyOn(routineTimeLogsApi, "fetchList").mockResolvedValue({ timeLogs: [] });
  vi.spyOn(currentTimeLogsApi, "show").mockResolvedValue({ timeLog: null });

  return renderWithProviders(
    <>
      <Routes>
        <Route element={<Routines />} path={routes.routines.index}>
          <Route index element={<NoRoutineSelected />} />
          <Route element={<RoutinePane />} path={routes.routines.show} />
        </Route>
        <Route element={<p>Timer page</p>} path={routes.timer} />
      </Routes>
      <CurrentPath />
    </>,
    undefined,
    initialPath,
  );
};

describe("Routines", () => {
  beforeEach(() => {
    vi.spyOn(routinesApi, "create");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("offers ideas to start with until there's a routine, adding the ones picked in one go, in order", async () => {
    const create = vi
      .mocked(routinesApi.create)
      .mockResolvedValue({ routine: buildRoutine({ title: "Shower" }) });
    renderRoutines([]);

    const add = await screen.findByRole("button", { name: "Pick some to add" });
    expect(add).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: /Meditation/ }));
    await userEvent.click(screen.getByRole("button", { name: /Shower/ }));
    await userEvent.click(screen.getByRole("button", { name: /Reading/ }));
    await userEvent.click(screen.getByRole("button", { name: /Reading/ }));
    expect(screen.getByRole("button", { name: /Shower/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /Reading/ })).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(screen.getByRole("button", { name: "Add 2 routines" }));

    await waitFor(() => expect(create).toHaveBeenCalledTimes(2));
    expect(create.mock.calls.map(([payload]) => payload.title)).toEqual(["Shower", "Meditation"]);
    expect(create.mock.calls[0][0]).toMatchObject({
      emoji: "🛁",
      durationMinutes: 15,
      reminderTime: null,
    });
  });

  it("keeps the ideas that couldn't be added picked, to try again", async () => {
    vi.mocked(routinesApi.create)
      .mockResolvedValueOnce({ routine: buildRoutine({ title: "Shower" }) })
      .mockRejectedValueOnce(new ApiError(422, "Title is too long"));
    renderRoutines([]);

    await userEvent.click(await screen.findByRole("button", { name: /Shower/ }));
    await userEvent.click(screen.getByRole("button", { name: /Meditation/ }));
    await userEvent.click(screen.getByRole("button", { name: "Add 2 routines" }));

    expect(await screen.findByRole("button", { name: "Add 1 routine" })).toBeEnabled();
    expect(screen.getByRole("button", { name: /Meditation/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /Shower/ })).toHaveAttribute("aria-pressed", "false");
  });

  it("lists routines with how long they take and when they were last done", async () => {
    renderRoutines([
      buildRoutine(),
      buildRoutine({ title: "Fold clothes", durationMinutes: 15, lastDoneAt: new Date().toISOString() }),
    ]);

    const list = await screen.findByRole("list", { name: "Routines" });
    const [meditation, foldClothes] = within(list).getAllByRole("listitem");
    expect(meditation).toHaveTextContent("Meditation10 min·Not yet");
    expect(foldClothes).toHaveTextContent("Fold clothes15 min·Today");
    expect(screen.queryByText("Ideas to start with")).not.toBeInTheDocument();
  });

  it("adds a routine with a reminder on the days picked", async () => {
    const meditation = buildRoutine();
    const routine = buildRoutine({ title: "Shower" });
    const create = vi.mocked(routinesApi.create).mockResolvedValue({ routine });
    renderRoutines([meditation]);
    // The list refetches with the new routine before its pane opens.
    vi.mocked(routinesApi.fetchList).mockResolvedValue({ routines: [meditation, routine] });

    await userEvent.click(await screen.findByRole("button", { name: "New routine" }));
    const dialog = await screen.findByRole("dialog");
    await userEvent.type(within(dialog).getByLabelText("Name"), "Shower");
    await userEvent.click(within(dialog).getByRole("button", { name: "15 min" }));
    await userEvent.click(within(dialog).getByRole("button", { name: "Emoji: sparkles" }));
    await userEvent.type(await screen.findByRole("searchbox", { name: "Search emojis" }), "bathtub");
    await userEvent.click(await screen.findByRole("gridcell", { name: "bathtub" }));
    await userEvent.click(within(dialog).getByRole("radio", { name: "Custom" }));
    await userEvent.click(within(dialog).getByRole("button", { name: "Monday" }));
    await userEvent.click(within(dialog).getByRole("button", { name: "Friday" }));
    await userEvent.click(within(dialog).getByRole("button", { name: "Add routine" }));

    await waitFor(() =>
      expect(create).toHaveBeenCalledWith(
        {
          title: "Shower",
          durationMinutes: 15,
          emoji: "🛁",
          color: "indigo",
          sound: "none",
          reminderTime: "09:00",
          reminderDays: [1, 5],
        },
        expect.anything(),
      ),
    );
    await waitFor(() => expect(screen.getByTestId("path")).toHaveTextContent(routinePath(routine.id)));
  });

  it("asks for a day when a custom reminder has none", async () => {
    renderRoutines([buildRoutine()]);

    await userEvent.click(await screen.findByRole("button", { name: "New routine" }));
    const dialog = await screen.findByRole("dialog");
    await userEvent.type(within(dialog).getByLabelText("Name"), "Shower");
    await userEvent.click(within(dialog).getByRole("radio", { name: "Custom" }));
    await userEvent.click(within(dialog).getByRole("button", { name: "Add routine" }));

    expect(await within(dialog).findByText("Pick a day")).toBeVisible();
    expect(routinesApi.create).not.toHaveBeenCalled();
  });

  it("shows only what was done in the pane, never what wasn't", async () => {
    const routine = buildRoutine({
      sessionsCount: 11,
      totalSeconds: 7140,
      lastDoneAt: new Date().toISOString(),
      reminderTime: "08:30",
      reminderDays: [1],
    });
    renderRoutines([routine], routinePath(routine.id));

    expect(await screen.findByRole("heading", { name: "Meditation" })).toBeVisible();
    expect(screen.getByText(/^Mondays at 8:30/)).toBeVisible();
    expect(screen.getByText("Times done").nextSibling).toHaveTextContent("11");
    expect(screen.getByText("Time given").nextSibling).toHaveTextContent("1 h 59 min");
    expect(screen.getByText(/Every time counts/)).toBeVisible();
    expect(screen.queryByText(/streak/i)).not.toBeInTheDocument();
  });

  it("starts the routine's timer and opens the Timer", async () => {
    const routine = buildRoutine();
    const create = vi.spyOn(timeLogsApi, "create").mockResolvedValue({
      timeLog: { id: crypto.randomUUID(), routineId: routine.id, completedAt: null } as TimeLog,
    });
    renderRoutines([routine]);

    await userEvent.click(await screen.findByRole("button", { name: "Start: Meditation" }));

    await waitFor(() =>
      expect(create).toHaveBeenCalledWith({ routineId: routine.id, mode: "timer" }, expect.anything()),
    );
    await waitFor(() => expect(screen.getByTestId("path")).toHaveTextContent(routes.timer));
  });

  it("edits a routine from its right-click menu", async () => {
    const routine = buildRoutine();
    const update = vi.spyOn(routinesApi, "update").mockResolvedValue({ routine });
    renderRoutines([routine]);

    const row = (await screen.findByRole("link", { name: /Meditation/ })).closest("li")!;
    fireEvent.contextMenu(row);
    await userEvent.click(await screen.findByRole("menuitem", { name: "Edit" }));
    const dialog = await screen.findByRole("dialog");
    await userEvent.clear(within(dialog).getByLabelText("Name"));
    await userEvent.type(within(dialog).getByLabelText("Name"), "Morning meditation");
    await userEvent.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith(
        expect.objectContaining({ id: routine.id, title: "Morning meditation" }),
        expect.anything(),
      ),
    );
  });

  it("deletes another routine from its right-click menu, keeping the open one in view", async () => {
    const open = buildRoutine();
    const other = buildRoutine({ title: "Shower" });
    const destroy = vi.spyOn(routinesApi, "destroy").mockResolvedValue({} as never);
    renderRoutines([open, other], routinePath(open.id));

    const row = (await screen.findByRole("link", { name: /Shower/ })).closest("li")!;
    fireEvent.contextMenu(row);
    await userEvent.click(await screen.findByRole("menuitem", { name: "Delete" }));
    await userEvent.click(
      within(await screen.findByRole("dialog")).getByRole("button", { name: "Delete routine" }),
    );

    await waitFor(() => expect(destroy).toHaveBeenCalledWith(other.id, expect.anything()));
    expect(screen.getByTestId("path")).toHaveTextContent(routinePath(open.id));
  });

  it("deletes a routine after asking, then goes back to the list", async () => {
    const routine = buildRoutine();
    const destroy = vi.spyOn(routinesApi, "destroy").mockResolvedValue({} as never);
    renderRoutines([routine], routinePath(routine.id));

    await userEvent.click(await screen.findByRole("button", { name: "More actions" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Delete" }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent("The time you’ve already spent on it stays on your Calendar.");
    await userEvent.click(within(dialog).getByRole("button", { name: "Delete routine" }));

    await waitFor(() => expect(destroy).toHaveBeenCalledWith(routine.id, expect.anything()));
    await waitFor(() => expect(screen.getByTestId("path")).toHaveTextContent(routes.routines.index));
  });
});

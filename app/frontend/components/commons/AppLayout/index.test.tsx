import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { format } from "date-fns";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import currentTimeLogsApi from "@/apis/current_time_logs";
import lifeAreasApi from "@/apis/life_areas";
import parkingLotItemsApi from "@/apis/parking_lot_items";
import routinesApi from "@/apis/routines";
import tasksApi from "@/apis/tasks";
import type { Routine, Task, TimeLog } from "@/apis/types";
import userPreferencesApi from "@/apis/user_preferences";
import { playSound } from "@/components/commons/Ambience/utils";
import AppLayout from "@/components/commons/AppLayout";
import routes from "@/routes";
import useAmbienceStore from "@/stores/useAmbienceStore";
import { renderWithProviders } from "@/test/utils";

vi.mock("@/components/commons/Ambience/utils", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/components/commons/Ambience/utils")>()),
  playSound: vi.fn(),
}));

const STARTED_AT = "2026-11-05T10:00:00.000Z";

const LIFE_AREA_ID = "8d0f2b6e-4c1a-4e3b-9f7d-1a2b3c4d5e6f";

const TIME_LOG: TimeLog = {
  id: "5b7c9e14-2a3d-4f60-8e1b-6c4d2f0a9b37",
  taskId: "2f6e3c1a-0b7d-4c55-9a1e-7d0a4b8e1f23",
  title: null,
  taskTitle: null,
  routineId: null,
  routineTitle: null,
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
  checkedRoutineStepIds: [],
  isFinishedEarly: false,
  currentBreak: null,
  breaks: [],
  createdAt: STARTED_AT,
  updatedAt: STARTED_AT,
};

const listWithCount = (parkingLotItemsCount: number) => ({
  parkingLotItems: [],
  parkingLotItemsCount,
  page: 1,
  totalPages: 1,
});

class FakeAudioContext {
  state = "running";
  currentTime = 0;
  destination = {};
  resume = vi.fn(() => Promise.resolve());
  close = vi.fn(() => Promise.resolve());
  createGain = () => ({ gain: { value: 1, setTargetAtTime: vi.fn() }, connect: vi.fn() });
}

describe("AppLayout", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(currentTimeLogsApi, "show").mockResolvedValue({ timeLog: null });
    vi.spyOn(parkingLotItemsApi, "fetchList").mockResolvedValue(listWithCount(0));
    vi.spyOn(userPreferencesApi, "show").mockResolvedValue({
      userPreference: {
        theme: "system",
        completionSound: "rising",
        breakAlarmSound: "classic",
        weekStartsOn: 1,
        timeFormat: "12h",
      },
    });
    vi.spyOn(routinesApi, "fetchList").mockResolvedValue({ routines: [] });
  });

  afterEach(() => document.documentElement.classList.remove("dark"));

  it("names the page in the browser's tab", async () => {
    renderWithProviders(<AppLayout />, undefined, routes.calendar);

    await waitFor(() => expect(document.title).toBe("Calendar · Mindboop"));
  });

  it("leads the tab's title with a session's time left", async () => {
    vi.mocked(currentTimeLogsApi.show).mockResolvedValue({
      timeLog: { ...TIME_LOG, isRunning: false, currentRunStartedAt: null, accumulatedElapsedSeconds: 60 },
    });
    renderWithProviders(<AppLayout />, undefined, "/areas/some-area");

    await waitFor(() => expect(document.title).toBe("24:00 · Tasks · Mindboop"));
  });

  describe("on phones", () => {
    beforeEach(() => vi.stubGlobal("innerWidth", 390));

    afterEach(() => vi.stubGlobal("innerWidth", 1024));

    it("has a bar of the main pages, with the rest in the sidebar under More", async () => {
      renderWithProviders(<AppLayout />, undefined, "/areas/some-area");

      const bar = within(await screen.findByRole("navigation", { name: "Main pages" }));
      expect(bar.getByRole("link", { name: "Tasks" })).toHaveAttribute("aria-current", "page");
      expect(bar.getByRole("link", { name: "Tasks" })).toHaveAttribute("href", routes.inbox.index);
      expect(bar.getByRole("link", { name: "Routines" })).toHaveAttribute("href", routes.routines.index);
      expect(bar.queryByRole("link", { name: "Calendar" })).not.toBeInTheDocument();

      await userEvent.click(bar.getByRole("button", { name: "More" }));

      expect(await screen.findByRole("link", { name: "Settings" })).toBeVisible();
    });

    it("shows the parked count on the Parking lot link", async () => {
      vi.mocked(parkingLotItemsApi.fetchList).mockResolvedValue(listWithCount(3));
      renderWithProviders(<AppLayout />, undefined, routes.calendar);

      const bar = within(await screen.findByRole("navigation", { name: "Main pages" }));
      expect(await bar.findByRole("link", { name: "Parking lot (3 parked)" })).toHaveAttribute(
        "href",
        routes.parkingLot,
      );
    });
  });

  it("reminds about a routine once on its day, with a way to start it", async () => {
    localStorage.removeItem("routines.remindedOn");
    const now = new Date();
    const routine: Routine = {
      id: crypto.randomUUID(),
      title: "Meditation",
      emoji: "🧘",
      color: "violet",
      sound: "none",
      durationMinutes: 10,
      reminderTime: format(now, "HH:mm"),
      reminderDays: [now.getDay()],
      steps: [],
      sessionsCount: 0,
      totalSeconds: 0,
      lastDoneAt: null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    vi.mocked(routinesApi.fetchList).mockResolvedValue({ routines: [routine] });

    renderWithProviders(<AppLayout />);

    expect(await screen.findByText("Time for Meditation?")).toBeVisible();
    expect(screen.getByRole("button", { name: "Start" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Not now" })).toBeVisible();
    expect(JSON.parse(localStorage.getItem("routines.remindedOn") ?? "{}")).toEqual({
      [routine.id]: format(now, "yyyy-MM-dd"),
    });
  });

  it("applies the user's saved theme", async () => {
    vi.mocked(userPreferencesApi.show).mockResolvedValue({
      userPreference: {
        theme: "dark",
        completionSound: "rising",
        breakAlarmSound: "classic",
        weekStartsOn: 1,
        timeFormat: "12h",
      },
    });

    renderWithProviders(<AppLayout />);

    await waitFor(() => expect(document.documentElement).toHaveClass("dark"));
  });

  it("follows the device when the theme is set to match it", async () => {
    document.documentElement.classList.add("dark");

    renderWithProviders(<AppLayout />);

    // The test setup's matchMedia reports a light device.
    await waitFor(() => expect(document.documentElement).not.toHaveClass("dark"));
  });

  it("offers Home, Inbox, Calendar, Routines, Timer and Parking lot in the sidebar and settings in the footer", () => {
    const { container } = renderWithProviders(<AppLayout />);

    const content = within(container.querySelector<HTMLElement>('[data-slot="sidebar-content"]')!);
    const footer = within(container.querySelector<HTMLElement>('[data-slot="sidebar-footer"]')!);

    expect(content.getAllByRole("link").map((link) => link.textContent)).toEqual([
      "Home",
      "Tasks",
      "Calendar",
      "Routines",
      "Timer",
      "Parking lot",
    ]);
    expect(content.getByRole("link", { name: "Home" })).toHaveAttribute("href", routes.root);
    expect(content.getByRole("link", { name: "Tasks" })).toHaveAttribute("href", routes.inbox.index);
    expect(content.getByRole("link", { name: "Calendar" })).toHaveAttribute("href", routes.calendar);
    expect(content.getByRole("link", { name: "Timer" })).toHaveAttribute("href", routes.timer);
    expect(content.getByRole("link", { name: "Parking lot" })).toHaveAttribute("href", routes.parkingLot);
    expect(footer.getByRole("link", { name: "Settings" })).toHaveAttribute("href", routes.settings);
    expect(screen.getAllByRole("link", { name: "Settings" })).toHaveLength(1);
  });

  it("opens the search with its shortcut", async () => {
    renderWithProviders(<AppLayout />);

    await userEvent.keyboard("{Meta>}k{/Meta}");

    expect(await screen.findByRole("dialog", { name: "Search tasks" })).toBeVisible();
  });

  it("adds a task to the Inbox from any page with a shortcut", async () => {
    const create = vi.spyOn(tasksApi, "create").mockResolvedValue({ task: { id: "t" } as Task });
    renderWithProviders(<AppLayout />, undefined, routes.calendar);

    await userEvent.keyboard("{Alt>}[KeyN]{/Alt}");
    const dialog = within(await screen.findByRole("dialog", { name: "New task" }));
    await userEvent.click(dialog.getByRole("button", { name: "Add" }));
    expect(await dialog.findByRole("alert")).toHaveTextContent("Say what you want to get done");

    await userEvent.type(dialog.getByRole("textbox", { name: "Title" }), "Call the bank{Enter}");

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(create).toHaveBeenCalledWith({ title: "Call the bank", lifeAreaId: null }, expect.anything());
    expect(await screen.findByText("Added to your Inbox")).toBeVisible();
  });

  it("leaves the shortcut's keys alone while typing", async () => {
    renderWithProviders(<AppLayout />);
    await userEvent.click(screen.getByRole("button", { name: "Search" }));
    await userEvent.click(await screen.findByRole("combobox", { name: "Search tasks" }));

    await userEvent.keyboard("{Alt>}[KeyN]{/Alt}");

    expect(screen.queryByRole("dialog", { name: "New task" })).not.toBeInTheDocument();
  });

  it("opens the search from the sidebar", async () => {
    renderWithProviders(<AppLayout />);

    await userEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(screen.getByRole("dialog", { name: "Search tasks" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Search tasks" })).toHaveFocus();
  });

  it("counts the parked thoughts over the Parking lot icon", async () => {
    vi.mocked(parkingLotItemsApi.fetchList).mockResolvedValue(listWithCount(3));
    renderWithProviders(<AppLayout />);

    const link = await screen.findByRole("link", { name: "Parking lot (3 parked)" });

    expect(within(link).getByText("3")).toBeInTheDocument();
    expect(parkingLotItemsApi.fetchList).toHaveBeenCalledWith({ status: "parked" });
  });

  it("shows no count over the Parking lot icon when nothing is parked", async () => {
    renderWithProviders(<AppLayout />);

    await waitFor(() => expect(parkingLotItemsApi.fetchList).toHaveBeenCalled());
    await act(() => Promise.resolve());

    expect(screen.getByRole("link", { name: "Parking lot" })).toHaveTextContent(/^Parking lot$/);
  });

  it("caps a large Parking lot count", async () => {
    vi.mocked(parkingLotItemsApi.fetchList).mockResolvedValue(listWithCount(120));
    renderWithProviders(<AppLayout />);

    const link = await screen.findByRole("link", { name: "Parking lot (120 parked)" });

    expect(within(link).getByText("99+")).toBeInTheDocument();
  });

  it("starts icon-only and toggles between the icon and full views", async () => {
    const { container } = renderWithProviders(<AppLayout />);
    const sidebar = container.querySelector<HTMLElement>('[data-slot="sidebar"]')!;
    const toggle = screen.getByRole("button", { name: "Toggle Sidebar" });

    expect(sidebar).toHaveAttribute("data-state", "collapsed");
    expect(sidebar).toHaveAttribute("data-collapsible", "icon");

    await userEvent.click(toggle);
    expect(sidebar).toHaveAttribute("data-state", "expanded");

    await userEvent.click(toggle);
    expect(sidebar).toHaveAttribute("data-state", "collapsed");
    expect(sidebar).toHaveAttribute("data-collapsible", "icon");
  });

  it("restores the toggled state when mounted again", async () => {
    const { container, unmount } = renderWithProviders(<AppLayout />);
    await userEvent.click(screen.getByRole("button", { name: "Toggle Sidebar" }));
    expect(container.querySelector('[data-slot="sidebar"]')).toHaveAttribute("data-state", "expanded");
    unmount();

    const { container: expanded, unmount: unmountExpanded } = renderWithProviders(<AppLayout />);
    expect(expanded.querySelector('[data-slot="sidebar"]')).toHaveAttribute("data-state", "expanded");
    await userEvent.click(screen.getByRole("button", { name: "Toggle Sidebar" }));
    unmountExpanded();

    const { container: collapsed } = renderWithProviders(<AppLayout />);
    expect(collapsed.querySelector('[data-slot="sidebar"]')).toHaveAttribute("data-state", "collapsed");
  });

  describe("with a session on the clock", () => {
    const stopSound = vi.fn();

    beforeEach(() => {
      vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "Date"] });
      vi.setSystemTime(new Date(STARTED_AT).getTime() + 37_000);
      vi.stubGlobal("AudioContext", FakeAudioContext);
      vi.mocked(playSound).mockReturnValue(stopSound);
      vi.spyOn(currentTimeLogsApi, "show").mockResolvedValue({ timeLog: TIME_LOG });
    });

    afterEach(() => {
      vi.useRealTimers();
      // Not unstubAllGlobals, which would also drop the setup file's matchMedia stub.
      vi.clearAllMocks();
      useAmbienceStore.setState({ soundId: "none", startingSoundTimeLogId: null });
    });

    it("starts a session on a task in an area of life with the area's sound, once", async () => {
      useAmbienceStore.setState({ soundId: "rain" });
      vi.spyOn(currentTimeLogsApi, "show").mockResolvedValue({
        timeLog: { ...TIME_LOG, lifeAreaId: LIFE_AREA_ID },
      });
      vi.spyOn(lifeAreasApi, "fetchList").mockResolvedValue({
        lifeAreas: [
          {
            id: LIFE_AREA_ID,
            name: "Work",
            color: "indigo",
            emoji: "💼",
            defaultSound: "piano",
            isDeleted: false,
            createdAt: STARTED_AT,
            updatedAt: STARTED_AT,
          },
        ],
      });
      renderWithProviders(<AppLayout />, undefined, routes.inbox.index);

      expect(await screen.findByRole("region", { name: "Current session" })).toBeInTheDocument();
      await act(() => Promise.resolve());
      expect(useAmbienceStore.getState().soundId).toBe("piano");
      expect(playSound).toHaveBeenLastCalledWith(expect.anything(), expect.anything(), "piano");

      // A sound picked during the session stays: the area's applies only as it starts.
      act(() => useAmbienceStore.getState().setSoundId("waves"));
      act(() => useAmbienceStore.getState().applyStartingSound(TIME_LOG.id, "piano"));
      expect(useAmbienceStore.getState().soundId).toBe("waves");
    });

    it("starts a session on a task in an area of life in silence when the area's sound is none", async () => {
      useAmbienceStore.setState({ soundId: "rain" });
      vi.spyOn(currentTimeLogsApi, "show").mockResolvedValue({
        timeLog: { ...TIME_LOG, lifeAreaId: LIFE_AREA_ID },
      });
      vi.spyOn(lifeAreasApi, "fetchList").mockResolvedValue({
        lifeAreas: [
          {
            id: LIFE_AREA_ID,
            name: "Work",
            color: "indigo",
            emoji: "💼",
            defaultSound: "none",
            isDeleted: false,
            createdAt: STARTED_AT,
            updatedAt: STARTED_AT,
          },
        ],
      });
      renderWithProviders(<AppLayout />, undefined, routes.inbox.index);

      expect(await screen.findByRole("region", { name: "Current session" })).toBeInTheDocument();
      await act(() => Promise.resolve());
      expect(useAmbienceStore.getState().soundId).toBe("none");
      expect(stopSound).toHaveBeenCalled();
    });

    it("starts a session on a routine in silence when the routine's sound is none", async () => {
      useAmbienceStore.setState({ soundId: "rain" });
      const routineId = crypto.randomUUID();
      vi.spyOn(currentTimeLogsApi, "show").mockResolvedValue({
        timeLog: { ...TIME_LOG, taskId: null, routineId, routineTitle: "Meditation" },
      });
      vi.spyOn(routinesApi, "fetchList").mockResolvedValue({
        routines: [
          {
            id: routineId,
            title: "Meditation",
            emoji: "🧘",
            color: "violet",
            sound: "none",
            durationMinutes: 10,
            reminderTime: null,
            reminderDays: [],
            steps: [],
            sessionsCount: 0,
            totalSeconds: 0,
            lastDoneAt: null,
            createdAt: STARTED_AT,
            updatedAt: STARTED_AT,
          },
        ],
      });
      renderWithProviders(<AppLayout />, undefined, routes.inbox.index);

      expect(await screen.findByRole("region", { name: "Current session" })).toBeInTheDocument();
      await act(() => Promise.resolve());
      expect(useAmbienceStore.getState().soundId).toBe("none");
      expect(stopSound).toHaveBeenCalled();
    });

    it("floats a mini timer away from the Timer page, leading back to it and hiding there", async () => {
      renderWithProviders(<AppLayout />, undefined, routes.inbox.index);

      const session = await screen.findByRole("region", { name: "Current session" });
      expect(within(session).getByRole("timer")).toHaveTextContent("24:23");
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(within(session).getByRole("timer")).toHaveTextContent("24:22");

      await userEvent.click(within(session).getByRole("link", { name: "Back to timer" }));

      expect(screen.queryByRole("region", { name: "Current session" })).not.toBeInTheDocument();
    });

    it("names what's on the clock in the mini timer, and says when it's paused", async () => {
      vi.spyOn(currentTimeLogsApi, "show").mockResolvedValue({
        timeLog: {
          ...TIME_LOG,
          taskTitle: "Write the report",
          isRunning: false,
          currentBreak: {
            id: crypto.randomUUID(),
            intention: "Snack",
            durationMinutes: 10,
            endsAt: new Date(Date.now() + 600_000).toISOString(),
          },
        },
      });
      renderWithProviders(<AppLayout />, undefined, routes.inbox.index);

      const session = await screen.findByRole("region", { name: "Current session" });
      expect(within(session).getByText("Write the report")).toBeVisible();
      expect(within(session).getByText("Paused")).toBeVisible();
    });

    it("keeps the background sound playing across pages", async () => {
      useAmbienceStore.setState({ soundId: "rain" });
      renderWithProviders(<AppLayout />, undefined, routes.inbox.index);

      // waitFor can't poll under the fake setInterval, so wait on the mini timer the same data brings in.
      expect(await screen.findByRole("region", { name: "Current session" })).toBeInTheDocument();
      expect(playSound).toHaveBeenCalledWith(expect.anything(), expect.anything(), "rain");
      await userEvent.click(screen.getByRole("link", { name: "Timer" }));
      expect(screen.queryByRole("region", { name: "Current session" })).not.toBeInTheDocument();
      await userEvent.click(screen.getByRole("link", { name: "Parking lot" }));

      expect(screen.getByRole("region", { name: "Current session" })).toBeInTheDocument();
      expect(playSound).toHaveBeenCalledTimes(1);
      expect(stopSound).not.toHaveBeenCalled();
    });

    it("shows nothing once no session is on the clock", async () => {
      vi.spyOn(currentTimeLogsApi, "show").mockResolvedValue({ timeLog: null });
      renderWithProviders(<AppLayout />, undefined, routes.inbox.index);

      await waitFor(() => expect(currentTimeLogsApi.show).toHaveBeenCalled());
      // Lets the query settle before checking nothing came of it.
      await act(() => Promise.resolve());
      expect(screen.queryByRole("region", { name: "Current session" })).not.toBeInTheDocument();
      expect(playSound).not.toHaveBeenCalled();
    });
  });
});

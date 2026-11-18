import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import currentTimeLogsApi from "@/apis/current_time_logs";
import sessionsApi from "@/apis/sessions";
import type { TimeLog } from "@/apis/types";
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

const TIME_LOG: TimeLog = {
  id: "5b7c9e14-2a3d-4f60-8e1b-6c4d2f0a9b37",
  taskId: "2f6e3c1a-0b7d-4c55-9a1e-7d0a4b8e1f23",
  title: null,
  taskTitle: null,
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
    vi.spyOn(userPreferencesApi, "show").mockResolvedValue({
      userPreference: { theme: "system", completionSound: "rising", breakAlarmSound: "classic" },
    });
  });

  afterEach(() => document.documentElement.classList.remove("dark"));

  it("applies the user's saved theme", async () => {
    vi.mocked(userPreferencesApi.show).mockResolvedValue({
      userPreference: { theme: "dark", completionSound: "rising", breakAlarmSound: "classic" },
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

  it("offers Quick start, Inbox, Calendar, Timer and Parking lot in the sidebar and settings in the footer", () => {
    const { container } = renderWithProviders(<AppLayout />);

    const content = within(container.querySelector<HTMLElement>('[data-slot="sidebar-content"]')!);
    const footer = within(container.querySelector<HTMLElement>('[data-slot="sidebar-footer"]')!);

    expect(content.getAllByRole("link").map((link) => link.textContent)).toEqual([
      "Quick start",
      "Inbox",
      "Calendar",
      "Timer",
      "Parking lot",
    ]);
    expect(content.getByRole("link", { name: "Quick start" })).toHaveAttribute("href", routes.root);
    expect(content.getByRole("link", { name: "Inbox" })).toHaveAttribute("href", routes.inbox.index);
    expect(content.getByRole("link", { name: "Calendar" })).toHaveAttribute("href", routes.calendar);
    expect(content.getByRole("link", { name: "Timer" })).toHaveAttribute("href", routes.timer);
    expect(content.getByRole("link", { name: "Parking lot" })).toHaveAttribute("href", routes.parkingLot);
    expect(footer.getByRole("link", { name: "Settings" })).toHaveAttribute("href", routes.settings);
    expect(screen.getAllByRole("link", { name: "Settings" })).toHaveLength(1);
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

  it("signs out from the sidebar footer", async () => {
    const destroy = vi.spyOn(sessionsApi, "destroy").mockResolvedValue(undefined as never);
    renderWithProviders(<AppLayout />);

    await userEvent.click(screen.getByRole("button", { name: "Sign out" }));

    await waitFor(() => expect(destroy).toHaveBeenCalled());
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
      useAmbienceStore.setState({ soundId: "none" });
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

import { QueryClient } from "@tanstack/react-query";
import { act, screen } from "@testing-library/react";

import currentTimeLogsApi from "@/apis/current_time_logs";
import type { TimeLog } from "@/apis/types";
import { QUERY_KEYS } from "@/constants/query";
import routes from "@/routes";
import { renderWithProviders } from "@/test/utils";
import { startAlarmSound } from "@/utils/alarmSound";
import { showNotification } from "@/utils/notifications";

import BreakAlarm from "./BreakAlarm";

vi.mock("@/utils/alarmSound");
vi.mock("@/utils/notifications");

const NOW = new Date("2026-11-06T10:00:00.000Z").getTime();
const ONE_MINUTE = 60_000;

const timeLogWithBreak = (endsAt: number): TimeLog => ({
  id: "5b7c9e14-2a3d-4f60-8e1b-6c4d2f0a9b37",
  taskId: "2f6e3c1a-0b7d-4c55-9a1e-7d0a4b8e1f23",
  mode: "timer",
  timerPreset: 25,
  bufferMinutes: 0,
  accumulatedElapsedSeconds: 60,
  pauseCount: 1,
  isRunning: false,
  currentRunStartedAt: null,
  startedAt: new Date(NOW).toISOString(),
  completedAt: null,
  isFinishedEarly: false,
  currentBreak: {
    id: "c3f8a7b2-5e6d-4a81-9b0c-3e4f5a6b7c8d",
    intention: "Delivery",
    durationMinutes: 5,
    endsAt: new Date(endsAt).toISOString(),
  },
  createdAt: new Date(NOW).toISOString(),
  updatedAt: new Date(NOW).toISOString(),
});

const renderAlarm = async (timeLog: TimeLog | null, path: string = routes.root) => {
  vi.spyOn(currentTimeLogsApi, "show").mockResolvedValue({ timeLog });
  renderWithProviders(<BreakAlarm />, undefined, path);
  await act(() => vi.advanceTimersByTimeAsync(0));
};

const advance = (milliseconds: number) => act(() => vi.advanceTimersByTimeAsync(milliseconds));

describe("BreakAlarm", () => {
  const stopSound = vi.fn();
  const closeNotification = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    vi.mocked(startAlarmSound).mockReturnValue(stopSound);
    vi.mocked(showNotification).mockReturnValue({ close: closeNotification } as unknown as Notification);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("stays silent with no break", async () => {
    await renderAlarm(null);

    await advance(ONE_MINUTE);

    expect(startAlarmSound).not.toHaveBeenCalled();
  });

  it("stays silent until the break ends", async () => {
    await renderAlarm(timeLogWithBreak(NOW + ONE_MINUTE));

    await advance(ONE_MINUTE - 1);
    expect(startAlarmSound).not.toHaveBeenCalled();

    await advance(1);
    expect(startAlarmSound).toHaveBeenCalledTimes(1);
  });

  it("rings for a minute, then goes quiet with a notification", async () => {
    await renderAlarm(timeLogWithBreak(NOW + 1000));

    await advance(1000);
    expect(stopSound).not.toHaveBeenCalled();
    expect(showNotification).not.toHaveBeenCalled();

    await advance(ONE_MINUTE);
    expect(stopSound).toHaveBeenCalledTimes(1);
    expect(showNotification).toHaveBeenCalledTimes(1);
    expect(showNotification).toHaveBeenCalledWith(expect.objectContaining({ title: "Break's over" }));
  });

  it("keeps ringing through a reload during the ringing minute", async () => {
    await renderAlarm(timeLogWithBreak(NOW - 1000));

    expect(startAlarmSound).toHaveBeenCalledTimes(1);

    await advance(ONE_MINUTE);
    expect(stopSound).toHaveBeenCalledTimes(1);
    expect(showNotification).toHaveBeenCalledTimes(1);
  });

  it("neither rings nor notifies when opened after the ringing minute", async () => {
    await renderAlarm(timeLogWithBreak(NOW - 2 * ONE_MINUTE));

    expect(startAlarmSound).not.toHaveBeenCalled();
    expect(showNotification).not.toHaveBeenCalled();
    expect(screen.getByText("Break's over — Delivery")).toBeVisible();
  });

  it("offers I'm back on other pages only once the break is over", async () => {
    await renderAlarm(timeLogWithBreak(NOW + 1000));
    expect(screen.queryByRole("button", { name: "I'm back" })).not.toBeInTheDocument();

    await advance(1000);
    expect(screen.getByRole("button", { name: "I'm back" })).toBeVisible();
  });

  it("leaves the banner to the Timer page while still ringing there", async () => {
    await renderAlarm(timeLogWithBreak(NOW - 1000), routes.timer);

    expect(startAlarmSound).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button", { name: "I'm back" })).not.toBeInTheDocument();
  });

  describe("when coming back", () => {
    const renderWithClient = async (timeLog: TimeLog) => {
      const queryClient = new QueryClient();
      vi.spyOn(currentTimeLogsApi, "show").mockResolvedValue({ timeLog });
      renderWithProviders(<BreakAlarm />, queryClient);
      await advance(0);

      const endBreak = () => {
        queryClient.setQueryData(QUERY_KEYS.TIME_LOGS.CURRENT, { ...timeLog, currentBreak: null });

        return advance(0);
      };

      return { endBreak };
    };

    it("stops the sound and rings no more", async () => {
      const { endBreak } = await renderWithClient(timeLogWithBreak(NOW - 1000));
      expect(startAlarmSound).toHaveBeenCalledTimes(1);

      await endBreak();

      expect(stopSound).toHaveBeenCalledTimes(1);
      await advance(ONE_MINUTE);
      expect(showNotification).not.toHaveBeenCalled();
    });

    it("cancels an alarm that hasn't rung yet", async () => {
      const { endBreak } = await renderWithClient(timeLogWithBreak(NOW + 1000));

      await endBreak();
      await advance(ONE_MINUTE);

      expect(startAlarmSound).not.toHaveBeenCalled();
    });

    it("closes the notification", async () => {
      const { endBreak } = await renderWithClient(timeLogWithBreak(NOW - 1000));
      await advance(ONE_MINUTE);
      expect(showNotification).toHaveBeenCalledTimes(1);

      await endBreak();

      expect(closeNotification).toHaveBeenCalledTimes(1);
    });
  });
});

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";

import timeLogsApi from "@/apis/time_logs";
import type { TimeLog } from "@/apis/types";
import { QUERY_KEYS } from "@/constants/query";
import { useCreateTimeLog, useDeleteTimeLog, useUpdateTimeLog } from "@/hooks/reactQuery/useTimeLogsApi";

const TASK_ID = "2f6e3c1a-0b7d-4c55-9a1e-7d0a4b8e1f23";

const TIME_LOG: TimeLog = {
  id: "5b7c9e14-2a3d-4f60-8e1b-6c4d2f0a9b37",
  taskId: TASK_ID,
  title: null,
  taskTitle: null,
  isTaskDeleted: false,
  mode: "timer",
  timerPreset: 15,
  bufferMinutes: 0,
  accumulatedElapsedSeconds: 0,
  isRunning: true,
  currentRunStartedAt: "2026-11-05T10:00:00.000Z",
  startedAt: "2026-11-05T10:00:00.000Z",
  completedAt: null,
  isFinishedEarly: false,
  currentBreak: null,
  createdAt: "2026-11-05T10:00:00.000Z",
  updatedAt: "2026-11-05T10:00:00.000Z",
};

const setup = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

  return { queryClient, wrapper, invalidateQueries };
};

describe("useTimeLogsApi", () => {
  afterEach(() => vi.restoreAllMocks());

  it("seeds the current time log after a create", async () => {
    vi.spyOn(timeLogsApi, "create").mockResolvedValue({ timeLog: TIME_LOG });
    const { queryClient, wrapper } = setup();

    const { result } = renderHook(() => useCreateTimeLog(), { wrapper });
    await result.current.mutateAsync({ taskId: TASK_ID, mode: "timer" });

    expect(queryClient.getQueryData(QUERY_KEYS.TIME_LOGS.CURRENT)).toEqual(TIME_LOG);
  });

  it("invalidates the current time log after a delete", async () => {
    vi.spyOn(timeLogsApi, "destroy").mockResolvedValue({} as Awaited<ReturnType<typeof timeLogsApi.destroy>>);
    const { wrapper, invalidateQueries } = setup();

    const { result } = renderHook(() => useDeleteTimeLog(), { wrapper });
    await result.current.mutateAsync(TIME_LOG.id);

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.TIME_LOGS.CURRENT });
  });

  it("doesn't make a logged session the current one, and refreshes the calendar", async () => {
    const loggedTimeLog = {
      ...TIME_LOG,
      mode: "manual" as const,
      isRunning: false,
      completedAt: "2026-11-05T11:00:00.000Z",
    };
    vi.spyOn(timeLogsApi, "create").mockResolvedValue({ timeLog: loggedTimeLog });
    const { queryClient, wrapper, invalidateQueries } = setup();

    const { result } = renderHook(() => useCreateTimeLog(), { wrapper });
    await result.current.mutateAsync({
      mode: "manual",
      title: "Answer emails",
      startedAt: loggedTimeLog.startedAt,
      completedAt: loggedTimeLog.completedAt,
    });

    expect(queryClient.getQueryData(QUERY_KEYS.TIME_LOGS.CURRENT)).toBeUndefined();
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.CALENDAR_EVENTS.ALL });
  });

  it("refreshes the calendar after a time log moves", async () => {
    vi.spyOn(timeLogsApi, "update").mockResolvedValue({ timeLog: TIME_LOG });
    const { wrapper, invalidateQueries } = setup();

    const { result } = renderHook(() => useUpdateTimeLog(), { wrapper });
    await result.current.mutateAsync({
      id: TIME_LOG.id,
      startedAt: "2026-11-05T09:00:00.000Z",
      completedAt: "2026-11-05T09:30:00.000Z",
    });

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.CALENDAR_EVENTS.ALL });
  });
});

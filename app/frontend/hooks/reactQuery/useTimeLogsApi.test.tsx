import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

import timeLogsApi from "@/apis/time_logs";
import type { TimeLog } from "@/apis/types";
import { QUERY_KEYS } from "@/constants/query";
import {
  useCreateTimeLog,
  useDeleteTimeLog,
  useTimeLogs,
  useUpdateTimeLog,
} from "@/hooks/reactQuery/useTimeLogsApi";

const TIME_LOG: TimeLog = {
  id: "5b7c9e14-2a3d-4f60-8e1b-6c4d2f0a9b37",
  taskId: "2f6e3c1a-0b7d-4c55-9a1e-7d0a4b8e1f23",
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

  it("fetches a task's time logs with their pagination details", async () => {
    const response = { timeLogs: [TIME_LOG], timeLogsCount: 1, page: 1, totalPages: 1 };
    const fetchList = vi.spyOn(timeLogsApi, "fetchList").mockResolvedValue(response);
    const { wrapper } = setup();

    const { result } = renderHook(() => useTimeLogs({ taskId: TIME_LOG.taskId }), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual(response));
    expect(fetchList).toHaveBeenCalledWith({ taskId: TIME_LOG.taskId });
  });

  it("marks every cached list stale after a mutation", async () => {
    vi.spyOn(timeLogsApi, "create").mockResolvedValue({ timeLog: TIME_LOG });
    const { queryClient, wrapper } = setup();
    queryClient.setQueryData(QUERY_KEYS.TIME_LOGS.LIST({ page: 1 }), {});
    queryClient.setQueryData(QUERY_KEYS.TIME_LOGS.LIST({ taskId: TIME_LOG.taskId }), {});

    const { result } = renderHook(() => useCreateTimeLog(), { wrapper });
    await result.current.mutateAsync({
      taskId: TIME_LOG.taskId,
      mode: TIME_LOG.mode,
      startedAt: TIME_LOG.startedAt,
    });

    expect(queryClient.getQueryState(QUERY_KEYS.TIME_LOGS.LIST({ page: 1 }))?.isInvalidated).toBe(true);
    expect(
      queryClient.getQueryState(QUERY_KEYS.TIME_LOGS.LIST({ taskId: TIME_LOG.taskId }))?.isInvalidated,
    ).toBe(true);
  });

  it("invalidates the lists and the current time log after an update", async () => {
    vi.spyOn(timeLogsApi, "update").mockResolvedValue({ timeLog: { ...TIME_LOG, isRunning: false } });
    const { wrapper, invalidateQueries } = setup();

    const { result } = renderHook(() => useUpdateTimeLog(), { wrapper });
    await result.current.mutateAsync({ id: TIME_LOG.id, isRunning: false });

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.TIME_LOGS.LISTS });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.TIME_LOGS.CURRENT });
  });

  it("invalidates the lists and the current time log after a delete", async () => {
    vi.spyOn(timeLogsApi, "destroy").mockResolvedValue({} as Awaited<ReturnType<typeof timeLogsApi.destroy>>);
    const { wrapper, invalidateQueries } = setup();

    const { result } = renderHook(() => useDeleteTimeLog(), { wrapper });
    await result.current.mutateAsync(TIME_LOG.id);

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.TIME_LOGS.LISTS });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.TIME_LOGS.CURRENT });
  });
});

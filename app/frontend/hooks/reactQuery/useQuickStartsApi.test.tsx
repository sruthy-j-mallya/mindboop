import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";

import quickStartsApi from "@/apis/quick_starts";
import type { Task, TimeLog } from "@/apis/types";
import { QUERY_KEYS } from "@/constants/query";
import { useCreateQuickStart } from "@/hooks/reactQuery/useQuickStartsApi";

const TASK = { id: "2f6e3c1a-0b7d-4c55-9a1e-7d0a4b8e1f23", title: "Draft", estimatedMinutes: 15 } as Task;
const TIME_LOG = { id: "5b7c9e14-2a3d-4f60-8e1b-6c4d2f0a9b37", taskId: TASK.id, timerPreset: 15 } as TimeLog;

const setup = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

  return { queryClient, wrapper, invalidateQueries };
};

describe("useQuickStartsApi", () => {
  afterEach(() => vi.restoreAllMocks());

  it("seeds the task and the current time log, and refreshes the task lists", async () => {
    vi.spyOn(quickStartsApi, "create").mockResolvedValue({ task: TASK, timeLog: TIME_LOG });
    const { queryClient, wrapper, invalidateQueries } = setup();

    const { result } = renderHook(() => useCreateQuickStart(), { wrapper });
    await result.current.mutateAsync({ title: TASK.title, estimatedMinutes: 15 });

    expect(queryClient.getQueryData(QUERY_KEYS.TASKS.DETAIL(TASK.id))).toEqual(TASK);
    expect(queryClient.getQueryData(QUERY_KEYS.TIME_LOGS.CURRENT)).toEqual(TIME_LOG);
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.TASKS.LISTS });
  });
});

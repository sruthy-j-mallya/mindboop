import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";

import timeLogBailOutsApi from "@/apis/time_log_bail_outs";
import type { TimeLog } from "@/apis/types";
import { QUERY_KEYS } from "@/constants/query";
import { useBailOutTimeLog } from "@/hooks/reactQuery/useTimeLogBailOutsApi";

const TIME_LOG = {
  id: "5b7c9e14-2a3d-4f60-8e1b-6c4d2f0a9b37",
  taskId: "2f6e3c1a-0b7d-4c55-9a1e-7d0a4b8e1f23",
} as TimeLog;

describe("useBailOutTimeLog", () => {
  afterEach(() => vi.restoreAllMocks());

  it("refreshes the task lists, as the task gained a breadcrumb", async () => {
    vi.spyOn(timeLogBailOutsApi, "create").mockResolvedValue({ timeLog: TIME_LOG });
    const queryClient = new QueryClient();
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useBailOutTimeLog(), { wrapper });
    await result.current.mutateAsync({
      timeLogId: TIME_LOG.id,
      completedDescription: "",
      restartDescription: "Chapter 2",
    });

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.TASKS.LISTS });
  });
});

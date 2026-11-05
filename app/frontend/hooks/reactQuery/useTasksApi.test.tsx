import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

import tasksApi, { type Task } from "@/apis/tasks";
import { QUERY_KEYS } from "@/constants/query";
import {
  useCreateTask,
  useDeleteTask,
  useTask,
  useTasks,
  useUpdateTask,
} from "@/hooks/reactQuery/useTasksApi";

const TASK: Task = {
  id: "2f6e3c1a-0b7d-4c55-9a1e-7d0a4b8e1f23",
  title: "Write the report",
  description: null,
  estimatedMinutes: 30,
  isDuration: false,
  isAllDay: false,
  isCompleted: false,
  startsAt: null,
  endsAt: null,
  createdAt: "2026-11-05T10:00:00.000Z",
  updatedAt: "2026-11-05T10:00:00.000Z",
  checklistItems: [{ id: "8a1d5e02-3c4f-4e6b-b7a9-1c2d3e4f5a6b", title: "Outline", isCompleted: false }],
};

const setup = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

  return { queryClient, wrapper, invalidateQueries };
};

describe("useTasksApi", () => {
  afterEach(() => vi.restoreAllMocks());

  it("fetches the requested page of tasks with its pagination details", async () => {
    const response = { tasks: [TASK], tasksCount: 21, page: 2, totalPages: 2 };
    const fetchList = vi.spyOn(tasksApi, "fetchList").mockResolvedValue(response);
    const { wrapper } = setup();

    const { result } = renderHook(() => useTasks({ page: 2 }), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual(response));
    expect(fetchList).toHaveBeenCalledWith({ page: 2 });
  });

  it("marks every cached page stale after a mutation", async () => {
    vi.spyOn(tasksApi, "create").mockResolvedValue({ task: TASK });
    const { queryClient, wrapper } = setup();
    queryClient.setQueryData(QUERY_KEYS.TASKS.LIST({ page: 1 }), {});
    queryClient.setQueryData(QUERY_KEYS.TASKS.LIST({ page: 2 }), {});

    const { result } = renderHook(() => useCreateTask(), { wrapper });
    await result.current.mutateAsync({ title: TASK.title });

    expect(queryClient.getQueryState(QUERY_KEYS.TASKS.LIST({ page: 1 }))?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(QUERY_KEYS.TASKS.LIST({ page: 2 }))?.isInvalidated).toBe(true);
  });

  it("unwraps a single task with its checklist items", async () => {
    const show = vi.spyOn(tasksApi, "show").mockResolvedValue({ task: TASK });
    const { wrapper } = setup();

    const { result } = renderHook(() => useTask(TASK.id), { wrapper });

    await waitFor(() => expect(result.current.data?.checklistItems).toEqual(TASK.checklistItems));
    expect(show).toHaveBeenCalledWith(TASK.id);
  });

  it("invalidates the list after creating a task", async () => {
    vi.spyOn(tasksApi, "create").mockResolvedValue({ task: TASK });
    const { wrapper, invalidateQueries } = setup();

    const { result } = renderHook(() => useCreateTask(), { wrapper });
    await result.current.mutateAsync({ title: TASK.title });

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.TASKS.LISTS });
  });

  it("updates the cached task and invalidates the list after an update", async () => {
    const updated = { ...TASK, isCompleted: true };
    vi.spyOn(tasksApi, "update").mockResolvedValue({ task: updated });
    const { queryClient, wrapper, invalidateQueries } = setup();

    const { result } = renderHook(() => useUpdateTask(), { wrapper });
    await result.current.mutateAsync({ id: TASK.id, isCompleted: true });

    expect(queryClient.getQueryData(QUERY_KEYS.TASKS.DETAIL(TASK.id))).toEqual(updated);
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.TASKS.LISTS });
  });

  it("drops the cached task and invalidates the list after a delete", async () => {
    vi.spyOn(tasksApi, "destroy").mockResolvedValue({} as Awaited<ReturnType<typeof tasksApi.destroy>>);
    const { queryClient, wrapper, invalidateQueries } = setup();
    queryClient.setQueryData(QUERY_KEYS.TASKS.DETAIL(TASK.id), TASK);

    const { result } = renderHook(() => useDeleteTask(), { wrapper });
    await result.current.mutateAsync(TASK.id);

    expect(queryClient.getQueryData(QUERY_KEYS.TASKS.DETAIL(TASK.id))).toBeUndefined();
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.TASKS.LISTS });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.TIME_LOGS.LISTS });
  });
});

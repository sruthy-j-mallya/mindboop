import {
  type QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";

import tasksApi from "@/apis/tasks";
import type { Task, TaskFilters, TaskListParams, TaskListResponse } from "@/apis/types";
import { QUERY_KEYS } from "@/constants/query";

export const useTasks = (
  params: TaskListParams = {},
  options?: Omit<UseQueryOptions<TaskListResponse>, "queryKey" | "queryFn">,
) =>
  useQuery({
    queryKey: QUERY_KEYS.TASKS.LIST(params),
    queryFn: () => tasksApi.fetchList(params),
    ...options,
  });

// Loads the list a page at a time; `fetchNextPage` adds the next one while `hasNextPage` is true.
export const useInfiniteTasks = (filters: TaskFilters = {}) =>
  useInfiniteQuery({
    queryKey: QUERY_KEYS.TASKS.INFINITE_LIST(filters),
    queryFn: ({ pageParam }) => tasksApi.fetchList({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: ({ page, totalPages }) => (page < totalPages ? page + 1 : undefined),
  });

export const useTask = (id: string, options?: Omit<UseQueryOptions<Task>, "queryKey" | "queryFn">) =>
  useQuery({
    queryKey: QUERY_KEYS.TASKS.DETAIL(id),
    queryFn: async () => (await tasksApi.show(id)).task,
    ...options,
  });

// Lists and the Calendar both show tasks, so a change to one refreshes both.
const invalidateTaskLists = (queryClient: QueryClient) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASKS.LISTS }),
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CALENDAR_EVENTS.ALL }),
  ]);

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.create,
    onSuccess: ({ task }) => {
      queryClient.setQueryData(QUERY_KEYS.TASKS.DETAIL(task.id), task);
      return invalidateTaskLists(queryClient);
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.update,
    onSuccess: ({ task }) => {
      queryClient.setQueryData(QUERY_KEYS.TASKS.DETAIL(task.id), task);
      return invalidateTaskLists(queryClient);
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.destroy,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.TASKS.DETAIL(id) });
      // A deleted task's time log can't stay the current one.
      return Promise.all([
        invalidateTaskLists(queryClient),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIME_LOGS.CURRENT }),
      ]);
    },
  });
};

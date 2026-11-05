import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";

import tasksApi, { type Task, type TaskListParams, type TaskListResponse } from "@/apis/tasks";
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

export const useTask = (id: string, options?: Omit<UseQueryOptions<Task>, "queryKey" | "queryFn">) =>
  useQuery({
    queryKey: QUERY_KEYS.TASKS.DETAIL(id),
    queryFn: async () => (await tasksApi.show(id)).task,
    ...options,
  });

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASKS.LISTS }),
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.update,
    onSuccess: ({ task }) => {
      queryClient.setQueryData(QUERY_KEYS.TASKS.DETAIL(task.id), task);
      return queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASKS.LISTS });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.destroy,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.TASKS.DETAIL(id) });
      // A deleted task's time logs disappear from the lists along with it.
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASKS.LISTS }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIME_LOGS.LISTS }),
      ]);
    },
  });
};

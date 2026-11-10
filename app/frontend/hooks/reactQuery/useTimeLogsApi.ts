import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";

import timeLogsApi from "@/apis/time_logs";
import type { TimeLogListParams, TimeLogListResponse } from "@/apis/types";
import { QUERY_KEYS } from "@/constants/query";

export const useTimeLogs = (
  params: TimeLogListParams = {},
  options?: Omit<UseQueryOptions<TimeLogListResponse>, "queryKey" | "queryFn">,
) =>
  useQuery({
    queryKey: QUERY_KEYS.TIME_LOGS.LIST(params),
    queryFn: () => timeLogsApi.fetchList(params),
    ...options,
  });

export const useCreateTimeLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: timeLogsApi.create,
    onSuccess: ({ timeLog }) => {
      // Seeded so the Timer page doesn't flash the previous session while it refetches.
      queryClient.setQueryData(QUERY_KEYS.TIME_LOGS.CURRENT, timeLog);
      return queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIME_LOGS.LISTS });
    },
  });
};

export const useUpdateTimeLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: timeLogsApi.update,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIME_LOGS.LISTS }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIME_LOGS.CURRENT }),
      ]),
  });
};

export const useDeleteTimeLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: timeLogsApi.destroy,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIME_LOGS.LISTS }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIME_LOGS.CURRENT }),
      ]),
  });
};

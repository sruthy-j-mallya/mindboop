import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";

import timeLogsApi, {
  type TimeLog,
  type TimeLogListParams,
  type TimeLogListResponse,
} from "@/apis/time_logs";
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

export const useTimeLog = (id: string, options?: Omit<UseQueryOptions<TimeLog>, "queryKey" | "queryFn">) =>
  useQuery({
    queryKey: QUERY_KEYS.TIME_LOGS.DETAIL(id),
    queryFn: async () => (await timeLogsApi.show(id)).timeLog,
    ...options,
  });

export const useCreateTimeLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: timeLogsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIME_LOGS.LISTS }),
  });
};

export const useUpdateTimeLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: timeLogsApi.update,
    onSuccess: ({ timeLog }) => {
      queryClient.setQueryData(QUERY_KEYS.TIME_LOGS.DETAIL(timeLog.id), timeLog);
      return queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIME_LOGS.LISTS });
    },
  });
};

export const useDeleteTimeLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: timeLogsApi.destroy,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.TIME_LOGS.DETAIL(id) });
      return queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIME_LOGS.LISTS });
    },
  });
};

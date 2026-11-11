import { useMutation, useQueryClient } from "@tanstack/react-query";

import timeLogsApi from "@/apis/time_logs";
import { QUERY_KEYS } from "@/constants/query";

export const useCreateTimeLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: timeLogsApi.create,
    // Seeded so the Timer page doesn't flash the previous session while it refetches.
    onSuccess: ({ timeLog }) => queryClient.setQueryData(QUERY_KEYS.TIME_LOGS.CURRENT, timeLog),
  });
};

export const useDeleteTimeLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: timeLogsApi.destroy,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIME_LOGS.CURRENT }),
  });
};

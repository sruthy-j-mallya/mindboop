import { useMutation, useQueryClient } from "@tanstack/react-query";

import timeLogsApi from "@/apis/time_logs";
import { QUERY_KEYS } from "@/constants/query";

export const useCreateTimeLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: timeLogsApi.create,
    onSuccess: ({ timeLog }) => {
      // Seeded so the Timer page doesn't flash the previous session while it refetches. A logged session is already
      // over, so it never becomes the current one.
      if (!timeLog.completedAt) queryClient.setQueryData(QUERY_KEYS.TIME_LOGS.CURRENT, timeLog);
      return queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CALENDAR_EVENTS.ALL });
    },
  });
};

export const useUpdateTimeLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: timeLogsApi.update,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CALENDAR_EVENTS.ALL }),
  });
};

export const useDeleteTimeLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: timeLogsApi.destroy,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIME_LOGS.CURRENT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CALENDAR_EVENTS.ALL }),
      ]),
  });
};

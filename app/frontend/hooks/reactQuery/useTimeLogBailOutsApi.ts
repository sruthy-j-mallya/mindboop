import { useMutation, useQueryClient } from "@tanstack/react-query";

import timeLogBailOutsApi from "@/apis/time_log_bail_outs";
import { QUERY_KEYS } from "@/constants/query";

export const useBailOutTimeLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: timeLogBailOutsApi.create,
    // The task gains a breadcrumb, so its detail and the lists (Home's) refetch too. The finished session also shows on the Calendar, and
    // counts towards its routine, if it has one.
    onSuccess: ({ timeLog: { taskId } }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIME_LOGS.CURRENT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASKS.DETAIL(taskId ?? "") }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASKS.LISTS }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CALENDAR_EVENTS.ALL }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROUTINES.ALL }),
      ]),
  });
};

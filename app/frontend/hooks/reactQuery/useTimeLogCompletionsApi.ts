import { useMutation, useQueryClient } from "@tanstack/react-query";

import timeLogCompletionsApi from "@/apis/time_log_completions";
import { QUERY_KEYS } from "@/constants/query";

export const useCompleteTimeLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: timeLogCompletionsApi.create,
    onSuccess: ({ timeLog }) => {
      // Completing a time log also marks its task as done, or counts towards its routine.
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROUTINES.ALL }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIME_LOGS.CURRENT }),
        ...(timeLog.taskId
          ? [
              queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASKS.DETAIL(timeLog.taskId) }),
              queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASKS.LISTS }),
            ]
          : []),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CALENDAR_EVENTS.ALL }),
      ]);
    },
  });
};

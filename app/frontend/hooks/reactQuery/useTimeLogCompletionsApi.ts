import { useMutation, useQueryClient } from "@tanstack/react-query";

import timeLogCompletionsApi from "@/apis/time_log_completions";
import { QUERY_KEYS } from "@/constants/query";

export const useCompleteTimeLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: timeLogCompletionsApi.create,
    onSuccess: ({ timeLog }) => {
      // Completing a time log also marks its task as done.
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIME_LOGS.CURRENT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASKS.DETAIL(timeLog.taskId) }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASKS.LISTS }),
      ]);
    },
  });
};

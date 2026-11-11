import { useMutation, useQueryClient } from "@tanstack/react-query";

import quickStartsApi from "@/apis/quick_starts";
import { QUERY_KEYS } from "@/constants/query";

export const useCreateQuickStart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: quickStartsApi.create,
    onSuccess: ({ task, timeLog }) => {
      queryClient.setQueryData(QUERY_KEYS.TASKS.DETAIL(task.id), task);
      // Seeded so the Timer page doesn't flash the previous session while it refetches.
      queryClient.setQueryData(QUERY_KEYS.TIME_LOGS.CURRENT, timeLog);
      return queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASKS.LISTS });
    },
  });
};

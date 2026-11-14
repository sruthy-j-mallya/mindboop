import { useMutation, useQueryClient } from "@tanstack/react-query";

import taskRestorationsApi from "@/apis/task_restorations";
import { QUERY_KEYS } from "@/constants/query";

// Undoes a delete: the task comes back to its lists.
export const useRestoreTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskRestorationsApi.create,
    onSuccess: ({ task }) => {
      queryClient.setQueryData(QUERY_KEYS.TASKS.DETAIL(task.id), task);
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASKS.LISTS }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIME_LOGS.CURRENT }),
      ]);
    },
  });
};

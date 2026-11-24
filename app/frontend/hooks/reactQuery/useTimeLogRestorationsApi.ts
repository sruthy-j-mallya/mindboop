import { useMutation, useQueryClient } from "@tanstack/react-query";

import timeLogRestorationsApi from "@/apis/time_log_restorations";
import { QUERY_KEYS } from "@/constants/query";

// Undoes a delete: the session comes back to the Calendar.
export const useRestoreTimeLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: timeLogRestorationsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CALENDAR_EVENTS.ALL }),
  });
};

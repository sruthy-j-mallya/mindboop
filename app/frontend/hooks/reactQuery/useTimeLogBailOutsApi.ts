import { useMutation, useQueryClient } from "@tanstack/react-query";

import timeLogBailOutsApi from "@/apis/time_log_bail_outs";
import { QUERY_KEYS } from "@/constants/query";

export const useBailOutTimeLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: timeLogBailOutsApi.create,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIME_LOGS.LISTS }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIME_LOGS.CURRENT }),
      ]),
  });
};

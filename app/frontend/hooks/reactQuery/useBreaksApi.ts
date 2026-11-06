import { type QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";

import breaksApi from "@/apis/breaks";
import type { TimeLogResponse } from "@/apis/types";
import { QUERY_KEYS } from "@/constants/query";

const updateTimeLogCaches = (queryClient: QueryClient, { timeLog }: TimeLogResponse) => {
  queryClient.setQueryData(QUERY_KEYS.TIME_LOGS.DETAIL(timeLog.id), timeLog);
  queryClient.setQueryData(QUERY_KEYS.TIME_LOGS.CURRENT, timeLog);

  return queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIME_LOGS.LISTS });
};

export const useStartBreak = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: breaksApi.create,
    onSuccess: (response) => updateTimeLogCaches(queryClient, response),
  });
};

export const useEndBreak = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: breaksApi.update,
    onSuccess: (response) => updateTimeLogCaches(queryClient, response),
  });
};

import { QueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/apis/axios";
import type { TimeLogResponse } from "@/apis/types";
import { QUERY_KEYS } from "@/constants/query";

declare module "@tanstack/react-query" {
  interface Register {
    defaultError: ApiError;
  }
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
});

// For mutations of the session in progress, which return the time log with its new state.
export const updateTimeLogCaches = (client: QueryClient, { timeLog }: TimeLogResponse) => {
  client.setQueryData(QUERY_KEYS.TIME_LOGS.CURRENT, timeLog);

  return client.invalidateQueries({ queryKey: QUERY_KEYS.TIME_LOGS.LISTS });
};

export default queryClient;

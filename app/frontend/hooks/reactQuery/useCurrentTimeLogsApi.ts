import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import currentTimeLogsApi from "@/apis/current_time_logs";
import type { TimeLog } from "@/apis/types";
import { QUERY_KEYS } from "@/constants/query";

export const useCurrentTimeLog = (options?: Omit<UseQueryOptions<TimeLog | null>, "queryKey" | "queryFn">) =>
  useQuery({
    queryKey: QUERY_KEYS.TIME_LOGS.CURRENT,
    queryFn: async () => (await currentTimeLogsApi.show()).timeLog,
    ...options,
  });

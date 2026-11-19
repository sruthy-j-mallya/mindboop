import { keepPreviousData, useQuery, type UseQueryOptions } from "@tanstack/react-query";

import routineTimeLogsApi from "@/apis/routine_time_logs";
import type { RoutineTimeLogsParams, TimeLog } from "@/apis/types";
import { QUERY_KEYS } from "@/constants/query";

// A routine's finished sessions in a range. Keeps the last month on screen while the next loads.
export const useRoutineTimeLogs = (
  params: RoutineTimeLogsParams,
  options?: Omit<UseQueryOptions<TimeLog[]>, "queryKey" | "queryFn">,
) =>
  useQuery({
    queryKey: QUERY_KEYS.ROUTINES.TIME_LOGS(params),
    queryFn: async () => (await routineTimeLogsApi.fetchList(params)).timeLogs,
    placeholderData: keepPreviousData,
    ...options,
  });

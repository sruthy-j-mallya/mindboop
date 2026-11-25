import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import taskCountsApi from "@/apis/task_counts";
import type { TaskCount } from "@/apis/types";
import { QUERY_KEYS } from "@/constants/query";

// The tasks left to do in the Inbox and each area.
export const useTaskCounts = (options?: Omit<UseQueryOptions<TaskCount[]>, "queryKey" | "queryFn">) =>
  useQuery({
    queryKey: QUERY_KEYS.TASKS.COUNTS,
    queryFn: async () => (await taskCountsApi.fetchList()).taskCounts,
    ...options,
  });

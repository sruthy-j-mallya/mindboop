import { keepPreviousData, useQuery, type UseQueryOptions } from "@tanstack/react-query";

import homeTasksApi from "@/apis/home_tasks";
import type { HomeTasksParams, HomeTasksResponse } from "@/apis/types";
import { QUERY_KEYS } from "@/constants/query";

// Keeps the last day's lists on screen at midnight, while the next day's load.
export const useHomeTasks = (
  params: HomeTasksParams,
  options?: Omit<UseQueryOptions<HomeTasksResponse>, "queryKey" | "queryFn">,
) =>
  useQuery({
    queryKey: QUERY_KEYS.TASKS.HOME(params),
    queryFn: () => homeTasksApi.fetchList(params),
    placeholderData: keepPreviousData,
    ...options,
  });

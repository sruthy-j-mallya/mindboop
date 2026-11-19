import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";

import lifeAreasApi from "@/apis/life_areas";
import type { LifeArea } from "@/apis/types";
import { QUERY_KEYS } from "@/constants/query";

// Every area at once: the sidebar lists them all, and the Calendar colours tasks by them.
export const useLifeAreas = (options?: Omit<UseQueryOptions<LifeArea[]>, "queryKey" | "queryFn">) =>
  useQuery({
    queryKey: QUERY_KEYS.LIFE_AREAS.LIST,
    queryFn: async () => (await lifeAreasApi.fetchList()).lifeAreas,
    ...options,
  });

const invalidateLifeAreas = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LIFE_AREAS.LIST });

export const useCreateLifeArea = () => {
  const queryClient = useQueryClient();

  return useMutation({ mutationFn: lifeAreasApi.create, onSuccess: () => invalidateLifeAreas(queryClient) });
};

export const useUpdateLifeArea = () => {
  const queryClient = useQueryClient();

  return useMutation({ mutationFn: lifeAreasApi.update, onSuccess: () => invalidateLifeAreas(queryClient) });
};

// The area's tasks go back to the Inbox, so every task query and the Calendar refresh too.
export const useDeleteLifeArea = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: lifeAreasApi.destroy,
    onSuccess: () =>
      Promise.all([
        invalidateLifeAreas(queryClient),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASKS.ALL }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CALENDAR_EVENTS.ALL }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIME_LOGS.CURRENT }),
      ]),
  });
};

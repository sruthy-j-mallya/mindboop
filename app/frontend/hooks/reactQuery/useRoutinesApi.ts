import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";

import routinesApi from "@/apis/routines";
import type { Routine } from "@/apis/types";
import { QUERY_KEYS } from "@/constants/query";

// Every routine at once, with its stats: the Routines page lists them all, and reminders check them all.
export const useRoutines = (options?: Omit<UseQueryOptions<Routine[]>, "queryKey" | "queryFn">) =>
  useQuery({
    queryKey: QUERY_KEYS.ROUTINES.LIST,
    queryFn: async () => (await routinesApi.fetchList()).routines,
    ...options,
  });

const invalidateRoutines = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROUTINES.LIST });

export const useCreateRoutine = () => {
  const queryClient = useQueryClient();

  return useMutation({ mutationFn: routinesApi.create, onSuccess: () => invalidateRoutines(queryClient) });
};

export const useUpdateRoutine = () => {
  const queryClient = useQueryClient();

  return useMutation({ mutationFn: routinesApi.update, onSuccess: () => invalidateRoutines(queryClient) });
};

// Its sessions stay, so the Calendar has nothing to refresh.
export const useDeleteRoutine = () => {
  const queryClient = useQueryClient();

  return useMutation({ mutationFn: routinesApi.destroy, onSuccess: () => invalidateRoutines(queryClient) });
};

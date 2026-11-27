import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";

import routinesApi from "@/apis/routines";
import type { MoveRoutinePayload, Routine } from "@/apis/types";
import { QUERY_KEYS } from "@/constants/query";

// Every routine at once, with its stats: the Routines page lists them all, and reminders check them all.
export const useRoutines = (options?: Omit<UseQueryOptions<Routine[]>, "queryKey" | "queryFn">) =>
  useQuery({
    queryKey: QUERY_KEYS.ROUTINES.LIST,
    queryFn: async () => (await routinesApi.fetchList()).routines,
    ...options,
  });

const MOVE_ROUTINE_MUTATION_KEY = ["routines", "move"];

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

const applyMove = (routines: Routine[], { id, position }: MoveRoutinePayload) => {
  const moved = routines.find((routine) => routine.id === id);
  if (!moved) return routines;

  return routines.filter((routine) => routine.id !== id).toSpliced(position, 0, moved);
};

// A move shows at once, as a dragged routine would otherwise jump back until the server answers, and rolls back if it
// fails. Moves reach the server one at a time (`scope`), in the order made; the last one to finish refreshes the list.
export const useMoveRoutine = () => {
  const queryClient = useQueryClient();
  const queryKey = QUERY_KEYS.ROUTINES.LIST;

  return useMutation({
    mutationKey: MOVE_ROUTINE_MUTATION_KEY,
    scope: { id: "moveRoutine" },
    mutationFn: (payload: MoveRoutinePayload) => routinesApi.update(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey });
      const previousRoutines = queryClient.getQueryData<Routine[]>(queryKey);
      if (previousRoutines) queryClient.setQueryData(queryKey, applyMove(previousRoutines, payload));

      return { previousRoutines };
    },
    onError: (_error, _payload, context) => {
      if (context?.previousRoutines) queryClient.setQueryData(queryKey, context.previousRoutines);
    },
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: MOVE_ROUTINE_MUTATION_KEY }) > 1) return undefined;

      return invalidateRoutines(queryClient);
    },
  });
};

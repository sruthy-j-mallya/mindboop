import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";

import lifeAreasApi from "@/apis/life_areas";
import type { CreateLifeAreaPayload, LifeArea, MoveLifeAreaPayload } from "@/apis/types";
import { QUERY_KEYS } from "@/constants/query";

const MOVE_LIFE_AREA_MUTATION_KEY = ["lifeAreas", "move"];

// Deleted areas too, to show (as on the Calendar) the one a completed task or a time log is in.
export const useAllLifeAreas = (options?: Omit<UseQueryOptions<LifeArea[]>, "queryKey" | "queryFn">) =>
  useQuery({
    queryKey: QUERY_KEYS.LIFE_AREAS.LIST,
    queryFn: async () => (await lifeAreasApi.fetchList()).lifeAreas,
    ...options,
  });

const selectKept = (lifeAreas: LifeArea[]) => lifeAreas.filter(({ isDeleted }) => !isDeleted);

// Every area there is to list, open or pick.
export const useLifeAreas = (options?: Omit<UseQueryOptions<LifeArea[]>, "queryKey" | "queryFn">) =>
  useAllLifeAreas({ select: selectKept, ...options });

const invalidateLifeAreas = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LIFE_AREAS.LIST });

export const useCreateLifeArea = () => {
  const queryClient = useQueryClient();

  return useMutation({ mutationFn: lifeAreasApi.create, onSuccess: () => invalidateLifeAreas(queryClient) });
};

// One at a time, so they're listed (oldest first) in the order given.
const createInOrder = async (payloads: CreateLifeAreaPayload[]) => {
  for (const payload of payloads) await lifeAreasApi.create(payload);
};

// Adds several areas. If one fails, those before it were still added, so the list refreshes then too. That refresh isn't
// waited for: it can unmount the caller, which has the error to show first.
export const useCreateLifeAreas = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInOrder,
    onSuccess: () => invalidateLifeAreas(queryClient),
    onError: () => {
      void invalidateLifeAreas(queryClient);
    },
  });
};

export const useUpdateLifeArea = () => {
  const queryClient = useQueryClient();

  return useMutation({ mutationFn: lifeAreasApi.update, onSuccess: () => invalidateLifeAreas(queryClient) });
};

// The position counts undeleted areas only, so the deleted ones go after them.
const applyMove = (lifeAreas: LifeArea[], { id, position }: MoveLifeAreaPayload) => {
  const kept = selectKept(lifeAreas);
  const moved = kept.find((lifeArea) => lifeArea.id === id);
  if (!moved) return lifeAreas;

  const rest = kept.filter((lifeArea) => lifeArea.id !== id);

  return [...rest.toSpliced(position, 0, moved), ...lifeAreas.filter(({ isDeleted }) => isDeleted)];
};

// A move shows at once, as a dragged area would otherwise jump back until the server answers, and rolls back if it
// fails. Moves reach the server one at a time (`scope`), in the order made; the last one to finish refreshes the list.
export const useMoveLifeArea = () => {
  const queryClient = useQueryClient();
  const queryKey = QUERY_KEYS.LIFE_AREAS.LIST;

  return useMutation({
    mutationKey: MOVE_LIFE_AREA_MUTATION_KEY,
    scope: { id: "moveLifeArea" },
    mutationFn: (payload: MoveLifeAreaPayload) => lifeAreasApi.update(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey });
      const previousLifeAreas = queryClient.getQueryData<LifeArea[]>(queryKey);
      if (previousLifeAreas) queryClient.setQueryData(queryKey, applyMove(previousLifeAreas, payload));

      return { previousLifeAreas };
    },
    onError: (_error, _payload, context) => {
      if (context?.previousLifeAreas) queryClient.setQueryData(queryKey, context.previousLifeAreas);
    },
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: MOVE_LIFE_AREA_MUTATION_KEY }) > 1) return undefined;

      return invalidateLifeAreas(queryClient);
    },
  });
};

// The area's uncompleted tasks move to another area or the Inbox, so every task query and the Calendar refresh too. The refresh isn't
// waited for: the caller has to leave the deleted area's page before its list is found gone.
export const useDeleteLifeArea = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: lifeAreasApi.destroy,
    onSuccess: () => {
      void invalidateLifeAreas(queryClient);
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASKS.ALL });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CALENDAR_EVENTS.ALL });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIME_LOGS.CURRENT });
    },
  });
};

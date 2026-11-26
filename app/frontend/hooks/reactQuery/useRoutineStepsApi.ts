import { type QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/apis/axios";
import routineStepsApi from "@/apis/routine_steps";
import type {
  CreateRoutineStepPayload,
  DeleteRoutineStepPayload,
  Routine,
  RoutineResponse,
  UpdateRoutineStepPayload,
} from "@/apis/types";
import { QUERY_KEYS } from "@/constants/query";

const ROUTINE_STEPS_MUTATION_KEY = ["routineSteps"];

const replaceRoutine = (
  routines: Routine[] | undefined,
  routineId: string,
  apply: (routine: Routine) => Routine,
) => routines?.map((routine) => (routine.id === routineId ? apply(routine) : routine));

// The answer carries the steps but not the stats, so only the steps are copied in. While another change to the steps is
// still in flight, this older answer would undo its optimistic update, so the last one to finish writes the cache.
const saveSteps = (queryClient: QueryClient, { routine: { id, steps } }: RoutineResponse) => {
  if (queryClient.isMutating({ mutationKey: ROUTINE_STEPS_MUTATION_KEY }) > 1) return;

  queryClient.setQueryData<Routine[]>(QUERY_KEYS.ROUTINES.LIST, (routines) =>
    replaceRoutine(routines, id, (routine) => ({ ...routine, steps })),
  );
};

const applyUpdate = (routine: Routine, { id, position, ...changes }: UpdateRoutineStepPayload): Routine => {
  const steps = routine.steps.map((step) => (step.id === id ? { ...step, ...changes } : step));
  if (position === undefined) return { ...routine, steps };

  const moved = steps.find((step) => step.id === id);
  const rest = steps.filter((step) => step.id !== id);

  return { ...routine, steps: moved ? rest.toSpliced(position, 0, moved) : steps };
};

// The new step gets a stand-in id until the server answers with the whole routine.
const applyCreate = (routine: Routine, { title, position }: CreateRoutineStepPayload): Routine => {
  const step = { id: `new-${crypto.randomUUID()}`, title };

  return { ...routine, steps: routine.steps.toSpliced(position ?? routine.steps.length, 0, step) };
};

const applyDelete = (routine: Routine, { id }: DeleteRoutineStepPayload): Routine => ({
  ...routine,
  steps: routine.steps.filter((step) => step.id !== id),
});

// Shows a change in the cache at once, keeping the routines as they were so a failed request can put them back.
const optimisticallyUpdate =
  <Payload extends { routineId: string }>(
    queryClient: QueryClient,
    apply: (routine: Routine, payload: Payload) => Routine,
  ) =>
  async (payload: Payload) => {
    const queryKey = QUERY_KEYS.ROUTINES.LIST;
    await queryClient.cancelQueries({ queryKey });
    const previousRoutines = queryClient.getQueryData<Routine[]>(queryKey);
    queryClient.setQueryData(
      queryKey,
      replaceRoutine(previousRoutines, payload.routineId, (routine) => apply(routine, payload)),
    );

    return { previousRoutines };
  };

const rollBack =
  (queryClient: QueryClient) => (_: ApiError, __: unknown, context?: { previousRoutines?: Routine[] }) => {
    if (context?.previousRoutines)
      queryClient.setQueryData(QUERY_KEYS.ROUTINES.LIST, context.previousRoutines);
  };

// A new step shows at once, so the next one typed straight after it lands below it.
export const useCreateRoutineStep = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ROUTINE_STEPS_MUTATION_KEY,
    mutationFn: routineStepsApi.create,
    onMutate: optimisticallyUpdate(queryClient, applyCreate),
    onError: rollBack(queryClient),
    onSuccess: (response) => saveSteps(queryClient, response),
  });
};

// Renames and moves show at once (a dragged step would otherwise jump back until the server answers).
export const useUpdateRoutineStep = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ROUTINE_STEPS_MUTATION_KEY,
    mutationFn: routineStepsApi.update,
    onMutate: optimisticallyUpdate(queryClient, applyUpdate),
    onError: rollBack(queryClient),
    onSuccess: (response) => saveSteps(queryClient, response),
  });
};

export const useDeleteRoutineStep = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ROUTINE_STEPS_MUTATION_KEY,
    mutationFn: routineStepsApi.destroy,
    onMutate: optimisticallyUpdate(queryClient, applyDelete),
    onError: rollBack(queryClient),
    onSuccess: (response) => saveSteps(queryClient, response),
  });
};

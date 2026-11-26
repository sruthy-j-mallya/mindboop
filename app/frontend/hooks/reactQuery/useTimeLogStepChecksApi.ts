import { type QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/apis/axios";
import timeLogStepChecksApi from "@/apis/time_log_step_checks";
import type { TimeLog, TimeLogResponse, TimeLogStepCheckPayload } from "@/apis/types";
import { QUERY_KEYS } from "@/constants/query";
import { updateTimeLogCaches } from "@/utils/queryClient";

const STEP_CHECKS_MUTATION_KEY = ["timeLogStepChecks"];

// While another tick is still in flight, this older answer would undo its optimistic update, so the last one to finish
// writes the cache.
const saveTimeLog = (queryClient: QueryClient, response: TimeLogResponse) => {
  if (queryClient.isMutating({ mutationKey: STEP_CHECKS_MUTATION_KEY }) > 1) return;

  updateTimeLogCaches(queryClient, response);
};

// A tick shows at once, and goes back if the request fails.
const useStepCheckMutation = (
  mutationFn: (payload: TimeLogStepCheckPayload) => Promise<TimeLogResponse>,
  isChecked: boolean,
) => {
  const queryClient = useQueryClient();
  const queryKey = QUERY_KEYS.TIME_LOGS.CURRENT;

  return useMutation({
    mutationKey: STEP_CHECKS_MUTATION_KEY,
    mutationFn,
    onMutate: async ({ routineStepId }: TimeLogStepCheckPayload) => {
      await queryClient.cancelQueries({ queryKey });
      const previousTimeLog = queryClient.getQueryData<TimeLog | null>(queryKey);
      if (previousTimeLog) {
        const others = previousTimeLog.checkedRoutineStepIds.filter((id) => id !== routineStepId);
        queryClient.setQueryData<TimeLog>(queryKey, {
          ...previousTimeLog,
          checkedRoutineStepIds: isChecked ? [...others, routineStepId] : others,
        });
      }

      return { previousTimeLog };
    },
    onError: (_: ApiError, __, context) => {
      if (context?.previousTimeLog) queryClient.setQueryData(queryKey, context.previousTimeLog);
    },
    onSuccess: (response) => saveTimeLog(queryClient, response),
  });
};

export const useCheckRoutineStep = () => useStepCheckMutation(timeLogStepChecksApi.create, true);

export const useUncheckRoutineStep = () => useStepCheckMutation(timeLogStepChecksApi.destroy, false);

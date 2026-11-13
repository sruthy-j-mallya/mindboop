import { type QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";

import checklistItemsApi from "@/apis/checklist_items";
import type { Task, TaskResponse, UpdateChecklistItemPayload } from "@/apis/types";
import { QUERY_KEYS } from "@/constants/query";

const CHECKLIST_ITEMS_MUTATION_KEY = ["checklistItems"];

// While another change to the steps is still in flight, this older answer would undo its optimistic update, so the
// last one to finish writes the cache.
const saveTask = (queryClient: QueryClient, { task }: TaskResponse) => {
  if (queryClient.isMutating({ mutationKey: CHECKLIST_ITEMS_MUTATION_KEY }) > 1) return undefined;

  queryClient.setQueryData(QUERY_KEYS.TASKS.DETAIL(task.id), task);
  return queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASKS.LISTS });
};

const applyUpdate = (task: Task, { id, position, ...changes }: UpdateChecklistItemPayload): Task => {
  const items = task.checklistItems.map((item) => (item.id === id ? { ...item, ...changes } : item));
  if (position === undefined) return { ...task, checklistItems: items };

  const moved = items.find((item) => item.id === id);
  const rest = items.filter((item) => item.id !== id);

  return { ...task, checklistItems: moved ? rest.toSpliced(position, 0, moved) : items };
};

export const useCreateChecklistItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: CHECKLIST_ITEMS_MUTATION_KEY,
    mutationFn: checklistItemsApi.create,
    onSuccess: (response) => saveTask(queryClient, response),
  });
};

// Ticks, renames and moves show at once (a dragged step would otherwise jump back until the server answers), and
// roll back if the request fails.
export const useUpdateChecklistItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: CHECKLIST_ITEMS_MUTATION_KEY,
    mutationFn: checklistItemsApi.update,
    onMutate: async (payload) => {
      const queryKey = QUERY_KEYS.TASKS.DETAIL(payload.taskId);
      await queryClient.cancelQueries({ queryKey });
      const previousTask = queryClient.getQueryData<Task>(queryKey);
      if (previousTask) queryClient.setQueryData(queryKey, applyUpdate(previousTask, payload));

      return { previousTask };
    },
    onError: (_, { taskId }, context) => {
      if (context?.previousTask)
        queryClient.setQueryData(QUERY_KEYS.TASKS.DETAIL(taskId), context.previousTask);
    },
    onSuccess: (response) => saveTask(queryClient, response),
  });
};

export const useDeleteChecklistItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: CHECKLIST_ITEMS_MUTATION_KEY,
    mutationFn: checklistItemsApi.destroy,
    onSuccess: (response) => saveTask(queryClient, response),
  });
};

import { type QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/apis/axios";
import checklistItemsApi from "@/apis/checklist_items";
import type {
  CreateChecklistItemPayload,
  Task,
  TaskResponse,
  UpdateChecklistItemPayload,
} from "@/apis/types";
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

// The new item gets a stand-in id until the server answers with the whole task.
const applyCreate = (task: Task, { title, position }: CreateChecklistItemPayload): Task => {
  const item = { id: `new-${crypto.randomUUID()}`, title, isCompleted: false };
  const index = position ?? task.checklistItems.length;

  return { ...task, checklistItems: task.checklistItems.toSpliced(index, 0, item) };
};

// Shows a change in the cache at once, keeping the task as it was so a failed request can put it back.
const optimisticallyUpdate =
  <Payload extends { taskId: string }>(
    queryClient: QueryClient,
    apply: (task: Task, payload: Payload) => Task,
  ) =>
  async (payload: Payload) => {
    const queryKey = QUERY_KEYS.TASKS.DETAIL(payload.taskId);
    await queryClient.cancelQueries({ queryKey });
    const previousTask = queryClient.getQueryData<Task>(queryKey);
    if (previousTask) queryClient.setQueryData(queryKey, apply(previousTask, payload));

    return { previousTask };
  };

const rollBack =
  (queryClient: QueryClient) =>
  (_: ApiError, { taskId }: { taskId: string }, context?: { previousTask?: Task }) => {
    if (context?.previousTask)
      queryClient.setQueryData(QUERY_KEYS.TASKS.DETAIL(taskId), context.previousTask);
  };

// A new step shows at once, so the next one typed straight after it lands below it.
export const useCreateChecklistItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: CHECKLIST_ITEMS_MUTATION_KEY,
    mutationFn: checklistItemsApi.create,
    onMutate: optimisticallyUpdate(queryClient, applyCreate),
    onError: rollBack(queryClient),
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
    onMutate: optimisticallyUpdate(queryClient, applyUpdate),
    onError: rollBack(queryClient),
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

import { type QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/apis/axios";
import checklistItemsApi from "@/apis/checklist_items";
import type {
  CreateChecklistItemPayload,
  DeleteChecklistItemPayload,
  Task,
  TaskResponse,
  UpdateChecklistItemPayload,
} from "@/apis/types";
import { QUERY_KEYS } from "@/constants/query";

const CHECKLIST_ITEMS_MUTATION_KEY = ["checklistItems"];

// The task before a change was shown, and as it was shown with it.
type OptimisticContext = { previousTask?: Task; shownTask?: Task };

// Changes to the steps reach the server one at a time (`scope`), in the order made: each position counts on the changes
// before it.
const CHECKLIST_ITEMS_MUTATION = {
  mutationKey: CHECKLIST_ITEMS_MUTATION_KEY,
  scope: { id: "checklistItems" },
};

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

// The real ids of items that were shown under a stand-in one while they were being created.
const realIds = new Map<string, string>();

// Looked up as a change is sent: by then, the item's own creation has been answered.
const toRealId = <Payload extends { id: string }>(payload: Payload): Payload => ({
  ...payload,
  id: realIds.get(payload.id) ?? payload.id,
});

// Items are created one at a time, so the one just created is the only one in the answer that wasn't known before.
const rememberRealId = ({ task }: TaskResponse, { previousTask, shownTask }: OptimisticContext) => {
  const knownIds = new Set(previousTask?.checklistItems.map(({ id }) => id));
  const createdIds = new Set(realIds.values());
  const standIn = shownTask?.checklistItems.find(({ id }) => !knownIds.has(id));
  const created = task.checklistItems.find(({ id }) => !knownIds.has(id) && !createdIds.has(id));
  if (standIn && created) realIds.set(standIn.id, created.id);
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
  async (payload: Payload): Promise<OptimisticContext> => {
    const queryKey = QUERY_KEYS.TASKS.DETAIL(payload.taskId);
    await queryClient.cancelQueries({ queryKey });
    const previousTask = queryClient.getQueryData<Task>(queryKey);
    const shownTask = previousTask && apply(previousTask, payload);
    if (shownTask) queryClient.setQueryData(queryKey, shownTask);

    return { previousTask, shownTask };
  };

const rollBack =
  (queryClient: QueryClient) =>
  (_: ApiError, { taskId }: { taskId: string }, context?: OptimisticContext) => {
    if (context?.previousTask)
      queryClient.setQueryData(QUERY_KEYS.TASKS.DETAIL(taskId), context.previousTask);
  };

// A new step shows at once, so the next one typed straight after it lands below it.
export const useCreateChecklistItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    ...CHECKLIST_ITEMS_MUTATION,
    mutationFn: checklistItemsApi.create,
    onMutate: optimisticallyUpdate(queryClient, applyCreate),
    onError: rollBack(queryClient),
    onSuccess: (response, _payload, context) => {
      rememberRealId(response, context);

      return saveTask(queryClient, response);
    },
  });
};

// Ticks, renames and moves show at once (a dragged step would otherwise jump back until the server answers), and
// roll back if the request fails.
export const useUpdateChecklistItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    ...CHECKLIST_ITEMS_MUTATION,
    mutationFn: (payload: UpdateChecklistItemPayload) => checklistItemsApi.update(toRealId(payload)),
    onMutate: optimisticallyUpdate(queryClient, applyUpdate),
    onError: rollBack(queryClient),
    onSuccess: (response) => saveTask(queryClient, response),
  });
};

export const useDeleteChecklistItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    ...CHECKLIST_ITEMS_MUTATION,
    mutationFn: (payload: DeleteChecklistItemPayload) => checklistItemsApi.destroy(toRealId(payload)),
    onSuccess: (response) => saveTask(queryClient, response),
  });
};

import http from "@/apis/axios";
import type {
  CreateChecklistItemPayload,
  DeleteChecklistItemPayload,
  TaskResponse,
  UpdateChecklistItemPayload,
} from "@/apis/types";

const checklistItemsURL = (taskId: string) => `/tasks/${encodeURIComponent(taskId)}/checklist_items`;

const checklistItemURL = (taskId: string, id: string) =>
  `${checklistItemsURL(taskId)}/${encodeURIComponent(id)}`;

// Each call answers with the whole task, since a move also changes the other items' order.
const create = ({ taskId, ...payload }: CreateChecklistItemPayload) =>
  http.post<TaskResponse>(checklistItemsURL(taskId), payload).then(({ data }) => data);

const update = ({ taskId, id, ...payload }: UpdateChecklistItemPayload) =>
  http.patch<TaskResponse>(checklistItemURL(taskId, id), payload).then(({ data }) => data);

const destroy = ({ taskId, id }: DeleteChecklistItemPayload) =>
  http.delete<TaskResponse>(checklistItemURL(taskId, id)).then(({ data }) => data);

const checklistItemsApi = { create, update, destroy };

export default checklistItemsApi;

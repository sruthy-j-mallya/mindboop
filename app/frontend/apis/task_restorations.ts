import http from "@/apis/axios";
import type { TaskResponse } from "@/apis/types";

const create = (taskId: string) =>
  http.post<TaskResponse>(`/tasks/${encodeURIComponent(taskId)}/restoration`).then(({ data }) => data);

const taskRestorationsApi = { create };

export default taskRestorationsApi;

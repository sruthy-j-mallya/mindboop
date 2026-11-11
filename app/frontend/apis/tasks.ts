import http from "@/apis/axios";
import type {
  CreateTaskPayload,
  TaskListParams,
  TaskListResponse,
  TaskResponse,
  UpdateTaskPayload,
} from "@/apis/types";

const TASKS_URL = "/tasks";

const taskURL = (id: string) => `${TASKS_URL}/${encodeURIComponent(id)}`;

const fetchList = (params: TaskListParams = {}) =>
  http.get<TaskListResponse>(TASKS_URL, { params }).then(({ data }) => data);

const show = (id: string) => http.get<TaskResponse>(taskURL(id)).then(({ data }) => data);

const create = (payload: CreateTaskPayload) =>
  http.post<TaskResponse>(TASKS_URL, payload).then(({ data }) => data);

const update = ({ id, ...payload }: UpdateTaskPayload) =>
  http.patch<TaskResponse>(taskURL(id), payload).then(({ data }) => data);

const destroy = (id: string) => http.delete(taskURL(id));

const tasksApi = { fetchList, show, create, update, destroy };

export default tasksApi;

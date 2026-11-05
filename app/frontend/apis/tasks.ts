import http from "@/apis/axios";

export type ChecklistItem = { id: string; title: string; isCompleted: boolean };

export type Task = {
  id: string;
  title: string;
  description: string | null;
  estimatedMinutes: number | null;
  isDuration: boolean;
  isAllDay: boolean;
  isCompleted: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
  checklistItems: ChecklistItem[];
};

export type TaskListParams = { page?: number };

export type TaskListResponse = { tasks: Task[]; tasksCount: number; page: number; totalPages: number };

export type TaskResponse = { task: Task };

type TaskFields = Pick<Task, "title"> &
  Partial<
    Pick<
      Task,
      "description" | "estimatedMinutes" | "isDuration" | "isAllDay" | "isCompleted" | "startsAt" | "endsAt"
    >
  >;

export type ChecklistItemPayload = Pick<ChecklistItem, "title"> & Partial<Pick<ChecklistItem, "isCompleted">>;

export type CreateTaskPayload = TaskFields & { checklistItemsAttributes?: ChecklistItemPayload[] };

export type UpdateTaskPayload = Partial<TaskFields> & Pick<Task, "id">;

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

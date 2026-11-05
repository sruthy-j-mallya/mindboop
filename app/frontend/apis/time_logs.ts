import http from "@/apis/axios";

export type TimeLogMode = "timer" | "stopwatch";

export type TimeLog = {
  id: string;
  taskId: string;
  mode: TimeLogMode;
  timerPreset: number | null;
  accumulatedElapsedSeconds: number;
  pauseCount: number;
  isRunning: boolean;
  currentRunStartedAt: string | null;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TimeLogListParams = { page?: number; taskId?: string };

export type TimeLogListResponse = {
  timeLogs: TimeLog[];
  timeLogsCount: number;
  page: number;
  totalPages: number;
};

export type TimeLogResponse = { timeLog: TimeLog };

type TimeLogFields = Pick<TimeLog, "mode" | "startedAt"> &
  Partial<
    Pick<
      TimeLog,
      | "timerPreset"
      | "accumulatedElapsedSeconds"
      | "pauseCount"
      | "isRunning"
      | "currentRunStartedAt"
      | "completedAt"
    >
  >;

export type CreateTimeLogPayload = TimeLogFields & Pick<TimeLog, "taskId">;

export type UpdateTimeLogPayload = Partial<TimeLogFields> & Pick<TimeLog, "id">;

const TIME_LOGS_URL = "/time_logs";

const timeLogURL = (id: string) => `${TIME_LOGS_URL}/${encodeURIComponent(id)}`;

const fetchList = (params: TimeLogListParams = {}) =>
  http.get<TimeLogListResponse>(TIME_LOGS_URL, { params }).then(({ data }) => data);

const show = (id: string) => http.get<TimeLogResponse>(timeLogURL(id)).then(({ data }) => data);

const create = (payload: CreateTimeLogPayload) =>
  http.post<TimeLogResponse>(TIME_LOGS_URL, payload).then(({ data }) => data);

const update = ({ id, ...payload }: UpdateTimeLogPayload) =>
  http.patch<TimeLogResponse>(timeLogURL(id), payload).then(({ data }) => data);

const destroy = (id: string) => http.delete(timeLogURL(id));

const timeLogsApi = { fetchList, show, create, update, destroy };

export default timeLogsApi;

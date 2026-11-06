import http from "@/apis/axios";
import type {
  CreateTimeLogPayload,
  TimeLogListParams,
  TimeLogListResponse,
  TimeLogResponse,
  UpdateTimeLogPayload,
} from "@/apis/types";

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

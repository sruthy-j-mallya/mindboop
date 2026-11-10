import http from "@/apis/axios";
import type { CreateTimeLogPayload, TimeLogResponse } from "@/apis/types";

const TIME_LOGS_URL = "/time_logs";

const create = (payload: CreateTimeLogPayload) =>
  http.post<TimeLogResponse>(TIME_LOGS_URL, payload).then(({ data }) => data);

const destroy = (id: string) => http.delete(`${TIME_LOGS_URL}/${encodeURIComponent(id)}`);

const timeLogsApi = { create, destroy };

export default timeLogsApi;

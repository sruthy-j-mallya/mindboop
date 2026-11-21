import http from "@/apis/axios";
import type { TimeLogResponse } from "@/apis/types";

const create = (timeLogId: string) =>
  http
    .post<TimeLogResponse>(`/time_logs/${encodeURIComponent(timeLogId)}/restoration`)
    .then(({ data }) => data);

const timeLogRestorationsApi = { create };

export default timeLogRestorationsApi;

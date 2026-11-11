import http from "@/apis/axios";
import type { TimeLogResponse } from "@/apis/types";

const create = (timeLogId: string) =>
  http
    .post<TimeLogResponse>(`/time_logs/${encodeURIComponent(timeLogId)}/completion`)
    .then(({ data }) => data);

const timeLogCompletionsApi = { create };

export default timeLogCompletionsApi;

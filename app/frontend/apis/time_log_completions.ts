import http from "@/apis/axios";
import type { CreateCompletionPayload, TimeLogResponse } from "@/apis/types";

const create = ({ timeLogId, ...payload }: CreateCompletionPayload) =>
  http
    .post<TimeLogResponse>(`/time_logs/${encodeURIComponent(timeLogId)}/completion`, payload)
    .then(({ data }) => data);

const timeLogCompletionsApi = { create };

export default timeLogCompletionsApi;

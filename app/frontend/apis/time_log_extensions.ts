import http from "@/apis/axios";
import type { ExtendTimeLogPayload, TimeLogResponse } from "@/apis/types";

const create = ({ timeLogId, ...payload }: ExtendTimeLogPayload) =>
  http
    .post<TimeLogResponse>(`/time_logs/${encodeURIComponent(timeLogId)}/extension`, payload)
    .then(({ data }) => data);

const timeLogExtensionsApi = { create };

export default timeLogExtensionsApi;

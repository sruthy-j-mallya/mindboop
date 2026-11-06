import http from "@/apis/axios";
import type { CreateBailOutPayload, TimeLogResponse } from "@/apis/types";

const create = ({ timeLogId, ...payload }: CreateBailOutPayload) =>
  http
    .post<TimeLogResponse>(`/time_logs/${encodeURIComponent(timeLogId)}/bail_out`, payload)
    .then(({ data }) => data);

const timeLogBailOutsApi = { create };

export default timeLogBailOutsApi;

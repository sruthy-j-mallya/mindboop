import http from "@/apis/axios";
import type { CreateBreakPayload, TimeLogResponse } from "@/apis/types";

const breakURL = (timeLogId: string) => `/time_logs/${encodeURIComponent(timeLogId)}/break`;

const create = ({ timeLogId, ...payload }: CreateBreakPayload) =>
  http.post<TimeLogResponse>(breakURL(timeLogId), payload).then(({ data }) => data);

const update = (timeLogId: string) =>
  http.patch<TimeLogResponse>(breakURL(timeLogId)).then(({ data }) => data);

const breaksApi = { create, update };

export default breaksApi;

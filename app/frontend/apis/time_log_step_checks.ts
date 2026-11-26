import http from "@/apis/axios";
import type { TimeLogResponse, TimeLogStepCheckPayload } from "@/apis/types";

const stepChecksURL = (timeLogId: string) => `/time_logs/${encodeURIComponent(timeLogId)}/step_checks`;

const create = ({ timeLogId, routineStepId }: TimeLogStepCheckPayload) =>
  http.post<TimeLogResponse>(stepChecksURL(timeLogId), { routineStepId }).then(({ data }) => data);

const destroy = ({ timeLogId, routineStepId }: TimeLogStepCheckPayload) =>
  http
    .delete<TimeLogResponse>(`${stepChecksURL(timeLogId)}/${encodeURIComponent(routineStepId)}`)
    .then(({ data }) => data);

const timeLogStepChecksApi = { create, destroy };

export default timeLogStepChecksApi;

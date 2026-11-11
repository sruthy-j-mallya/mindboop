import http from "@/apis/axios";
import type { RequestResetPayload, ResetPasswordPayload } from "@/apis/types";

const create = (payload: RequestResetPayload) =>
  http.post<{ message: string }>("/passwords", payload).then(({ data }) => data);

const update = ({ token, ...payload }: ResetPasswordPayload) =>
  http.patch(`/passwords/${encodeURIComponent(token)}`, payload);

const passwordsApi = { create, update };

export default passwordsApi;

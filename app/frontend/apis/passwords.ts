import http from "@/apis/axios";

export type RequestResetPayload = { emailAddress: string };

export type ResetPasswordPayload = { token: string; password: string; passwordConfirmation: string };

const create = (payload: RequestResetPayload) =>
  http.post<{ message: string }>("/passwords", payload).then(({ data }) => data);

const update = ({ token, ...payload }: ResetPasswordPayload) =>
  http.patch(`/passwords/${encodeURIComponent(token)}`, payload);

const passwordsApi = { create, update };

export default passwordsApi;

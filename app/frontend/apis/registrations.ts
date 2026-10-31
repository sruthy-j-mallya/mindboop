import http from "@/apis/axios";
import type { UserResponse } from "@/apis/sessions";

export type SignupPayload = { token: string; password: string; passwordConfirmation: string };

const create = (payload: SignupPayload) =>
  http.post<UserResponse>("/registration", payload).then(({ data }) => data);

const registrationsApi = { create };

export default registrationsApi;

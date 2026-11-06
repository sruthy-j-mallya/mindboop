import http from "@/apis/axios";
import type { SignupPayload, UserResponse } from "@/apis/types";

const create = (payload: SignupPayload) =>
  http.post<UserResponse>("/registration", payload).then(({ data }) => data);

const registrationsApi = { create };

export default registrationsApi;

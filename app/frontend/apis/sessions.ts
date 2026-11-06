import http from "@/apis/axios";
import type { LoginPayload, UserResponse } from "@/apis/types";

const SESSION_URL = "/session";

const show = () => http.get<UserResponse>(SESSION_URL).then(({ data }) => data);

const create = (payload: LoginPayload) =>
  http.post<UserResponse>(SESSION_URL, payload).then(({ data }) => data);

const destroy = () => http.delete(SESSION_URL);

const sessionsApi = { show, create, destroy };

export default sessionsApi;

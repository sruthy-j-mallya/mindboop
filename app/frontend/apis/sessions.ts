import http from "@/apis/axios";

export type User = { id: string; emailAddress: string };

export type UserResponse = { user: User };

export type LoginPayload = { emailAddress: string; password: string };

const SESSION_URL = "/session";

const show = () => http.get<UserResponse>(SESSION_URL).then(({ data }) => data);

const create = (payload: LoginPayload) =>
  http.post<UserResponse>(SESSION_URL, payload).then(({ data }) => data);

const destroy = () => http.delete(SESSION_URL);

const sessionsApi = { show, create, destroy };

export default sessionsApi;

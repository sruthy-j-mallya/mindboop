import axios, { type AxiosError } from "axios";

import { API_BASE_PATH } from "@/constants";
import { keysToCamelCase, keysToSnakeCase } from "@/utils";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

const csrfToken = () => document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? "";

const http = axios.create({ baseURL: API_BASE_PATH, headers: { Accept: "application/json" } });

http.interceptors.request.use((config) => {
  config.headers.set("X-CSRF-Token", csrfToken());
  config.data = keysToSnakeCase(config.data);
  config.params = keysToSnakeCase(config.params);
  return config;
});

http.interceptors.response.use(
  (response) => {
    response.data = keysToCamelCase(response.data);
    return response;
  },
  (error: AxiosError<{ error?: string }>) => {
    const status = error.response?.status ?? 0;
    const message = error.response?.data?.error ?? `Request failed with status ${status}`;
    return Promise.reject(new ApiError(status, message));
  },
);

export default http;

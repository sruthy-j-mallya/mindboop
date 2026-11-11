import http from "@/apis/axios";
import type { RequestEmailConfirmationPayload } from "@/apis/types";

const create = (payload: RequestEmailConfirmationPayload) =>
  http.post<{ message: string }>("/email_confirmations", payload).then(({ data }) => data);

const emailConfirmationsApi = { create };

export default emailConfirmationsApi;

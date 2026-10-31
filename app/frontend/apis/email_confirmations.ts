import http from "@/apis/axios";

export type RequestEmailConfirmationPayload = { emailAddress: string };

const create = (payload: RequestEmailConfirmationPayload) =>
  http.post<{ message: string }>("/email_confirmations", payload).then(({ data }) => data);

const emailConfirmationsApi = { create };

export default emailConfirmationsApi;

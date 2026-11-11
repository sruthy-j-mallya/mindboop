import http from "@/apis/axios";
import type { CreateQuickStartPayload, QuickStartResponse } from "@/apis/types";

const create = (payload: CreateQuickStartPayload) =>
  http.post<QuickStartResponse>("/quick_starts", payload).then(({ data }) => data);

const quickStartsApi = { create };

export default quickStartsApi;

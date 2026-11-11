import http from "@/apis/axios";
import type { CurrentTimeLogResponse } from "@/apis/types";

const show = () => http.get<CurrentTimeLogResponse>("/current_time_log").then(({ data }) => data);

const currentTimeLogsApi = { show };

export default currentTimeLogsApi;

import http from "@/apis/axios";
import type { TimeLog } from "@/apis/time_logs";

export type CurrentTimeLogResponse = { timeLog: TimeLog | null };

const show = () => http.get<CurrentTimeLogResponse>("/current_time_log").then(({ data }) => data);

const currentTimeLogsApi = { show };

export default currentTimeLogsApi;

import http from "@/apis/axios";
import type { RoutineTimeLogsParams, RoutineTimeLogsResponse } from "@/apis/types";

const fetchList = ({ routineId, ...params }: RoutineTimeLogsParams) =>
  http
    .get<RoutineTimeLogsResponse>(`/routines/${encodeURIComponent(routineId)}/time_logs`, { params })
    .then(({ data }) => data);

const routineTimeLogsApi = { fetchList };

export default routineTimeLogsApi;

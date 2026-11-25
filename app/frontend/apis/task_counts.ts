import http from "@/apis/axios";
import type { TaskCountListResponse } from "@/apis/types";

const fetchList = () => http.get<TaskCountListResponse>("/task_counts").then(({ data }) => data);

const taskCountsApi = { fetchList };

export default taskCountsApi;

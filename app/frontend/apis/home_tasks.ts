import http from "@/apis/axios";
import type { HomeTasksParams, HomeTasksResponse } from "@/apis/types";

const fetchList = (params: HomeTasksParams) =>
  http.get<HomeTasksResponse>("/home_tasks", { params }).then(({ data }) => data);

const homeTasksApi = { fetchList };

export default homeTasksApi;

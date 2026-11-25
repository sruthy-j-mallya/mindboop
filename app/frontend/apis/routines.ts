import http from "@/apis/axios";
import type {
  CreateRoutinePayload,
  RoutineListResponse,
  RoutineResponse,
  UpdateRoutinePayload,
} from "@/apis/types";

const ROUTINES_URL = "/routines";

const routineURL = (id: string) => `${ROUTINES_URL}/${encodeURIComponent(id)}`;

const fetchList = () => http.get<RoutineListResponse>(ROUTINES_URL).then(({ data }) => data);

const create = (payload: CreateRoutinePayload) =>
  http.post<RoutineResponse>(ROUTINES_URL, payload).then(({ data }) => data);

const update = ({ id, ...payload }: UpdateRoutinePayload) =>
  http.patch<RoutineResponse>(routineURL(id), payload).then(({ data }) => data);

const destroy = (id: string) => http.delete(routineURL(id));

const routinesApi = { fetchList, create, update, destroy };

export default routinesApi;

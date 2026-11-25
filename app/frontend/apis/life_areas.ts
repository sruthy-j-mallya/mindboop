import http from "@/apis/axios";
import type {
  CreateLifeAreaPayload,
  DeleteLifeAreaPayload,
  LifeAreaListResponse,
  LifeAreaResponse,
  UpdateLifeAreaPayload,
} from "@/apis/types";

const LIFE_AREAS_URL = "/life_areas";

const lifeAreaURL = (id: string) => `${LIFE_AREAS_URL}/${encodeURIComponent(id)}`;

const fetchList = () => http.get<LifeAreaListResponse>(LIFE_AREAS_URL).then(({ data }) => data);

const create = (payload: CreateLifeAreaPayload) =>
  http.post<LifeAreaResponse>(LIFE_AREAS_URL, payload).then(({ data }) => data);

const update = ({ id, ...payload }: UpdateLifeAreaPayload) =>
  http.patch<LifeAreaResponse>(lifeAreaURL(id), payload).then(({ data }) => data);

const destroy = ({ id, ...params }: DeleteLifeAreaPayload) => http.delete(lifeAreaURL(id), { params });

const lifeAreasApi = { fetchList, create, update, destroy };

export default lifeAreasApi;

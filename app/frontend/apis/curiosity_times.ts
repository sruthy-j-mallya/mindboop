import http from "@/apis/axios";
import type { CuriosityTimeResponse } from "@/apis/types";

const CURIOSITY_TIME_URL = "/curiosity_time";

const show = () => http.get<CuriosityTimeResponse>(CURIOSITY_TIME_URL).then(({ data }) => data);

const create = (parkingLotItemId: string) =>
  http.post<CuriosityTimeResponse>(CURIOSITY_TIME_URL, { parkingLotItemId }).then(({ data }) => data);

// Adds more time, once.
const update = () => http.patch<CuriosityTimeResponse>(CURIOSITY_TIME_URL).then(({ data }) => data);

const destroy = () => http.delete<CuriosityTimeResponse>(CURIOSITY_TIME_URL).then(({ data }) => data);

const curiosityTimesApi = { show, create, update, destroy };

export default curiosityTimesApi;

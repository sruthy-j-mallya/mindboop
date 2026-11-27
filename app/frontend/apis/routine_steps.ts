import http from "@/apis/axios";
import type {
  CreateRoutineStepPayload,
  DeleteRoutineStepPayload,
  RoutineResponse,
  UpdateRoutineStepPayload,
} from "@/apis/types";

const routineStepsURL = (routineId: string) => `/routines/${encodeURIComponent(routineId)}/steps`;

const routineStepURL = (routineId: string, id: string) =>
  `${routineStepsURL(routineId)}/${encodeURIComponent(id)}`;

// Each call answers with the whole routine, since a move also changes the other steps' order.
const create = ({ routineId, ...payload }: CreateRoutineStepPayload) =>
  http.post<RoutineResponse>(routineStepsURL(routineId), payload).then(({ data }) => data);

const update = ({ routineId, id, ...payload }: UpdateRoutineStepPayload) =>
  http.patch<RoutineResponse>(routineStepURL(routineId, id), payload).then(({ data }) => data);

const destroy = ({ routineId, id }: DeleteRoutineStepPayload) =>
  http.delete<RoutineResponse>(routineStepURL(routineId, id)).then(({ data }) => data);

const routineStepsApi = { create, update, destroy };

export default routineStepsApi;

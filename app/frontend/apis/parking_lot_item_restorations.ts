import http from "@/apis/axios";
import type { ParkingLotItemResponse } from "@/apis/types";

const create = (parkingLotItemId: string) =>
  http
    .post<ParkingLotItemResponse>(`/parking_lot_items/${encodeURIComponent(parkingLotItemId)}/restoration`)
    .then(({ data }) => data);

const parkingLotItemRestorationsApi = { create };

export default parkingLotItemRestorationsApi;

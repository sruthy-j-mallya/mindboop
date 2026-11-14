import http from "@/apis/axios";
import type { ParkingLotItemResponse } from "@/apis/types";

const create = (parkingLotItemId: string) =>
  http
    .post<ParkingLotItemResponse>(`/parking_lot_items/${encodeURIComponent(parkingLotItemId)}/conversion`)
    .then(({ data }) => data);

const parkingLotItemConversionsApi = { create };

export default parkingLotItemConversionsApi;

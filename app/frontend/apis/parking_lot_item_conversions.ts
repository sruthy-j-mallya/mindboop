import http from "@/apis/axios";
import type { ConvertParkingLotItemPayload, ParkingLotItemResponse } from "@/apis/types";

const create = ({ parkingLotItemId, ...schedule }: ConvertParkingLotItemPayload) =>
  http
    .post<ParkingLotItemResponse>(
      `/parking_lot_items/${encodeURIComponent(parkingLotItemId)}/conversion`,
      schedule,
    )
    .then(({ data }) => data);

const parkingLotItemConversionsApi = { create };

export default parkingLotItemConversionsApi;

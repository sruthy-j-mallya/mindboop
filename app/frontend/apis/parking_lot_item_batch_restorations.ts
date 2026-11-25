import http from "@/apis/axios";
import type { ParkingLotItemBatchResponse } from "@/apis/types";

const create = (ids: string[]) =>
  http
    .post<ParkingLotItemBatchResponse>("/parking_lot_item_batch/restoration", { ids })
    .then(({ data }) => data);

const parkingLotItemBatchRestorationsApi = { create };

export default parkingLotItemBatchRestorationsApi;

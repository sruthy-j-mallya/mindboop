import http from "@/apis/axios";
import type { ParkingLotItemBatchResponse, UpdateParkingLotItemBatchPayload } from "@/apis/types";

const PARKING_LOT_ITEM_BATCH_URL = "/parking_lot_item_batch";

const update = (payload: UpdateParkingLotItemBatchPayload) =>
  http.patch<ParkingLotItemBatchResponse>(PARKING_LOT_ITEM_BATCH_URL, payload).then(({ data }) => data);

const destroy = (ids: string[]) => http.delete(PARKING_LOT_ITEM_BATCH_URL, { data: { ids } });

const parkingLotItemBatchesApi = { update, destroy };

export default parkingLotItemBatchesApi;

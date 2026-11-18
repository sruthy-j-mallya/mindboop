import http from "@/apis/axios";
import type {
  CreateParkingLotItemPayload,
  ParkingLotItemListParams,
  ParkingLotItemListResponse,
  ParkingLotItemResponse,
  UpdateParkingLotItemPayload,
} from "@/apis/types";

const PARKING_LOT_ITEMS_URL = "/parking_lot_items";

const parkingLotItemURL = (id: string) => `${PARKING_LOT_ITEMS_URL}/${encodeURIComponent(id)}`;

const fetchList = (params: ParkingLotItemListParams = {}) =>
  http.get<ParkingLotItemListResponse>(PARKING_LOT_ITEMS_URL, { params }).then(({ data }) => data);

const create = (payload: CreateParkingLotItemPayload) =>
  http.post<ParkingLotItemResponse>(PARKING_LOT_ITEMS_URL, payload).then(({ data }) => data);

const update = ({ id, ...payload }: UpdateParkingLotItemPayload) =>
  http.patch<ParkingLotItemResponse>(parkingLotItemURL(id), payload).then(({ data }) => data);

const destroy = (id: string) => http.delete(parkingLotItemURL(id));

const parkingLotItemsApi = { fetchList, create, update, destroy };

export default parkingLotItemsApi;

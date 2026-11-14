import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";

import parkingLotItemsApi from "@/apis/parking_lot_items";
import type {
  ParkingLotItemFilters,
  ParkingLotItemListParams,
  ParkingLotItemListResponse,
} from "@/apis/types";
import { QUERY_KEYS } from "@/constants/query";

export const useParkingLotItems = (
  params: ParkingLotItemListParams = {},
  options?: Omit<UseQueryOptions<ParkingLotItemListResponse>, "queryKey" | "queryFn">,
) =>
  useQuery({
    queryKey: QUERY_KEYS.PARKING_LOT_ITEMS.LIST(params),
    queryFn: () => parkingLotItemsApi.fetchList(params),
    ...options,
  });

// Loads the list a page at a time; `fetchNextPage` adds the next one while `hasNextPage` is true.
export const useInfiniteParkingLotItems = (filters: ParkingLotItemFilters = {}) =>
  useInfiniteQuery({
    queryKey: QUERY_KEYS.PARKING_LOT_ITEMS.INFINITE_LIST(filters),
    queryFn: ({ pageParam }) => parkingLotItemsApi.fetchList({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: ({ page, totalPages }) => (page < totalPages ? page + 1 : undefined),
  });

export const useCreateParkingLotItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: parkingLotItemsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PARKING_LOT_ITEMS.LISTS }),
  });
};

export const useUpdateParkingLotItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: parkingLotItemsApi.update,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PARKING_LOT_ITEMS.LISTS }),
  });
};

export const useDeleteParkingLotItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: parkingLotItemsApi.destroy,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PARKING_LOT_ITEMS.LISTS }),
  });
};

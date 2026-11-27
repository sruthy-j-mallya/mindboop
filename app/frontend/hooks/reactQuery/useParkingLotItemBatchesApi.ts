import { useMutation, useQueryClient } from "@tanstack/react-query";

import parkingLotItemBatchesApi from "@/apis/parking_lot_item_batches";
import { QUERY_KEYS } from "@/constants/query";

// Bulk actions: each moves the chosen items off their list (ending any curiosity time on them).
export const useUpdateParkingLotItemBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: parkingLotItemBatchesApi.update,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PARKING_LOT_ITEMS.ALL }),
  });
};

export const useDeleteParkingLotItemBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: parkingLotItemBatchesApi.destroy,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PARKING_LOT_ITEMS.ALL }),
  });
};

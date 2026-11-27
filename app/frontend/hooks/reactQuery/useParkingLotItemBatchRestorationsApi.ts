import { useMutation, useQueryClient } from "@tanstack/react-query";

import parkingLotItemBatchRestorationsApi from "@/apis/parking_lot_item_batch_restorations";
import { QUERY_KEYS } from "@/constants/query";

// Undoes a bulk let go: the items come back to their lists.
export const useRestoreParkingLotItemBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: parkingLotItemBatchRestorationsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PARKING_LOT_ITEMS.ALL }),
  });
};

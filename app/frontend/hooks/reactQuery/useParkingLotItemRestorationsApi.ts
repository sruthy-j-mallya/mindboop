import { useMutation, useQueryClient } from "@tanstack/react-query";

import parkingLotItemRestorationsApi from "@/apis/parking_lot_item_restorations";
import { QUERY_KEYS } from "@/constants/query";

// Undoes a discard: the item comes back to its list.
export const useRestoreParkingLotItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: parkingLotItemRestorationsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PARKING_LOT_ITEMS.LISTS }),
  });
};

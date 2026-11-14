import { useMutation, useQueryClient } from "@tanstack/react-query";

import parkingLotItemConversionsApi from "@/apis/parking_lot_item_conversions";
import { QUERY_KEYS } from "@/constants/query";

// Adds a parked thought to the Inbox: it moves to the converted list, and the new task joins the task lists.
export const useConvertParkingLotItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: parkingLotItemConversionsApi.create,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PARKING_LOT_ITEMS.LISTS }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASKS.LISTS }),
      ]),
  });
};

import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";

import curiosityTimesApi from "@/apis/curiosity_times";
import type { CuriosityTimeResponse } from "@/apis/types";
import { QUERY_KEYS } from "@/constants/query";

export const useCuriosityTime = (
  options?: Omit<UseQueryOptions<CuriosityTimeResponse>, "queryKey" | "queryFn">,
) =>
  useQuery({
    queryKey: QUERY_KEYS.PARKING_LOT_ITEMS.CURIOSITY_TIME,
    queryFn: curiosityTimesApi.show,
    ...options,
  });

// Each mutation returns the curiosity time, so the cache takes it straight away; the lists refresh because their rows
// show it too.
const useCuriosityTimeMutation = <TVariables>(
  mutationFn: (variables: TVariables) => Promise<CuriosityTimeResponse>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      const isRunning = data.parkingLotItem?.curiosityEndsAt;
      queryClient.setQueryData(
        QUERY_KEYS.PARKING_LOT_ITEMS.CURIOSITY_TIME,
        isRunning ? data : { parkingLotItem: null },
      );

      return queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PARKING_LOT_ITEMS.LISTS });
    },
  });
};

export const useStartCuriosityTime = () => useCuriosityTimeMutation(curiosityTimesApi.create);

export const useExtendCuriosityTime = () => useCuriosityTimeMutation(curiosityTimesApi.update);

export const useEndCuriosityTime = () => useCuriosityTimeMutation(curiosityTimesApi.destroy);

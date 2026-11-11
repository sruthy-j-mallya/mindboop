import { useMutation, useQueryClient } from "@tanstack/react-query";

import breaksApi from "@/apis/breaks";
import { updateTimeLogCaches } from "@/utils/queryClient";

export const useStartBreak = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: breaksApi.create,
    onSuccess: (response) => updateTimeLogCaches(queryClient, response),
  });
};

export const useEndBreak = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: breaksApi.update,
    onSuccess: (response) => updateTimeLogCaches(queryClient, response),
  });
};

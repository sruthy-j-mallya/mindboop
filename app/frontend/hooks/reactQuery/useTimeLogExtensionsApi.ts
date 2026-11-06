import { useMutation, useQueryClient } from "@tanstack/react-query";

import timeLogExtensionsApi from "@/apis/time_log_extensions";
import { updateTimeLogCaches } from "@/utils/queryClient";

export const useExtendTimeLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: timeLogExtensionsApi.create,
    onSuccess: (response) => updateTimeLogCaches(queryClient, response),
  });
};

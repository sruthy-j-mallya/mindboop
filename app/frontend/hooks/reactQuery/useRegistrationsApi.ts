import { useMutation, useQueryClient } from "@tanstack/react-query";

import registrationsApi from "@/apis/registrations";
import { QUERY_KEYS } from "@/constants/query";

export const useSignup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registrationsApi.create,
    onSuccess: ({ user }) => queryClient.setQueryData(QUERY_KEYS.SESSION, user),
  });
};

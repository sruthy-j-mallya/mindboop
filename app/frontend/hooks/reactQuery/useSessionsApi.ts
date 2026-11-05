import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";

import { ApiError } from "@/apis/axios";
import sessionsApi, { type User } from "@/apis/sessions";
import { QUERY_KEYS } from "@/constants/query";

const fetchCurrentUser = async () => {
  try {
    return (await sessionsApi.show()).user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
};

export const useCurrentUser = (options?: Omit<UseQueryOptions<User | null>, "queryKey" | "queryFn">) =>
  useQuery({ queryKey: QUERY_KEYS.SESSION, queryFn: fetchCurrentUser, ...options });

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sessionsApi.create,
    onSuccess: ({ user }) => queryClient.setQueryData(QUERY_KEYS.SESSION, user),
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sessionsApi.destroy,
    onSuccess: () => {
      queryClient.setQueryData(QUERY_KEYS.SESSION, null);
      // The next person to sign in on this tab shouldn't see this user's session, even briefly.
      queryClient.removeQueries({ queryKey: QUERY_KEYS.TIME_LOGS.CURRENT });
    },
  });
};

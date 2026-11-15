import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";

import type { UpdateUserPreferencePayload, UserPreference } from "@/apis/types";
import userPreferencesApi from "@/apis/user_preferences";
import { QUERY_KEYS } from "@/constants/query";

// Preferences change only through this app's own updates, which write the cache, so one load per page load is enough.
const USER_PREFERENCE_STALE_TIME = Infinity;

export const useUserPreference = (options?: Omit<UseQueryOptions<UserPreference>, "queryKey" | "queryFn">) =>
  useQuery({
    queryKey: QUERY_KEYS.USER_PREFERENCE,
    queryFn: async () => (await userPreferencesApi.show()).userPreference,
    staleTime: USER_PREFERENCE_STALE_TIME,
    ...options,
  });

// Applies the change to the cache straight away, so a theme or sound switches as it's picked, and puts the previous
// preference back if the save fails.
export const useUpdateUserPreference = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userPreferencesApi.update,
    onMutate: async (changes: UpdateUserPreferencePayload) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.USER_PREFERENCE });
      const previous = queryClient.getQueryData<UserPreference>(QUERY_KEYS.USER_PREFERENCE);
      if (previous) queryClient.setQueryData(QUERY_KEYS.USER_PREFERENCE, { ...previous, ...changes });

      return { previous };
    },
    onError: (_error, _changes, context) => {
      if (context?.previous) queryClient.setQueryData(QUERY_KEYS.USER_PREFERENCE, context.previous);
    },
    onSuccess: ({ userPreference }) => queryClient.setQueryData(QUERY_KEYS.USER_PREFERENCE, userPreference),
  });
};

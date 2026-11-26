import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import onboardingsApi from "@/apis/onboardings";
import type { Onboarding } from "@/apis/types";
import { QUERY_KEYS } from "@/constants/query";

export const useOnboarding = (options?: Omit<UseQueryOptions<Onboarding>, "queryKey" | "queryFn">) =>
  useQuery({
    queryKey: QUERY_KEYS.TASKS.ONBOARDING,
    queryFn: async () => (await onboardingsApi.show()).onboarding,
    ...options,
  });

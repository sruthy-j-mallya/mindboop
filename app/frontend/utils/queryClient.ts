import { QueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/apis/axios";

declare module "@tanstack/react-query" {
  interface Register {
    defaultError: ApiError;
  }
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
});

export default queryClient;

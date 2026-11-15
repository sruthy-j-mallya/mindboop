import { keepPreviousData, useQuery, type UseQueryOptions } from "@tanstack/react-query";

import calendarEventsApi from "@/apis/calendar_events";
import type { CalendarEventsParams, CalendarEventsResponse } from "@/apis/types";
import { QUERY_KEYS } from "@/constants/query";

// Keeps the last range on screen while the next one loads, so paging through weeks doesn't flash an empty grid.
export const useCalendarEvents = (
  params: CalendarEventsParams,
  options?: Omit<UseQueryOptions<CalendarEventsResponse>, "queryKey" | "queryFn">,
) =>
  useQuery({
    queryKey: QUERY_KEYS.CALENDAR_EVENTS.LIST(params),
    queryFn: () => calendarEventsApi.fetchList(params),
    placeholderData: keepPreviousData,
    ...options,
  });

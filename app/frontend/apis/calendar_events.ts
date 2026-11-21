import http from "@/apis/axios";
import type { CalendarEventsParams, CalendarEventsResponse } from "@/apis/types";

const fetchList = (params: CalendarEventsParams) =>
  http.get<CalendarEventsResponse>("/calendar_events", { params }).then(({ data }) => data);

const calendarEventsApi = { fetchList };

export default calendarEventsApi;

import { parseISO } from "date-fns";

import type { TimeFormat } from "@/apis/types";
import { formatDateTime } from "@/utils/dateTime";

// "5 Nov, 5:30pm" this year, "5 Nov 2025, 5:30pm" otherwise.
export const formatBreadcrumbTime = (createdAt: string, timeFormat: TimeFormat) =>
  formatDateTime(parseISO(createdAt), new Date(), timeFormat);

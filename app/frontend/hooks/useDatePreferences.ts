import { useMemo } from "react";

import type { DatePreferences } from "@/apis/types";
import { DEFAULT_DATE_PREFERENCES } from "@/constants";
import { useUserPreference } from "@/hooks/reactQuery/useUserPreferencesApi";

// The week start and clock picked in Settings (the defaults until they have loaded, or if they can't).
const useDatePreferences = (): DatePreferences => {
  const { data: preference } = useUserPreference();
  const { weekStartsOn, timeFormat } = preference ?? DEFAULT_DATE_PREFERENCES;

  return useMemo(() => ({ weekStartsOn, timeFormat }), [weekStartsOn, timeFormat]);
};

export default useDatePreferences;

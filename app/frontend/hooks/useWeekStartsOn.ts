import type { WeekStartsOn } from "@/apis/types";
import { DEFAULT_WEEK_STARTS_ON } from "@/constants";
import { useUserPreference } from "@/hooks/reactQuery/useUserPreferencesApi";

// The day weeks start on, as picked in Settings (Monday until the preference has loaded, or if it can't).
const useWeekStartsOn = (): WeekStartsOn => {
  const { data: preference } = useUserPreference();

  return preference?.weekStartsOn ?? DEFAULT_WEEK_STARTS_ON;
};

export default useWeekStartsOn;

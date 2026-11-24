import type { Theme, WeekStartsOn } from "@/apis/types";
import { useUpdateUserPreference, useUserPreference } from "@/hooks/reactQuery/useUserPreferencesApi";

import Appearance from "./Appearance";
import CalendarSettings from "./CalendarSettings";
import Sounds from "./Sounds";

const Settings = () => {
  const { data: preference, error: loadError } = useUserPreference();
  const { mutate: updatePreference, error: saveError } = useUpdateUserPreference();
  const error = loadError ?? saveError;

  const handleThemeChange = (theme: Theme) => updatePreference({ theme });
  const handleWeekStartsOnChange = (weekStartsOn: WeekStartsOn) => updatePreference({ weekStartsOn });

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4">
      <h1>Settings</h1>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error.message}
        </p>
      )}
      {preference && (
        <>
          <Appearance theme={preference.theme} onChange={handleThemeChange} />
          <Sounds preference={preference} onChange={updatePreference} />
          <CalendarSettings weekStartsOn={preference.weekStartsOn} onChange={handleWeekStartsOnChange} />
        </>
      )}
    </div>
  );
};

export default Settings;

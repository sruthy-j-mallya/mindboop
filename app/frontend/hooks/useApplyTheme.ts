import { useEffect } from "react";

import type { Theme } from "@/apis/types";
import { useUserPreference } from "@/hooks/reactQuery/useUserPreferencesApi";

const isDark = (theme: Theme) =>
  theme === "system" ? matchMedia("(prefers-color-scheme: dark)").matches : theme === "dark";

// Keeps the page in the user's saved theme. The layout applies it before first paint (application.html.erb); this
// covers signing in without a reload and changes made in Settings.
const useApplyTheme = () => {
  const { data: preference } = useUserPreference();
  const theme = preference?.theme;

  useEffect(() => {
    if (theme) document.documentElement.classList.toggle("dark", isDark(theme));
  }, [theme]);
};

export default useApplyTheme;

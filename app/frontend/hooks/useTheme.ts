import { useState } from "react";

type Theme = "light" | "dark";

// The inline script in app/views/layouts/application.html.erb reads this key to apply the theme before first paint.
const THEME_STORAGE_KEY = "theme";

const currentTheme = (): Theme => (document.documentElement.classList.contains("dark") ? "dark" : "light");

const useTheme = () => {
  const [theme, setThemeState] = useState(currentTheme);

  const setTheme = (nextTheme: Theme) => {
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    setThemeState(nextTheme);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Storage can be blocked; the theme still applies until the next reload.
    }
  };

  return { theme, setTheme };
};

export default useTheme;

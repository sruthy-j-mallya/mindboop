import type { Theme } from "@/apis/types";

// Mirrors UserPreference::THEMES.
export const THEMES: { id: Theme; label: string }[] = [
  { id: "system", label: "Match my device" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];

import emojiCategories from "./emojis.json";
import type { LifeAreaColor, LifeAreaEmojiCategory } from "./types";

// Deep enough for white text on the Calendar's solid task blocks, in light and dark mode alike (Tailwind's 700s).
export const LIFE_AREA_COLORS: LifeAreaColor[] = [
  { id: "rose", label: "Rose", value: "#be123c" },
  { id: "orange", label: "Orange", value: "#c2410c" },
  { id: "amber", label: "Amber", value: "#b45309" },
  { id: "lime", label: "Lime", value: "#4d7c0f" },
  { id: "emerald", label: "Emerald", value: "#047857" },
  { id: "teal", label: "Teal", value: "#0f766e" },
  { id: "sky", label: "Sky", value: "#0369a1" },
  { id: "indigo", label: "Indigo", value: "#4338ca" },
  { id: "violet", label: "Violet", value: "#6d28d9" },
  { id: "slate", label: "Slate", value: "#475569" },
];

// The emojis on offer, each listed once. The server reads the same file (`LifeArea::EMOJIS`).
export const LIFE_AREA_EMOJI_CATEGORIES: LifeAreaEmojiCategory[] = emojiCategories;

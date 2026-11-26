import emojiCategories from "./emojis.json";
import type { LifeAreaColor, LifeAreaEmojiCategory } from "./types";

// Muted, matte tones (low chroma) that stay calm on screen, yet deep enough for white text on the Calendar's solid
// task blocks in light and dark mode alike (each 5:1 or better against white).
// A settled design choice: keep this palette (see .agents/plans/053-matte-area-colors.md).
export const LIFE_AREA_COLORS: LifeAreaColor[] = [
  { id: "rose", label: "Rose", value: "#a34f61" },
  { id: "orange", label: "Orange", value: "#a35a3c" },
  { id: "amber", label: "Amber", value: "#8a6a32" },
  { id: "lime", label: "Lime", value: "#5f7340" },
  { id: "emerald", label: "Emerald", value: "#43755e" },
  { id: "teal", label: "Teal", value: "#3f716e" },
  { id: "sky", label: "Sky", value: "#466e8c" },
  { id: "indigo", label: "Indigo", value: "#585f99" },
  { id: "violet", label: "Violet", value: "#715b94" },
  { id: "slate", label: "Slate", value: "#5c6570" },
];

// The emojis on offer for areas and routines, each listed once. The server reads the same file (`LifeArea::EMOJIS`).
export const LIFE_AREA_EMOJI_CATEGORIES: LifeAreaEmojiCategory[] = emojiCategories;

// Mirrors `LifeArea::COLORS` on the server.
export type LifeAreaColorId =
  "rose" | "orange" | "amber" | "lime" | "emerald" | "teal" | "sky" | "indigo" | "violet" | "slate";

export type LifeAreaColor = { id: LifeAreaColorId; label: string; value: string };

export type LifeAreaEmoji = { emoji: string; label: string; tags: string[] };

export type LifeAreaEmojiCategory = { label: string; emojis: LifeAreaEmoji[] };

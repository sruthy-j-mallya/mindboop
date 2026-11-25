import type { EmojiDataResolver } from "frimousse";

import { LIFE_AREA_EMOJI_CATEGORIES } from "@/components/commons/LifeArea/constants";

// The label of an emoji on offer ("briefcase").
export const getEmojiLabel = (emoji: string) =>
  LIFE_AREA_EMOJI_CATEGORIES.flatMap(({ emojis }) => emojis).find((option) => option.emoji === emoji)?.label;

// Hands Frimousse the emojis on offer instead of the whole set it would download. A category's name is a tag of each of
// its emojis, so searching for "pets" finds them all.
export const resolveEmojiData: EmojiDataResolver = (locale) => ({
  locale,
  categories: LIFE_AREA_EMOJI_CATEGORIES.map(({ label }, index) => ({ index, label })),
  emojis: LIFE_AREA_EMOJI_CATEGORIES.flatMap(({ label: categoryLabel, emojis }, category) =>
    emojis.map(({ tags, ...emoji }) => ({
      ...emoji,
      category,
      version: 0,
      tags: [...tags, categoryLabel.toLowerCase()],
    })),
  ),
  // Skin tones aren't offered.
  skinTones: { light: "", "medium-light": "", medium: "", "medium-dark": "", dark: "" },
});

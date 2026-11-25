import type { Task } from "@/apis/types";

import { EXCERPT_PADDING } from "./constants";

const includesTerm = (text: string, searchTerm: string) =>
  text.toLowerCase().includes(searchTerm.toLowerCase());

// The part of the description around the match, on one line.
const getExcerpt = (description: string, searchTerm: string) => {
  const index = description.toLowerCase().indexOf(searchTerm.toLowerCase());
  const start = Math.max(index - EXCERPT_PADDING, 0);
  const end = index + searchTerm.length + EXCERPT_PADDING;
  const excerpt = description.slice(start, end).replace(/\s+/g, " ").trim();

  return `${start > 0 ? "…" : ""}${excerpt}${end < description.length ? "…" : ""}`;
};

// Why a task was found, when its title doesn't show it: the step, or the part of the description, that matches.
export const getMatchedDetail = (
  { title, description, checklistItems }: Pick<Task, "title" | "description" | "checklistItems">,
  searchTerm: string,
) => {
  if (includesTerm(title, searchTerm)) return null;

  const step = checklistItems.find((item) => includesTerm(item.title, searchTerm));
  if (step) return `Step: ${step.title}`;

  return description && includesTerm(description, searchTerm) ? getExcerpt(description, searchTerm) : null;
};

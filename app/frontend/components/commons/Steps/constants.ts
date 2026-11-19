import type { Draft } from "./types";

// The first new step row, opened from the add button; it goes last.
export const NEW_STEP_DRAFT: Draft = { key: 0 };

// The box shared by a step's text and the field that edits it, so switching between them doesn't move the text. The
// padding with the 1px border makes one line exactly as tall as the row's buttons.
export const STEP_TEXT_CLASS_NAME =
  "min-h-8 min-w-0 flex-1 rounded-md border border-transparent px-3 py-[5px] text-sm leading-5 break-words";

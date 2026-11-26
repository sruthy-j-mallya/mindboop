// An http(s) address or a bare "www." one, up to the next space.
export const URL_PATTERN = /\b(?:https?:\/\/|www\.)[^\s<>"]+/gi;

// Sentence punctuation that usually follows an address rather than belongs to it.
export const TRAILING_PUNCTUATION = new Set([".", ",", ";", ":", "!", "?", "'", '"']);

// Styled like links in a task's notes (`.rich-text a` in application.css).
export const LINK_CLASS_NAME = "font-medium text-primary underline underline-offset-2";

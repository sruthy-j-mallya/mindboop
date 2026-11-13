import { describe, expect, it } from "vitest";

import { looksLikeMarkdown } from "./MarkdownPaste";

describe("looksLikeMarkdown", () => {
  it.each([
    "## Plan",
    "- one\n- two",
    "1. first",
    "> quoted",
    "```\ncode\n```",
    "Make it **bold**",
    "Use `pnpm`",
    "See [docs](https://example.com)",
    "~~old~~",
    "Mark it ==done==",
    "Part one\n\n---\n\nPart two",
  ])("recognises %j", (text) => {
    expect(looksLikeMarkdown(text)).toBe(true);
  });

  it.each([
    "Just a sentence.",
    "2 * 3 = 6",
    "snake_case_name",
    "#hashtag",
    "https://example.com",
    "a == b",
    "x = y = z",
  ])("leaves %j as plain text", (text) => {
    expect(looksLikeMarkdown(text)).toBe(false);
  });
});

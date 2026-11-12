import {
  Bold,
  Code,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  SquareCode,
  Strikethrough,
  TextQuote,
} from "lucide-react";
import { z } from "zod";

import type { FormatItem } from "./types";
import { isAllowedLinkUrl, normalizeLinkUrl } from "./utils";

export const LINK_SHORTCUT = ["Mod", "K"];

export const LINK_MENU_HIDE_DELAY = 200; // ms, long enough to move the pointer from a link onto its menu
export const COPIED_FEEDBACK_DURATION = 1500; // ms

// Grouped so the toolbar can draw a separator between inline marks, headings and blocks.
export const FORMAT_GROUPS: FormatItem[][] = [
  [
    {
      name: "bold",
      label: "Bold",
      icon: Bold,
      shortcut: ["Mod", "B"],
      isActive: (editor) => editor.isActive("bold"),
      toggle: (editor) => editor.chain().focus().toggleBold().run(),
    },
    {
      name: "italic",
      label: "Italic",
      icon: Italic,
      shortcut: ["Mod", "I"],
      isActive: (editor) => editor.isActive("italic"),
      toggle: (editor) => editor.chain().focus().toggleItalic().run(),
    },
    {
      name: "strike",
      label: "Strikethrough",
      icon: Strikethrough,
      shortcut: ["Mod", "Shift", "S"],
      isActive: (editor) => editor.isActive("strike"),
      toggle: (editor) => editor.chain().focus().toggleStrike().run(),
    },
    {
      name: "code",
      label: "Inline code",
      icon: Code,
      shortcut: ["Mod", "E"],
      isActive: (editor) => editor.isActive("code"),
      toggle: (editor) => editor.chain().focus().toggleCode().run(),
    },
  ],
  [
    {
      name: "heading2",
      label: "Heading",
      icon: Heading2,
      shortcut: ["Mod", "Alt", "2"],
      isActive: (editor) => editor.isActive("heading", { level: 2 }),
      toggle: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      name: "heading3",
      label: "Subheading",
      icon: Heading3,
      shortcut: ["Mod", "Alt", "3"],
      isActive: (editor) => editor.isActive("heading", { level: 3 }),
      toggle: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
  ],
  [
    {
      name: "bulletList",
      label: "Bullet list",
      icon: List,
      shortcut: ["Mod", "Shift", "8"],
      isActive: (editor) => editor.isActive("bulletList"),
      toggle: (editor) => editor.chain().focus().toggleBulletList().run(),
    },
    {
      name: "orderedList",
      label: "Numbered list",
      icon: ListOrdered,
      shortcut: ["Mod", "Shift", "7"],
      isActive: (editor) => editor.isActive("orderedList"),
      toggle: (editor) => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      name: "blockquote",
      label: "Quote",
      icon: TextQuote,
      shortcut: ["Mod", "Shift", "B"],
      isActive: (editor) => editor.isActive("blockquote"),
      toggle: (editor) => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      name: "codeBlock",
      label: "Code block",
      icon: SquareCode,
      shortcut: ["Mod", "Alt", "C"],
      isActive: (editor) => editor.isActive("codeBlock"),
      toggle: (editor) => editor.chain().focus().toggleCodeBlock().run(),
    },
  ],
];

export const FORMAT_ITEMS = FORMAT_GROUPS.flat();

export const LINK_VALIDATION_SCHEMA = z.object({
  // Optional: left blank, the link shows its address. Prefilled with the selected or linked text.
  text: z.string(),
  url: z
    .string()
    .trim()
    .min(1, "Enter a link")
    .refine((url) => isAllowedLinkUrl(normalizeLinkUrl(url)), "Use a web address or an email link"),
});

export type LinkFormValues = z.infer<typeof LINK_VALIDATION_SCHEMA>;

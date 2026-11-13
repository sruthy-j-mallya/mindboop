import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Highlight from "@tiptap/extension-highlight";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Link from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extensions";
import { Markdown } from "@tiptap/markdown";
import { type Editor, getMarkRange, posToDOMRect } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";

import type { LinkFormValues } from "./constants";
import MarkdownPaste from "./MarkdownPaste";

const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);
const HAS_SCHEME = /^[a-z][a-z\d+.-]*:/i;

// "example.com" becomes "https://example.com"; anything with a scheme is left for isAllowedLinkUrl to judge.
export const normalizeLinkUrl = (url: string) => {
  const trimmed = url.trim();

  return HAS_SCHEME.test(trimmed) ? trimmed : `https://${trimmed}`;
};

// Judges the address as it will be rendered, so "www.example.com" (common in typed Markdown links) passes.
export const isAllowedLinkUrl = (url?: string) => {
  if (!url) return false;

  try {
    return ALLOWED_PROTOCOLS.has(new URL(normalizeLinkUrl(url)).protocol);
  } catch {
    return false;
  }
};

// The whole link under the cursor when there is one, otherwise whatever is selected.
export const getLinkTargetRange = (editor: Editor, isActive: boolean) => {
  const { selection, schema } = editor.state;
  const linkRange = isActive ? getMarkRange(selection.$from, schema.marks.link) : undefined;

  return linkRange ?? { from: selection.from, to: selection.to };
};

// Where the link popover points: the link under the cursor, or the selection (the caret when nothing is selected).
export const getLinkTargetRect = (editor: Editor) => {
  if (!editor.isInitialized) return new DOMRect();

  const { from, to } = getLinkTargetRange(editor, editor.isActive("link"));

  return posToDOMRect(editor.view, from, to);
};

export const getLinkFormValues = (editor: Editor, isActive: boolean): LinkFormValues => {
  const { from, to } = getLinkTargetRange(editor, isActive);

  return {
    text: editor.state.doc.textBetween(from, to, " "),
    url: isActive ? (editor.getAttributes("link").href ?? "") : "",
  };
};

// Clicking a link opens it in a new tab; it's edited through the hover menu (LinkHoverMenu) or Mod+K instead.
// Shift/Alt+click are left alone so they can still extend or adjust a selection.
export const openLinkOnClick = (_view: unknown, event: MouseEvent) => {
  if (event.shiftKey || event.altKey || !(event.target instanceof Element)) return false;

  const link = event.target.closest("a");
  // link.href is the resolved address, so "www.example.com" already carries https://.
  if (!link?.href || !isAllowedLinkUrl(link.href)) return false;

  event.preventDefault();
  window.open(link.href, "_blank", "noopener,noreferrer");
  return true;
};

const isMac = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent);

export const formatShortcut = (keys: string[]) =>
  keys
    .map((key) => {
      if (key === "Mod") return isMac() ? "⌘" : "Ctrl";

      if (key === "Alt") return isMac() ? "⌥" : "Alt";

      if (key === "Shift") return isMac() ? "⇧" : "Shift";

      return key;
    })
    .join(isMac() ? "" : "+");

// The stored href is kept as written; only the rendered <a> gets the https:// a bare address needs.
const NormalizedLink = Link.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      href: {
        default: null,
        parseHTML: (element) => element.getAttribute("href"),
        renderHTML: ({ href }) => ({ href: href ? normalizeLinkUrl(href) : href }),
      },
    };
  },
});

// Typing --- (or ___ / ***) on an empty line already inserts a rule; this adds a shortcut to match the toolbar.
const ShortcutHorizontalRule = HorizontalRule.extend({
  addKeyboardShortcuts() {
    return { "Mod-Alt--": () => this.editor.commands.setHorizontalRule() };
  },
});

// highlight.js's common languages (~35). A fenced block's info string (```ts) picks the grammar; a block with no
// language, or one outside this set, is guessed with highlightAuto.
const lowlight = createLowlight(common);

// The editor and the read-only viewer share one schema, so whatever can be written can be shown, and anything
// else in the stored Markdown (raw HTML, images, tables) is dropped instead of rendered.
export const getExtensions = (placeholder?: string) => [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    horizontalRule: false,
    underline: false,
    link: false,
    codeBlock: false,
  }),
  ShortcutHorizontalRule,
  // ==text== (typed, pasted or stored) and Mod+Shift+H; stored as ==text== in the Markdown.
  Highlight,
  CodeBlockLowlight.configure({ lowlight }),
  NormalizedLink.configure({
    autolink: true,
    // Typing or pasting [text](url) turns into a link.
    markdownLinks: true,
    defaultProtocol: "https",
    openOnClick: false,
    isAllowedUri: isAllowedLinkUrl,
    HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
  }),
  Markdown,
  MarkdownPaste,
  ...(placeholder ? [Placeholder.configure({ placeholder })] : []),
];

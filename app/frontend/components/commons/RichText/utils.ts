import { Placeholder } from "@tiptap/extensions";
import { Markdown } from "@tiptap/markdown";
import StarterKit from "@tiptap/starter-kit";

import MarkdownPaste from "./MarkdownPaste";

const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);
const HAS_SCHEME = /^[a-z][a-z\d+.-]*:/i;

// "example.com" becomes "https://example.com"; anything with a scheme is left for isAllowedLinkUrl to judge.
export const normalizeLinkUrl = (url: string) => {
  const trimmed = url.trim();

  return HAS_SCHEME.test(trimmed) ? trimmed : `https://${trimmed}`;
};

export const isAllowedLinkUrl = (url: string) => {
  try {
    return ALLOWED_PROTOCOLS.has(new URL(url).protocol);
  } catch {
    return false;
  }
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

// The editor and the read-only viewer share one schema, so whatever can be written can be shown, and anything
// else in the stored Markdown (raw HTML, images, tables) is dropped instead of rendered.
export const getExtensions = (placeholder?: string) => [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    horizontalRule: false,
    underline: false,
    link: {
      autolink: true,
      defaultProtocol: "https",
      openOnClick: false,
      isAllowedUri: isAllowedLinkUrl,
      HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
    },
  }),
  Markdown,
  MarkdownPaste,
  ...(placeholder ? [Placeholder.configure({ placeholder })] : []),
];

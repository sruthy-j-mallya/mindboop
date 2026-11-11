import type { Editor } from "@tiptap/react";
import type { LucideIcon } from "lucide-react";

export type FormatName =
  | "bold"
  | "italic"
  | "strike"
  | "code"
  | "heading2"
  | "heading3"
  | "bulletList"
  | "orderedList"
  | "blockquote"
  | "codeBlock";

export type FormatItem = {
  name: FormatName;
  label: string;
  icon: LucideIcon;
  shortcut: string[];
  isActive: (editor: Editor) => boolean;
  toggle: (editor: Editor) => void;
};

export type FormatStates = Record<FormatName, boolean> & { link: boolean };

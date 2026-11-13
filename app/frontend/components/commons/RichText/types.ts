import type { Editor } from "@tiptap/react";
import type { LucideIcon } from "lucide-react";

export type FormatName =
  | "bold"
  | "italic"
  | "strike"
  | "highlight"
  | "code"
  | "heading2"
  | "heading3"
  | "bulletList"
  | "orderedList"
  | "blockquote"
  | "codeBlock"
  | "horizontalRule";

export type FormatItem = {
  name: FormatName;
  label: string;
  icon: LucideIcon;
  shortcut: string[];
  isActive: (editor: Editor) => boolean;
  toggle: (editor: Editor) => void;
};

export type FormatStates = Record<FormatName, boolean> & { link: boolean };

export type RichTextEditorProps = {
  defaultValue: string;
  onChange: (markdown: string) => void;
  label: string;
  placeholder?: string;
  isInvalid?: boolean;
  describedBy?: string;
  // Puts the cursor at the end of the text once the editor loads.
  isAutoFocused?: boolean;
};

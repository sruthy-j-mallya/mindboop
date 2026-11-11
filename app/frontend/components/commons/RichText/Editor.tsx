import { useMemo, useState } from "react";

import { EditorContent, useEditor } from "@tiptap/react";
import { cn } from "cn";

import Toolbar from "./Toolbar";
import { getExtensions } from "./utils";

type RichTextEditorProps = {
  defaultValue: string;
  onChange: (markdown: string) => void;
  label: string;
  placeholder?: string;
  isInvalid?: boolean;
  describedBy?: string;
};

// Uncontrolled: defaultValue seeds the editor once, and every edit reports the document back as Markdown.
const RichTextEditor = ({
  defaultValue,
  onChange,
  label,
  placeholder,
  isInvalid = false,
  describedBy,
}: RichTextEditorProps) => {
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const extensions = useMemo(() => getExtensions(placeholder), [placeholder]);
  const editorProps = useMemo(
    () => ({
      attributes: {
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": label,
        "aria-invalid": String(isInvalid),
        ...(describedBy && { "aria-describedby": describedBy }),
        class: "rich-text min-h-28 px-3 py-2 outline-none",
      },
      handleKeyDown: (_view: unknown, event: KeyboardEvent) => {
        if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k") return false;

        event.preventDefault();
        setShowLinkPopover(true);
        return true;
      },
    }),
    [label, isInvalid, describedBy],
  );

  const editor = useEditor({
    extensions,
    editorProps,
    content: defaultValue,
    contentType: "markdown",
    shouldRerenderOnTransaction: false,
    onUpdate: ({ editor: updatedEditor }) =>
      onChange(updatedEditor.isEmpty ? "" : updatedEditor.getMarkdown().trimEnd()),
  });

  return (
    <div
      className={cn(
        "rounded-md border border-input bg-input-background shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        isInvalid && "border-destructive ring-destructive/20",
      )}
    >
      <Toolbar editor={editor} showLinkPopover={showLinkPopover} onLinkPopoverChange={setShowLinkPopover} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;

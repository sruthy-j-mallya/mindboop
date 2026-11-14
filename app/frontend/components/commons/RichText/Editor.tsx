import { useMemo, useState } from "react";

import { EditorContent, useEditor } from "@tiptap/react";
import { cn } from "cn";

import FormattingToggle from "./FormattingToggle";
import LinkHoverMenu from "./LinkHoverMenu";
import LinkPopover from "./LinkPopover";
import Toolbar from "./Toolbar";
import type { RichTextEditorProps } from "./types";
import { getExtensions, openLinkOnClick } from "./utils";

// Uncontrolled: defaultValue seeds the editor once, and every edit reports the document back as Markdown.
const RichTextEditor = ({
  defaultValue,
  onChange,
  label,
  placeholder,
  isInvalid = false,
  describedBy,
  isAutoFocused = false,
}: RichTextEditorProps) => {
  // The format buttons stay out of the way until asked for; Markdown syntax and shortcuts work without them.
  const [showToolbar, setShowToolbar] = useState(false);
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
      handleDOMEvents: { click: openLinkOnClick },
    }),
    [label, isInvalid, describedBy],
  );

  const editor = useEditor({
    extensions,
    editorProps,
    content: defaultValue,
    autofocus: isAutoFocused ? "end" : false,
    contentType: "markdown",
    shouldRerenderOnTransaction: false,
    onUpdate: ({ editor: updatedEditor }) =>
      onChange(updatedEditor.isEmpty ? "" : updatedEditor.getMarkdown().trimEnd()),
  });

  // Selects the hovered link, so the popover's form edits that one, then opens it. No focus() here: Tiptap focuses
  // a frame later, which would pull focus out of the just-opened popover and close it.
  const handleEditLink = (link: HTMLAnchorElement) => {
    const from = editor.view.posAtDOM(link, 0);
    editor.commands.setTextSelection({ from, to: from + (link.textContent?.length ?? 0) });
    setShowLinkPopover(true);
  };

  const handleLinkClick = () => setShowLinkPopover(true);

  return (
    <div
      className={cn(
        "relative rounded-md border border-input bg-input-background shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        isInvalid && "border-destructive ring-destructive/20",
        // While the toolbar is hidden, this reserves its row (min-h-10 in Toolbar) for the toggle in the corner, so
        // showing or hiding the toolbar doesn't change the editor's height.
        !showToolbar && "pb-10",
      )}
    >
      <EditorContent editor={editor} />
      {/* Below the text, with the toggle at the end of its row. */}
      {showToolbar && <Toolbar editor={editor} onLinkClick={handleLinkClick} />}
      {/* After the content, so it stacks above ProseMirror (which is position: relative) and tabs after the text. */}
      <FormattingToggle isPressed={showToolbar} onPressedChange={setShowToolbar} />
      <LinkHoverMenu editor={editor} onEdit={handleEditLink} />
      <LinkPopover editor={editor} isOpen={showLinkPopover} onOpenChange={setShowLinkPopover} />
    </div>
  );
};

export default RichTextEditor;

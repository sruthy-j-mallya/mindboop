import { useMemo, useState } from "react";

import { EditorContent, useEditor } from "@tiptap/react";
import { cn } from "cn";

import FormattingToggle from "./FormattingToggle";
import LinkHoverMenu from "./LinkHoverMenu";
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
  // The link popover lives in the toolbar, so opening it (Mod-K, or Edit in a link's hover menu) shows the toolbar.
  const openLinkPopover = () => {
    setShowToolbar(true);
    setShowLinkPopover(true);
  };
  const extensions = useMemo(() => getExtensions(placeholder), [placeholder]);
  const editorProps = useMemo(
    () => ({
      attributes: {
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": label,
        "aria-invalid": String(isInvalid),
        ...(describedBy && { "aria-describedby": describedBy }),
        // While the toolbar is hidden, bottom padding keeps the last line clear of the toggle in the corner.
        class: cn("rich-text min-h-28 px-3 pt-2 outline-none", showToolbar ? "pb-2" : "pb-10"),
      },
      handleKeyDown: (_view: unknown, event: KeyboardEvent) => {
        if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k") return false;

        event.preventDefault();
        setShowToolbar(true);
        setShowLinkPopover(true);
        return true;
      },
      handleDOMEvents: { click: openLinkOnClick },
    }),
    [label, isInvalid, describedBy, showToolbar],
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
    openLinkPopover();
  };

  const handleToolbarToggle = (isShown: boolean) => {
    setShowToolbar(isShown);
    if (!isShown) setShowLinkPopover(false);
  };

  return (
    <div
      className={cn(
        "relative rounded-md border border-input bg-input-background shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        isInvalid && "border-destructive ring-destructive/20",
      )}
    >
      <EditorContent editor={editor} />
      {/* Below the text, with the toggle at the end of its row. */}
      {showToolbar && (
        <Toolbar editor={editor} showLinkPopover={showLinkPopover} onLinkPopoverChange={setShowLinkPopover} />
      )}
      {/* After the content, so it stacks above ProseMirror (which is position: relative) and tabs after the text. */}
      <FormattingToggle isPressed={showToolbar} onPressedChange={handleToolbarToggle} />
      <LinkHoverMenu editor={editor} onEdit={handleEditLink} />
    </div>
  );
};

export default RichTextEditor;

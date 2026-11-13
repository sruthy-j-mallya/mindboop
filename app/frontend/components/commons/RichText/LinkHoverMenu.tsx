import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { Editor } from "@tiptap/react";
import { Check, Copy, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { COPIED_FEEDBACK_DURATION, LINK_MENU_HIDE_DELAY } from "./constants";

type LinkHoverMenuProps = {
  editor: Editor;
  onEdit: (link: HTMLAnchorElement) => void;
};

// Floats under whichever link the pointer is over. It lingers briefly after the pointer leaves the link, so the
// pointer can travel down onto it.
const LinkHoverMenu = ({ editor, onEdit }: LinkHoverMenuProps) => {
  const [link, setLink] = useState<HTMLAnchorElement | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const hideTimeout = useRef<number | undefined>(undefined);

  const cancelHide = useCallback(() => window.clearTimeout(hideTimeout.current), []);

  const scheduleHide = useCallback(() => {
    cancelHide();
    hideTimeout.current = window.setTimeout(() => setLink(null), LINK_MENU_HIDE_DELAY);
  }, [cancelHide]);

  useEffect(() => {
    // Listens on the document because the editor's view only exists once Tiptap has mounted it (after this effect
    // in production builds), so it's looked up per event instead.
    const findEditorLink = (target: EventTarget | null) => {
      const hovered = target instanceof Element ? target.closest<HTMLAnchorElement>("a[href]") : null;

      return hovered && editor.isInitialized && editor.view.dom.contains(hovered) ? hovered : null;
    };

    const handleMouseOver = (event: MouseEvent) => {
      const hovered = findEditorLink(event.target);
      if (!hovered) return;

      cancelHide();
      setIsCopied(false);
      setLink(hovered);
    };

    const handleMouseOut = (event: MouseEvent) => {
      if (findEditorLink(event.target)) scheduleHide();
    };

    // The menu is positioned once, so it goes away rather than drift when the page scrolls or the text changes.
    const hide = () => setLink(null);

    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    window.addEventListener("scroll", hide, true);
    editor.on("update", hide);

    return () => {
      cancelHide();
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("scroll", hide, true);
      editor.off("update", hide);
    };
  }, [editor, cancelHide, scheduleHide]);

  useEffect(() => {
    if (!isCopied) return undefined;

    const timeout = window.setTimeout(() => setIsCopied(false), COPIED_FEEDBACK_DURATION);

    return () => window.clearTimeout(timeout);
  }, [isCopied]);

  if (!link?.isConnected) return null;

  const handleEdit = () => {
    setLink(null);
    onEdit(link);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link.href);
      setIsCopied(true);
    } catch {
      // Clipboard access can be denied; the address is still one click away through Edit.
    }
  };

  const { bottom, left } = link.getBoundingClientRect();

  return createPortal(
    <TooltipProvider>
      <div
        aria-label="Link actions"
        className="fixed z-50 flex gap-0.5 rounded-lg border bg-popover p-1 text-popover-foreground shadow-md"
        role="toolbar"
        style={{ top: bottom + 4, left }}
        onMouseEnter={cancelHide}
        onMouseLeave={scheduleHide}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button aria-label="Edit link" size="icon-sm" type="button" variant="ghost" onClick={handleEdit}>
              <Pencil />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit link</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label={isCopied ? "Link copied" : "Copy link"}
              size="icon-sm"
              type="button"
              variant="ghost"
              onClick={() => void handleCopy()}
            >
              {isCopied ? <Check /> : <Copy />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isCopied ? "Copied" : "Copy link"}</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>,
    document.body,
  );
};

export default LinkHoverMenu;

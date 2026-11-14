import { useMemo } from "react";

import type { Editor } from "@tiptap/react";

import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";

import LinkForm from "./LinkForm";
import { getLinkTargetRect } from "./utils";

type LinkPopoverProps = {
  editor: Editor;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

// Mounted by the editor itself, not the toolbar, so the toolbar's link button, Mod-K and Edit in a link's hover
// menu can each open it whether or not the toolbar is shown.
const LinkPopover = ({ editor, isOpen, onOpenChange }: LinkPopoverProps) => {
  // Measured on demand, so the popover opens beside the link being edited (and follows it on scroll) rather
  // than under whatever opened it. Rebuilt per editor, since useEditor can swap its instance after mount.
  const anchorRef = useMemo(
    () => ({ current: { getBoundingClientRect: () => getLinkTargetRect(editor) } }),
    [editor],
  );

  const handleDone = () => onOpenChange(false);

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverAnchor virtualRef={anchorRef} />
      <PopoverContent align="start" className="w-80">
        <LinkForm editor={editor} onDone={handleDone} />
      </PopoverContent>
    </Popover>
  );
};

export default LinkPopover;

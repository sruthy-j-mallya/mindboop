import { useMemo } from "react";

import type { Editor } from "@tiptap/react";
import { Link } from "lucide-react";

import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { Toggle } from "@/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { LINK_SHORTCUT } from "./constants";
import LinkForm from "./LinkForm";
import { formatShortcut, getLinkTargetRect } from "./utils";

type LinkPopoverProps = {
  editor: Editor;
  isActive: boolean;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

const LinkPopover = ({ editor, isActive, isOpen, onOpenChange }: LinkPopoverProps) => {
  // Measured on demand, so the popover opens beside the link being edited (and follows it on scroll) rather
  // than under the toolbar button. Rebuilt per editor, since useEditor can swap its instance after mount.
  const anchorRef = useMemo(
    () => ({ current: { getBoundingClientRect: () => getLinkTargetRect(editor) } }),
    [editor],
  );
  const handleToggle = () => onOpenChange(!isOpen);

  const handleDone = () => onOpenChange(false);

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle aria-label="Link" pressed={isActive} size="sm" onPressedChange={handleToggle}>
            <Link />
          </Toggle>
        </TooltipTrigger>
        <TooltipContent>
          Link <kbd className="ml-1 font-sans opacity-70">{formatShortcut(LINK_SHORTCUT)}</kbd>
        </TooltipContent>
      </Tooltip>
      <PopoverAnchor virtualRef={anchorRef} />
      <PopoverContent align="start" className="w-80">
        <LinkForm editor={editor} onDone={handleDone} />
      </PopoverContent>
    </Popover>
  );
};

export default LinkPopover;

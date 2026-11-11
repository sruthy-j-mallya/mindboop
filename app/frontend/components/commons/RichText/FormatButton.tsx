import type { Editor } from "@tiptap/react";

import { Toggle } from "@/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import type { FormatItem } from "./types";
import { formatShortcut } from "./utils";

type FormatButtonProps = {
  editor: Editor;
  item: FormatItem;
  isActive: boolean;
};

const FormatButton = ({
  editor,
  item: { label, icon: Icon, shortcut, toggle },
  isActive,
}: FormatButtonProps) => {
  const handlePressedChange = () => toggle(editor);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Toggle aria-label={label} pressed={isActive} size="sm" onPressedChange={handlePressedChange}>
          <Icon />
        </Toggle>
      </TooltipTrigger>
      <TooltipContent>
        {label} <kbd className="ml-1 font-sans opacity-70">{formatShortcut(shortcut)}</kbd>
      </TooltipContent>
    </Tooltip>
  );
};

export default FormatButton;

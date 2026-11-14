import { Type } from "lucide-react";
import type { MouseEvent } from "react";

import { Toggle } from "@/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type FormattingToggleProps = {
  isPressed: boolean;
  onPressedChange: (isPressed: boolean) => void;
};

// Keeps the editor focused, with its selection intact, so a format can be applied right after opening the toolbar.
const handleMouseDown = (event: MouseEvent<HTMLButtonElement>) => event.preventDefault();

const FormattingToggle = ({ isPressed, onPressedChange }: FormattingToggleProps) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Toggle
          aria-label="Show formatting"
          className="absolute right-1 bottom-1 text-muted-foreground"
          pressed={isPressed}
          size="sm"
          onMouseDown={handleMouseDown}
          onPressedChange={onPressedChange}
        >
          <Type />
        </Toggle>
      </TooltipTrigger>
      <TooltipContent>{isPressed ? "Hide formatting" : "Show formatting"}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export default FormattingToggle;

import { Link } from "lucide-react";

import { Toggle } from "@/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { LINK_SHORTCUT } from "./constants";
import { formatShortcut } from "./utils";

type LinkButtonProps = {
  isActive: boolean;
  onClick: () => void;
};

// The toolbar's link button. It only asks for the link popover, which the editor mounts on its own.
const LinkButton = ({ isActive, onClick }: LinkButtonProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Toggle aria-label="Link" pressed={isActive} size="sm" onPressedChange={onClick}>
        <Link />
      </Toggle>
    </TooltipTrigger>
    <TooltipContent>
      Link <kbd className="ml-1 font-sans opacity-70">{formatShortcut(LINK_SHORTCUT)}</kbd>
    </TooltipContent>
  </Tooltip>
);

export default LinkButton;

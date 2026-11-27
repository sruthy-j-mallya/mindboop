import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router";

type ArchiveItemProps = { to: string; icon: LucideIcon; name: string };

// A link to the completed or deleted tasks. Unlike the lists', nothing can be dropped on it.
const ArchiveItem = ({ to, icon: Icon, name }: ArchiveItemProps) => (
  <li className="shrink-0">
    <NavLink
      className="flex items-center gap-2 rounded-md py-1.5 pr-2 pl-5 text-sm whitespace-nowrap transition-colors outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-[current=page]:bg-accent aria-[current=page]:font-medium"
      to={to}
    >
      <Icon className="size-4 text-muted-foreground" />
      {name}
    </NavLink>
  </li>
);

export default ArchiveItem;

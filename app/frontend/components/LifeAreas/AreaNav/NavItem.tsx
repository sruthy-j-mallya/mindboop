import { useDroppable } from "@dnd-kit/core";
import { cn } from "cn";
import type { ReactNode } from "react";
import { Link, useMatch } from "react-router";

import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";

import type { DragData, DropTarget } from "../types";

type NavItemProps = {
  id: string;
  to: string;
  icon: ReactNode;
  target: DropTarget;
  // A menu's content (ContextMenuContent), opened by a right click or a long press on the link.
  menu?: ReactNode;
};

// A link to an area's tasks (or the Inbox's) that a dragged task can be dropped on to move it there.
const NavItem = ({ id, to, icon, target, menu }: NavItemProps) => {
  const isActive = !!useMatch({ path: to, end: false });
  const { setNodeRef, isOver, active } = useDroppable({ id, data: target });
  const draggedTask = (active?.data.current as DragData | undefined)?.task;
  const canDrop = !!draggedTask && draggedTask.lifeAreaId !== target.lifeAreaId;

  const link = (
    <Link
      aria-current={isActive ? "page" : undefined}
      to={to}
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm whitespace-nowrap transition-colors outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50",
        isActive && "bg-muted font-medium",
        canDrop && "ring-1 ring-border ring-inset",
        canDrop && isOver && "bg-accent ring-2 ring-primary",
      )}
    >
      {icon}
      <span className="truncate">{target.name}</span>
    </Link>
  );

  return (
    <li ref={setNodeRef} className="shrink-0">
      {menu ? (
        <ContextMenu>
          <ContextMenuTrigger asChild>{link}</ContextMenuTrigger>
          {menu}
        </ContextMenu>
      ) : (
        link
      )}
    </li>
  );
};

export default NavItem;

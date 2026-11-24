import { useId } from "react";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "cn";
import type { ReactNode } from "react";
import { Link, useMatch } from "react-router";

import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";

import type { DragData, DropTarget } from "../types";
import { getTasksCountLabel } from "../utils";

type NavItemProps = {
  id: string;
  to: string;
  icon: ReactNode;
  target: DropTarget;
  tasksCount: number;
  // A menu's content (ContextMenuContent), opened by a right click or a long press on the link.
  menu?: ReactNode;
};

// A link to an area's tasks (or the Inbox's) that a dragged task can be dropped on to move it there. How many
// tasks are left there shows at its end; none shows nothing.
const NavItem = ({ id, to, icon, target, tasksCount, menu }: NavItemProps) => {
  const countId = useId();
  const hasTasks = tasksCount > 0;
  const isActive = !!useMatch({ path: to, end: false });
  const { setNodeRef, isOver, active } = useDroppable({ id, data: target });
  const draggedTask = (active?.data.current as DragData | undefined)?.task;
  const canDrop = !!draggedTask && draggedTask.lifeAreaId !== target.lifeAreaId;

  const link = (
    <Link
      aria-describedby={hasTasks ? countId : undefined}
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
      {hasTasks && (
        <span aria-hidden className="ml-auto pl-1 text-xs font-normal text-muted-foreground tabular-nums">
          {tasksCount}
        </span>
      )}
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
      {hasTasks && (
        <span hidden id={countId}>
          {getTasksCountLabel(tasksCount)}
        </span>
      )}
    </li>
  );
};

export default NavItem;

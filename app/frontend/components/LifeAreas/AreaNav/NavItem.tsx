import { useId } from "react";

import type { Active } from "@dnd-kit/core";
import { cn } from "cn";
import type { CSSProperties, ReactNode, Ref } from "react";
import { Link, useMatch } from "react-router";

import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";

import { DRAG_TYPES } from "../constants";
import type { DropTarget } from "../types";
import { getDragData, getTasksCountLabel } from "../utils";

type NavItemProps = {
  to: string;
  icon: ReactNode;
  target: DropTarget;
  tasksCount: number;
  // Its drag and drop, from the item that owns it.
  ref: Ref<HTMLLIElement>;
  active: Active | null;
  isOver: boolean;
  isDragging?: boolean;
  style?: CSSProperties;
  // Drags the item to another place, in the space kept for it before the link.
  handle?: ReactNode;
  // A menu's content (ContextMenuContent), opened by a right click or a long press on the link.
  menu?: ReactNode;
  // A button at its end, in place of the count while it shows.
  action?: ReactNode;
};

// A link to an area's tasks (or the Inbox's) that a dragged task can be dropped on to move it there. How many
// tasks are left there shows at its end; none shows nothing.
const NavItem = ({
  to,
  icon,
  target,
  tasksCount,
  ref,
  active,
  isOver,
  isDragging = false,
  style,
  handle,
  menu,
  action,
}: NavItemProps) => {
  const countId = useId();
  const hasTasks = tasksCount > 0;
  const isActive = !!useMatch({ path: to, end: false });
  const dragData = getDragData(active);
  const canDrop = dragData?.type === DRAG_TYPES.TASK && dragData.task.lifeAreaId !== target.lifeAreaId;

  const link = (
    <Link
      aria-describedby={hasTasks ? countId : undefined}
      aria-current={isActive ? "page" : undefined}
      to={to}
      className={cn(
        "flex items-center gap-2 rounded-md py-1.5 pr-2 pl-5 text-sm whitespace-nowrap transition-colors outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50",
        isActive && "bg-muted font-medium",
        action && "pointer-coarse:pr-8",
        canDrop && "ring-1 ring-border ring-inset",
        canDrop && isOver && "bg-accent ring-2 ring-primary",
      )}
    >
      {icon}
      <span className="truncate">{target.name}</span>
      {hasTasks && (
        <span
          aria-hidden
          className={cn(
            "ml-auto pl-1 text-xs font-normal text-muted-foreground tabular-nums",
            action && "pointer-fine:group-focus-within:opacity-0 pointer-fine:group-hover:opacity-0",
          )}
        >
          {tasksCount}
        </span>
      )}
    </Link>
  );

  return (
    <li ref={ref} className={cn("group relative shrink-0", isDragging && "opacity-50")} style={style}>
      {menu ? (
        <ContextMenu>
          <ContextMenuTrigger asChild>{link}</ContextMenuTrigger>
          {menu}
        </ContextMenu>
      ) : (
        link
      )}
      {handle}
      {action}
      {hasTasks && (
        <span hidden id={countId}>
          {getTasksCountLabel(tasksCount)}
        </span>
      )}
    </li>
  );
};

export default NavItem;

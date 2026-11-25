import { useDndContext, useDroppable } from "@dnd-kit/core";
import { Inbox } from "lucide-react";

import routes from "@/routes";

import { DRAG_TYPES, INBOX_DROP_ID, INBOX_TARGET } from "../constants";
import type { DropData } from "../types";
import { getDragData } from "../utils";
import NavItem from "./NavItem";

type InboxItemProps = { tasksCount: number };

const DROP_DATA: DropData = { target: INBOX_TARGET };

// The Inbox takes dropped tasks, but stays above the areas, so it's no place for a dragged area.
const InboxItem = ({ tasksCount }: InboxItemProps) => {
  const { active } = useDndContext();
  const { setNodeRef, isOver } = useDroppable({
    id: INBOX_DROP_ID,
    data: DROP_DATA,
    disabled: getDragData(active)?.type === DRAG_TYPES.AREA,
  });

  return (
    <NavItem
      ref={setNodeRef}
      active={active}
      icon={<Inbox className="size-4 text-muted-foreground" />}
      isOver={isOver}
      target={INBOX_TARGET}
      tasksCount={tasksCount}
      to={routes.inbox.index}
    />
  );
};

export default InboxItem;

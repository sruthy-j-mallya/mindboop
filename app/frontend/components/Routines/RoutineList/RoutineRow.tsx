import { useState } from "react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "cn";
import { Bell, GripVertical, Pencil, Trash2 } from "lucide-react";
import { NavLink } from "react-router";

import type { Routine } from "@/apis/types";
import EditDeleteMenu from "@/components/commons/EditDeleteMenu";
import RoutineBadge from "@/components/commons/Routine/Badge";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import useDatePreferences from "@/hooks/useDatePreferences";
import { formatMinutes } from "@/utils";

import DeleteRoutineDialog from "../RoutineDialog/Delete";
import EditRoutineDialog from "../RoutineDialog/Edit";
import StartRoutineButton from "../StartRoutineButton";
import { describeReminder, formatLastDone, getRoutinePath } from "../utils";

type RoutineRowProps = { routine: Routine; now: Date };

const DIALOGS = { EDIT: "edit", DELETE: "delete" } as const;

type Dialog = (typeof DIALOGS)[keyof typeof DIALOGS];

// The routine's emoji, name, length and when it was last done, opening its pane; play starts it. It's dragged by its
// handle to reorder it. A right click (or a long press) opens a menu to edit or delete it.
const RoutineRow = ({ routine, now }: RoutineRowProps) => {
  const { id, title, color, emoji, durationMinutes, lastDoneAt } = routine;
  const { timeFormat } = useDatePreferences();
  const reminder = describeReminder(routine, timeFormat);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const { attributes, isDragging, listeners, setActivatorNodeRef, setNodeRef, transform, transition } =
    useSortable({ id, data: { title } });

  const handleEdit = () => setDialog(DIALOGS.EDIT);
  const handleDelete = () => setDialog(DIALOGS.DELETE);
  const handleClose = () => setDialog(null);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <li
            ref={setNodeRef}
            style={{ transform: CSS.Translate.toString(transform), transition }}
            className={cn(
              "group flex items-center gap-2 rounded-xl pr-2 pl-0.5 hover:bg-muted/60 has-[a[aria-current=page]]:bg-accent data-[state=open]:bg-muted/60",
              isDragging && "relative z-10 bg-card shadow-md",
            )}
          >
            {/* Shows only while the row is hovered or has focus (or is being dragged), keeping its space so the row
                doesn't shift. Touch screens can't hover, so it always shows there. */}
            <Button
              ref={setActivatorNodeRef}
              aria-label={`Reorder ${title}`}
              className={cn(
                "-mr-1 w-4 shrink-0 cursor-grab touch-none text-muted-foreground opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 active:cursor-grabbing pointer-coarse:opacity-100",
                isDragging && "opacity-100",
              )}
              size="icon-xs"
              type="button"
              variant="ghost"
              {...attributes}
              {...listeners}
            >
              <GripVertical />
            </Button>
            <NavLink
              className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl py-2 pl-1 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              to={getRoutinePath(id)}
            >
              <RoutineBadge className="size-9 text-lg" color={color} emoji={emoji} />
              <span className="grid min-w-0">
                <span className="truncate font-medium">{title}</span>
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  {formatMinutes(durationMinutes)}
                  <span aria-hidden>·</span>
                  {lastDoneAt ? formatLastDone(lastDoneAt, now) : "Not yet"}
                  {reminder && <Bell aria-label={reminder} className="size-3.5" />}
                </span>
              </span>
            </NavLink>
            <EditDeleteMenu name={title} onDelete={handleDelete} onEdit={handleEdit} />
            <StartRoutineButton routine={routine} />
          </li>
        </ContextMenuTrigger>
        <ContextMenuContent aria-label={`${title} actions`} className="w-40">
          <ContextMenuItem onSelect={handleEdit}>
            <Pencil />
            Edit
          </ContextMenuItem>
          <ContextMenuItem variant="destructive" onSelect={handleDelete}>
            <Trash2 />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      {dialog === DIALOGS.EDIT && <EditRoutineDialog routine={routine} onClose={handleClose} />}
      {dialog === DIALOGS.DELETE && <DeleteRoutineDialog routine={routine} onClose={handleClose} />}
    </>
  );
};

export default RoutineRow;

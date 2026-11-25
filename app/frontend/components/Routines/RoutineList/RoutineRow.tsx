import { useState } from "react";

import { Bell, Pencil, Trash2 } from "lucide-react";
import { NavLink } from "react-router";

import type { Routine } from "@/apis/types";
import EditDeleteMenu from "@/components/commons/EditDeleteMenu";
import RoutineBadge from "@/components/commons/Routine/Badge";
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

// The routine's emoji, name, length and when it was last done, opening its pane; play starts it. A right click (or a
// long press) opens a menu to edit or delete it.
const RoutineRow = ({ routine, now }: RoutineRowProps) => {
  const { id, title, color, emoji, durationMinutes, lastDoneAt } = routine;
  const { timeFormat } = useDatePreferences();
  const reminder = describeReminder(routine, timeFormat);
  const [dialog, setDialog] = useState<Dialog | null>(null);

  const handleEdit = () => setDialog(DIALOGS.EDIT);
  const handleDelete = () => setDialog(DIALOGS.DELETE);
  const handleClose = () => setDialog(null);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <li className="group flex items-center gap-2 rounded-xl pr-2 hover:bg-muted/60 has-[a[aria-current=page]]:bg-muted data-[state=open]:bg-muted/60">
            <NavLink
              className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl py-2 pl-2 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
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

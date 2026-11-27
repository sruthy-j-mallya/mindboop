import { useState } from "react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2 } from "lucide-react";

import type { LifeArea } from "@/apis/types";
import EditDeleteMenu from "@/components/commons/EditDeleteMenu";
import LifeAreaBadge from "@/components/commons/LifeArea/Badge";
import { Button } from "@/components/ui/button";
import { ContextMenuContent, ContextMenuItem } from "@/components/ui/context-menu";
import { getTaskListPath } from "@/utils";

import DeleteAreaDialog from "../AreaDialog/Delete";
import EditAreaDialog from "../AreaDialog/Edit";
import { DRAG_TYPES } from "../constants";
import type { DragData, DropData } from "../types";
import NavItem from "./NavItem";

type AreaItemProps = { lifeArea: LifeArea; tasksCount: number };

const DIALOGS = { EDIT: "edit", DELETE: "delete" } as const;

type Dialog = (typeof DIALOGS)[keyof typeof DIALOGS];

// An area in the sidebar, dragged by its handle to reorder it. A right click (or a long press) opens a menu to edit or
// delete it.
const AreaItem = ({ lifeArea, tasksCount }: AreaItemProps) => {
  const { id, name, color, emoji } = lifeArea;
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const target = { lifeAreaId: id, name };
  const data: DragData & DropData = { type: DRAG_TYPES.AREA, lifeArea, target };
  const {
    active,
    attributes,
    isDragging,
    isOver,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id, data });

  const handleEdit = () => setDialog(DIALOGS.EDIT);
  const handleDelete = () => setDialog(DIALOGS.DELETE);
  const handleClose = () => setDialog(null);

  return (
    <>
      <NavItem
        ref={setNodeRef}
        active={active}
        icon={<LifeAreaBadge className="size-5 text-xs" color={color} emoji={emoji} />}
        isDragging={isDragging}
        isOver={isOver}
        style={{ transform: CSS.Translate.toString(transform), transition }}
        target={target}
        tasksCount={tasksCount}
        to={getTaskListPath(id)}
        handle={
          <Button
            ref={setActivatorNodeRef}
            aria-label={`Reorder ${name}`}
            className="absolute inset-y-0 left-0.5 my-auto w-4 cursor-grab touch-none text-muted-foreground opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 active:cursor-grabbing pointer-coarse:opacity-100"
            size="icon-xs"
            type="button"
            variant="ghost"
            {...attributes}
            {...listeners}
          >
            <GripVertical />
          </Button>
        }
        action={
          <EditDeleteMenu
            className="absolute inset-y-0 right-1 my-auto"
            name={name}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        }
        menu={
          <ContextMenuContent aria-label={`${name} actions`} className="w-40">
            <ContextMenuItem onSelect={handleEdit}>
              <Pencil />
              Edit
            </ContextMenuItem>
            <ContextMenuItem variant="destructive" onSelect={handleDelete}>
              <Trash2 />
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        }
      />
      {dialog === DIALOGS.EDIT && (
        <EditAreaDialog lifeArea={lifeArea} onClose={handleClose} onDelete={handleDelete} />
      )}
      {dialog === DIALOGS.DELETE && <DeleteAreaDialog lifeArea={lifeArea} onClose={handleClose} />}
    </>
  );
};

export default AreaItem;

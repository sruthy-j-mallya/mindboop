import { useState } from "react";

import { Pencil, Trash2 } from "lucide-react";

import type { LifeArea } from "@/apis/types";
import LifeAreaBadge from "@/components/commons/LifeArea/Badge";
import { ContextMenuContent, ContextMenuItem } from "@/components/ui/context-menu";
import { getTaskListPath } from "@/utils";

import DeleteAreaDialog from "../AreaDialog/Delete";
import EditAreaDialog from "../AreaDialog/Edit";
import NavItem from "./NavItem";

type AreaItemProps = { lifeArea: LifeArea; tasksCount: number };

const DIALOGS = { EDIT: "edit", DELETE: "delete" } as const;

type Dialog = (typeof DIALOGS)[keyof typeof DIALOGS];

// An area in the sidebar. A right click (or a long press) opens a menu to edit or delete it.
const AreaItem = ({ lifeArea, tasksCount }: AreaItemProps) => {
  const { id, name, color, emoji } = lifeArea;
  const [dialog, setDialog] = useState<Dialog | null>(null);

  const handleEdit = () => setDialog(DIALOGS.EDIT);
  const handleDelete = () => setDialog(DIALOGS.DELETE);
  const handleClose = () => setDialog(null);

  return (
    <>
      <NavItem
        icon={<LifeAreaBadge className="size-5 text-xs" color={color} emoji={emoji} />}
        id={id}
        target={{ lifeAreaId: id, name }}
        tasksCount={tasksCount}
        to={getTaskListPath(id)}
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

import { useState } from "react";

import { Ellipsis, Pencil, Trash2 } from "lucide-react";

import type { Routine } from "@/apis/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import DeleteRoutineDialog from "../RoutineDialog/Delete";
import EditRoutineDialog from "../RoutineDialog/Edit";

type ActionsMenuProps = { routine: Routine };

// Edit and Delete, behind one button. Deleting asks first.
const ActionsMenu = ({ routine }: ActionsMenuProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleEdit = () => setShowEditDialog(true);
  const handleEditDialogClose = () => setShowEditDialog(false);
  const handleDelete = () => setShowDeleteDialog(true);
  const handleDeleteDialogClose = () => setShowDeleteDialog(false);

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="More actions"
            className="text-muted-foreground"
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={handleEdit}>
            <Pencil />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={handleDelete}>
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {showEditDialog && <EditRoutineDialog routine={routine} onClose={handleEditDialogClose} />}
      {showDeleteDialog && <DeleteRoutineDialog routine={routine} onClose={handleDeleteDialogClose} />}
    </>
  );
};

export default ActionsMenu;

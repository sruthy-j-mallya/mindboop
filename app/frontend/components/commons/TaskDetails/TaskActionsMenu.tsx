import { useRef, useState } from "react";

import { Ellipsis, ListTodo, Trash2 } from "lucide-react";

import type { Task } from "@/apis/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import DeleteTaskDialog from "./DeleteTaskDialog";

type TaskActionsMenuProps = {
  task: Task;
  canDelete?: boolean;
  onAddStep: () => void;
  onDeleted?: () => void;
};

// Adding steps to the task and deleting it, behind one button so the header stays calm. Adding the first step is offered only while there are none; after that, Enter in a step adds the next.
// Deleting asks first. Renders nothing when there's nothing to offer.
const TaskActionsMenu = ({ task, canDelete = true, onAddStep, onDeleted }: TaskActionsMenuProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  // Set when "Add step" is picked, so the closing menu leaves focus in the new step row instead of on its trigger.
  const isAddingStep = useRef(false);
  const canAddStep = task.checklistItems.length === 0;

  const handleAddStep = () => {
    isAddingStep.current = true;
    onAddStep();
  };

  const handleCloseAutoFocus = (event: Event) => {
    if (!isAddingStep.current) return;

    event.preventDefault();
    isAddingStep.current = false;
  };

  const handleDelete = () => setShowDeleteDialog(true);

  const handleDeleteDialogClose = () => setShowDeleteDialog(false);

  if (!canAddStep && !canDelete) return null;

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="More actions"
            className="shrink-0 text-muted-foreground"
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-40" onCloseAutoFocus={handleCloseAutoFocus}>
          {canAddStep && (
            <DropdownMenuItem onSelect={handleAddStep}>
              <ListTodo />
              Add step
            </DropdownMenuItem>
          )}
          {canAddStep && canDelete && <DropdownMenuSeparator />}
          {canDelete && (
            <DropdownMenuItem variant="destructive" onSelect={handleDelete}>
              <Trash2 />
              Delete task
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {showDeleteDialog && (
        <DeleteTaskDialog task={task} onClose={handleDeleteDialogClose} onDeleted={onDeleted} />
      )}
    </>
  );
};

export default TaskActionsMenu;

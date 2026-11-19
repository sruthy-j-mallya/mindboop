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
  onAddStep: () => void;
  onDeleted?: () => void;
};

// The task's less frequent actions, behind one button so the header keeps room for the date, estimate and area. Adding
// the first step is offered only while there are none; after that, Enter in a step adds the next. Deleting asks first.
const TaskActionsMenu = ({ task, onAddStep, onDeleted }: TaskActionsMenuProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  // Set when "Add step" is picked, so the closing menu leaves focus in the new step row instead of on its trigger.
  const isAddingStep = useRef(false);
  const hasSteps = task.checklistItems.length > 0;

  const handleAddStep = () => {
    isAddingStep.current = true;
    onAddStep();
  };

  const handleCloseAutoFocus = (event: Event) => {
    if (!isAddingStep.current) return;

    isAddingStep.current = false;
    event.preventDefault();
  };

  const handleDelete = () => setShowDeleteDialog(true);

  const handleDeleteDialogClose = () => setShowDeleteDialog(false);

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
          {!hasSteps && (
            <>
              <DropdownMenuItem onSelect={handleAddStep}>
                <ListTodo />
                Add step
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem variant="destructive" onSelect={handleDelete}>
            <Trash2 />
            Delete task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {showDeleteDialog && (
        <DeleteTaskDialog task={task} onClose={handleDeleteDialogClose} onDeleted={onDeleted} />
      )}
    </>
  );
};

export default TaskActionsMenu;

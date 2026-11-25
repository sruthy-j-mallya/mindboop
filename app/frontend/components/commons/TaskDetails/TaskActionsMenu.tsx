import { useRef, useState } from "react";

import { CalendarDays, Ellipsis, Hourglass, Inbox, ListTodo, Trash2 } from "lucide-react";

import type { Task } from "@/apis/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLifeAreas } from "@/hooks/reactQuery/useLifeAreasApi";

import DeleteTaskDialog from "./DeleteTaskDialog";
import type { Detail } from "./types";

type TaskActionsMenuProps = {
  task: Task;
  canDelete?: boolean;
  onAddDetail: (detail: Detail) => void;
  onAddStep: () => void;
  onDeleted?: () => void;
};

// What the task doesn't have yet (a due date, estimate, area or steps) and deleting it, behind one button so the header
// stays calm. Adding the first step is offered only while there are none; after that, Enter in a step adds the next.
// Deleting asks first. Renders nothing when there's nothing to offer.
const TaskActionsMenu = ({
  task,
  canDelete = true,
  onAddDetail,
  onAddStep,
  onDeleted,
}: TaskActionsMenuProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  // Set when "Add step" is picked, so the closing menu leaves focus in the new step row instead of on its trigger.
  const isAddingStep = useRef(false);
  // The detail picked. Its picker opens only once the menu is gone, so the closing menu can't take focus from it.
  const detailToAdd = useRef<Detail | null>(null);
  const { data: lifeAreas = [] } = useLifeAreas();
  const canAddStep = task.checklistItems.length === 0;
  const canAddSchedule = !task.startsAt;
  const canAddEstimate = !task.estimatedMinutes;
  const canAddLifeArea = !task.lifeAreaId && lifeAreas.length > 0;
  const canAdd = canAddSchedule || canAddEstimate || canAddLifeArea || canAddStep;

  const handleAddStep = () => {
    isAddingStep.current = true;
    onAddStep();
  };

  const handleAddSchedule = () => {
    detailToAdd.current = "schedule";
  };

  const handleAddEstimate = () => {
    detailToAdd.current = "estimate";
  };

  const handleAddLifeArea = () => {
    detailToAdd.current = "lifeArea";
  };

  const handleCloseAutoFocus = (event: Event) => {
    if (!isAddingStep.current && !detailToAdd.current) return;

    event.preventDefault();
    if (detailToAdd.current) onAddDetail(detailToAdd.current);
    isAddingStep.current = false;
    detailToAdd.current = null;
  };

  const handleDelete = () => setShowDeleteDialog(true);

  const handleDeleteDialogClose = () => setShowDeleteDialog(false);

  if (!canAdd && !canDelete) return null;

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
          {canAddSchedule && (
            <DropdownMenuItem onSelect={handleAddSchedule}>
              <CalendarDays />
              Add due date
            </DropdownMenuItem>
          )}
          {canAddLifeArea && (
            <DropdownMenuItem onSelect={handleAddLifeArea}>
              <Inbox />
              Move to area
            </DropdownMenuItem>
          )}
          {canAddEstimate && (
            <DropdownMenuItem onSelect={handleAddEstimate}>
              <Hourglass />
              Add estimate
            </DropdownMenuItem>
          )}
          {canAddStep && (
            <DropdownMenuItem onSelect={handleAddStep}>
              <ListTodo />
              Add step
            </DropdownMenuItem>
          )}
          {canAdd && canDelete && <DropdownMenuSeparator />}
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

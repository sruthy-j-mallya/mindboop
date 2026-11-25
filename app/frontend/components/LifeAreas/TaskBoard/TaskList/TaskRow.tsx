import { useState } from "react";

import { useDraggable } from "@dnd-kit/core";
import { cn } from "cn";
import { CalendarDays, ChevronRight, GripVertical, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router";

import type { Task } from "@/apis/types";
import ScheduleLabel from "@/components/commons/ScheduleLabel";
import SchedulePicker from "@/components/commons/SchedulePicker";
import type { SchedulePayload } from "@/components/commons/SchedulePicker/types";
import DeleteTaskDialog from "@/components/commons/TaskDetails/DeleteTaskDialog";
import TitleInput from "@/components/commons/TitleInput";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PHONE_LAYOUT_QUERY } from "@/constants";
import { useCurrentTimeLog } from "@/hooks/reactQuery/useCurrentTimeLogsApi";
import { useUpdateTask } from "@/hooks/reactQuery/useTasksApi";
import useCompleteTask from "@/hooks/useCompleteTask";
import useDeleteTaskWithUndo from "@/hooks/useDeleteTaskWithUndo";
import useMediaQuery from "@/hooks/useMediaQuery";
import useRenameTask from "@/hooks/useRenameTask";
import { getTaskPath } from "@/utils";

import { DRAG_TYPES, NARROW_LAYOUT_QUERY } from "../../constants";
import type { DragData } from "../../types";

type TaskRowProps = { task: Task };

const TaskRow = ({ task }: TaskRowProps) => {
  const { id } = task;
  const navigate = useNavigate();
  const isPhone = useMediaQuery(PHONE_LAYOUT_QUERY);
  const { completeTask, isCompleting, isSelected, error: completeError } = useCompleteTask(task);
  const { data: timeLog } = useCurrentTimeLog();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { deleteTask, isDeleting, error: deleteError } = useDeleteTaskWithUndo(task);
  const { mutate: updateTask, error: scheduleError } = useUpdateTask();
  const { title, renameTask, error: renameError } = useRenameTask(task);
  const error = completeError ?? deleteError ?? scheduleError ?? renameError;
  const dragData: DragData = { type: DRAG_TYPES.TASK, task };
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id, data: dragData });

  const handleScheduleSave = (schedule: SchedulePayload) => updateTask({ id, ...schedule });

  // The task on the clock asks first, about the time so far.
  const handleDelete = () => {
    if (timeLog?.taskId === id) setShowDeleteDialog(true);
    else void deleteTask();
  };

  const handleDeleteDialogClose = () => setShowDeleteDialog(false);

  const taskPath = getTaskPath(id, task.lifeAreaId);

  // On wide screens, going into the title also opens the task beside the list. Narrow screens show one at a time, so
  // there the title only edits and the chevron opens the task.
  const handleTitleFocus = () => {
    if (!isSelected && !window.matchMedia(NARROW_LAYOUT_QUERY).matches) navigate(taskPath);
  };

  return (
    <li ref={setNodeRef} className="grid gap-1">
      <div
        className={cn(
          "group flex items-center gap-3 rounded-md pr-3 pl-1 transition-colors focus-within:bg-muted hover:bg-muted",
          isSelected && "bg-muted",
          (isDeleting || isDragging) && "opacity-50",
        )}
      >
        {/* Drags the task onto an area (or the Inbox) beside the list. It shows while the row is hovered or has focus,
            keeping its space so the row doesn't shift; touch screens can't hover, so it always shows there. */}
        <Button
          aria-label={`Move ${title}`}
          className="-mr-2 w-4 shrink-0 cursor-grab touch-none text-muted-foreground opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 active:cursor-grabbing pointer-coarse:opacity-100"
          size="icon-xs"
          type="button"
          variant="ghost"
          {...attributes}
          {...listeners}
        >
          <GripVertical />
        </Button>
        <Checkbox
          aria-label={`Complete ${title}`}
          checked={isCompleting}
          disabled={isCompleting || isDeleting}
          onCheckedChange={completeTask}
        />
        <div className="flex min-w-0 flex-1 flex-col py-2">
          <TitleInput
            className="text-sm"
            isSelected={isSelected}
            label={title}
            title={title}
            onFocus={handleTitleFocus}
            onSave={renameTask}
          />
          {/* On phones the date is only read here, under the title; the pane changes it. */}
          {isPhone && <ScheduleLabel className="text-xs" schedule={task} />}
        </div>
        {/* Opens the same picker as the pane. */}
        {task.startsAt && !isPhone && (
          <SchedulePicker align="end" schedule={task} onSave={handleScheduleSave}>
            {/* A bordered chip with a calendar icon, so it reads as something to click rather than plain text. */}
            <Button
              className="h-6 shrink-0 gap-1 rounded-full border-border bg-background px-2 text-xs font-normal shadow-none hover:border-muted-foreground/40 hover:bg-background has-[>svg]:px-2 dark:bg-background dark:hover:bg-background"
              size="sm"
              type="button"
              variant="outline"
            >
              <CalendarDays className="size-3.5 text-muted-foreground" />
              <span className="sr-only">Due date of {title}:</span> <ScheduleLabel schedule={task} />
            </Button>
          </SchedulePicker>
        )}
        {/* With a mouse, it shows on hover or focus to keep the list calm; touch screens always show it. No confirmation:
            the toast offers to undo instead. The task on the clock is the exception. */}
        <Button
          aria-label={`Delete ${title}`}
          className="-mr-2 shrink-0 text-muted-foreground group-focus-within:opacity-100 group-hover:opacity-100 hover:text-destructive pointer-fine:opacity-0"
          disabled={isDeleting}
          size="icon-sm"
          type="button"
          variant="ghost"
          onClick={handleDelete}
        >
          <Trash2 />
        </Button>
        <Button
          asChild
          className="-mr-2 shrink-0 text-muted-foreground lg:hidden"
          size="icon-sm"
          variant="ghost"
        >
          <Link aria-label={`Open ${title}`} to={taskPath}>
            <ChevronRight />
          </Link>
        </Button>
      </div>
      {error && (
        <p className="px-3 text-sm text-destructive" role="alert">
          {error.message}
        </p>
      )}
      {showDeleteDialog && <DeleteTaskDialog task={task} onClose={handleDeleteDialogClose} />}
    </li>
  );
};

export default TaskRow;

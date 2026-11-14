import { cn } from "cn";
import { CalendarDays, ChevronRight, Trash2 } from "lucide-react";
import { generatePath, Link, useNavigate } from "react-router";

import type { Task } from "@/apis/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useUpdateTask } from "@/hooks/reactQuery/useTasksApi";
import routes from "@/routes";

import ScheduleLabel from "../ScheduleLabel";
import SchedulePicker from "../SchedulePicker";
import type { SchedulePayload } from "../SchedulePicker/types";
import useCompleteTask from "../useCompleteTask";
import useDeleteTaskWithUndo from "../useDeleteTaskWithUndo";
import { NARROW_LAYOUT_QUERY } from "./constants";
import TitleInput from "./TitleInput";

type TaskRowProps = { task: Task };

const TaskRow = ({ task }: TaskRowProps) => {
  const { id } = task;
  const navigate = useNavigate();
  const { completeTask, isCompleting, isSelected, error: completeError } = useCompleteTask(id);
  const { deleteTask, isDeleting, error: deleteError } = useDeleteTaskWithUndo(task);
  const { mutate: updateTask, error: scheduleError } = useUpdateTask();
  const {
    mutate: renameTask,
    variables: renameVariables,
    isPending: isRenaming,
    error: renameError,
  } = useUpdateTask();
  const error = completeError ?? deleteError ?? scheduleError ?? renameError;
  // Shows the new title while it saves, so the old one doesn't flash back until the list refreshes.
  const title = (isRenaming && renameVariables.title) || task.title;

  const handleScheduleSave = (schedule: SchedulePayload) => updateTask({ id, ...schedule });

  const taskPath = generatePath(routes.inbox.show, { taskId: id });

  // On wide screens, going into the title also opens the task beside the list. Narrow screens show one at a time, so
  // there the title only edits and the chevron opens the task.
  const handleTitleFocus = () => {
    if (!isSelected && !window.matchMedia(NARROW_LAYOUT_QUERY).matches) navigate(taskPath);
  };

  // A task can't go untitled, so an emptied title leaves the old one in place. An unchanged one isn't saved again.
  const handleRename = (newTitle: string) => {
    if (newTitle && newTitle !== title) renameTask({ id, title: newTitle });
  };

  return (
    <li className="grid gap-1">
      <div
        className={cn(
          "group flex items-center gap-3 rounded-md px-3 transition-colors focus-within:bg-muted hover:bg-muted",
          isSelected && "bg-muted",
          isDeleting && "opacity-50",
        )}
      >
        <Checkbox
          aria-label={`Complete ${title}`}
          checked={isCompleting}
          className="border-muted-foreground/50"
          disabled={isCompleting || isDeleting}
          onCheckedChange={completeTask}
        />
        <TitleInput isSelected={isSelected} title={title} onFocus={handleTitleFocus} onSave={handleRename} />
        {/* Opens the same picker as the pane. Hidden on phones to leave the title room; the pane still shows it. */}
        {task.startsAt && (
          <SchedulePicker align="end" task={task} onSave={handleScheduleSave}>
            {/* A bordered chip with a calendar icon, so it reads as something to click rather than plain text. */}
            <Button
              className="h-6 shrink-0 gap-1 rounded-full border-border bg-background px-2 text-xs font-normal shadow-none hover:border-muted-foreground/40 hover:bg-background has-[>svg]:px-2 max-sm:hidden dark:bg-background dark:hover:bg-background"
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
            the toast offers to undo instead. */}
        <Button
          aria-label={`Delete ${title}`}
          className="-mr-2 shrink-0 text-muted-foreground group-focus-within:opacity-100 group-hover:opacity-100 hover:text-destructive pointer-fine:opacity-0"
          disabled={isDeleting}
          size="icon-sm"
          type="button"
          variant="ghost"
          onClick={deleteTask}
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
    </li>
  );
};

export default TaskRow;

import { cn } from "cn";
import { CalendarDays, Trash2 } from "lucide-react";
import { generatePath, Link } from "react-router";

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

type TaskRowProps = { task: Task };

const TaskRow = ({ task }: TaskRowProps) => {
  const { id, title } = task;
  const { completeTask, isCompleting, isSelected, error: completeError } = useCompleteTask(id);
  const { deleteTask, isDeleting, error: deleteError } = useDeleteTaskWithUndo(task);
  const { mutate: updateTask, error: scheduleError } = useUpdateTask();
  const error = completeError ?? deleteError ?? scheduleError;

  const handleScheduleSave = (schedule: SchedulePayload) => updateTask({ id, ...schedule });

  return (
    <li className="grid gap-1">
      <div
        className={cn(
          "group flex items-center gap-3 rounded-md px-3 transition-colors hover:bg-muted",
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
        <Link
          aria-current={isSelected ? "page" : undefined}
          className="min-w-0 flex-1 py-2 text-sm wrap-anywhere outline-none focus-visible:underline"
          to={generatePath(routes.inbox.show, { taskId: id })}
        >
          {title}
        </Link>
        {/* Outside the link, since a button can't nest in one. Opens the same picker as the pane. */}
        {task.startsAt && (
          <SchedulePicker align="end" task={task} onSave={handleScheduleSave}>
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

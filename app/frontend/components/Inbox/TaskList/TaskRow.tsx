import { cn } from "cn";
import { Trash2 } from "lucide-react";
import { generatePath, Link } from "react-router";

import type { Task } from "@/apis/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import routes from "@/routes";
import { formatMinutes } from "@/utils";

import ScheduleLabel from "../ScheduleLabel";
import useCompleteTask from "../useCompleteTask";
import useDeleteTaskWithUndo from "../useDeleteTaskWithUndo";

type TaskRowProps = { task: Task };

const TaskRow = ({ task }: TaskRowProps) => {
  const { id, title, checklistItems, estimatedMinutes } = task;
  const { completeTask, isCompleting, isSelected, error: completeError } = useCompleteTask(id);
  const { deleteTask, isDeleting, error: deleteError } = useDeleteTaskWithUndo(task);
  const error = completeError ?? deleteError;
  const doneStepsCount = checklistItems.filter(({ isCompleted }) => isCompleted).length;

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
          className="flex min-w-0 flex-1 items-center justify-between gap-2 py-2 text-sm outline-none focus-visible:underline"
          to={generatePath(routes.inbox.show, { taskId: id })}
        >
          <span className="min-w-0 wrap-anywhere">{title}</span>
          <span className="flex shrink-0 items-center gap-3 text-xs">
            {checklistItems.length > 0 && (
              <span className="text-muted-foreground">
                {doneStepsCount}/{checklistItems.length} steps
              </span>
            )}
            {estimatedMinutes && (
              <span className="text-muted-foreground">{formatMinutes(estimatedMinutes)}</span>
            )}
            <ScheduleLabel schedule={task} />
          </span>
        </Link>
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

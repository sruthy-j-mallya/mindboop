import { cn } from "cn";
import { generatePath, Link, useMatch, useNavigate } from "react-router";

import type { Task } from "@/apis/types";
import { Checkbox } from "@/components/ui/checkbox";
import { useUpdateTask } from "@/hooks/reactQuery/useTasksApi";
import routes from "@/routes";

type TaskRowProps = { task: Task };

const TaskRow = ({ task: { id, title, checklistItems } }: TaskRowProps) => {
  const navigate = useNavigate();
  const isSelected = useMatch(routes.inbox.show)?.params.taskId === id;
  const { mutate: updateTask, isPending, isSuccess, error } = useUpdateTask();
  const isCompleting = isPending || isSuccess;
  const doneStepsCount = checklistItems.filter(({ isCompleted }) => isCompleted).length;

  // A completed task leaves the Inbox, so its pane closes with it.
  const handleCompleted = () => {
    if (isSelected) navigate(routes.inbox.index);
  };

  const handleComplete = () => updateTask({ id, isCompleted: true }, { onSuccess: handleCompleted });

  return (
    <li className="grid gap-1">
      <div
        className={cn(
          "flex items-center gap-3 rounded-md px-3 transition-colors hover:bg-muted",
          isSelected && "bg-muted",
        )}
      >
        {/* Stays ticked until the refreshed list drops the task. */}
        <Checkbox
          aria-label={`Complete ${title}`}
          checked={isCompleting}
          className="border-muted-foreground/50"
          disabled={isCompleting}
          onCheckedChange={handleComplete}
        />
        <Link
          aria-current={isSelected ? "page" : undefined}
          className="flex min-w-0 flex-1 items-center justify-between gap-2 py-2 text-sm outline-none focus-visible:underline"
          to={generatePath(routes.inbox.show, { taskId: id })}
        >
          <span className="min-w-0 wrap-anywhere">{title}</span>
          {checklistItems.length > 0 && (
            <span className="shrink-0 text-xs text-muted-foreground">
              {doneStepsCount}/{checklistItems.length} steps
            </span>
          )}
        </Link>
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

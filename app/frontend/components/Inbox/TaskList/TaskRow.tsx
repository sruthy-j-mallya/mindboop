import { cn } from "cn";
import { generatePath, Link } from "react-router";

import type { Task } from "@/apis/types";
import { Checkbox } from "@/components/ui/checkbox";
import routes from "@/routes";

import useCompleteTask from "../useCompleteTask";

type TaskRowProps = { task: Task };

const TaskRow = ({ task: { id, title, checklistItems } }: TaskRowProps) => {
  const { completeTask, isCompleting, isSelected, error } = useCompleteTask(id);
  const doneStepsCount = checklistItems.filter(({ isCompleted }) => isCompleted).length;

  return (
    <li className="grid gap-1">
      <div
        className={cn(
          "flex items-center gap-3 rounded-md px-3 transition-colors hover:bg-muted",
          isSelected && "bg-muted",
        )}
      >
        <Checkbox
          aria-label={`Complete ${title}`}
          checked={isCompleting}
          className="border-muted-foreground/50"
          disabled={isCompleting}
          onCheckedChange={completeTask}
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

import { Link } from "react-router";

import { Checkbox } from "@/components/ui/checkbox";
import useCompleteTask from "@/hooks/useCompleteTask";
import { getTaskPath } from "@/utils";

import type { TaskRowProps } from "./types";

// The checkbox completes the task; the title opens it in its area or the Inbox.
const TaskRow = ({ task, details, children, error }: TaskRowProps) => {
  const { id, title, lifeAreaId } = task;
  const { completeTask, isCompleting, error: completeError } = useCompleteTask(task);
  const message = completeError?.message ?? error;

  return (
    <li className="grid gap-1 py-2">
      <div className="flex items-start gap-3">
        <Checkbox
          aria-label={`Complete ${title}`}
          checked={isCompleting}
          className="mt-1.5 border-muted-foreground/50"
          disabled={isCompleting}
          onCheckedChange={completeTask}
        />
        {/* The end of the row wraps under the title rather than squeezing it. */}
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
          <div className="flex min-w-0 flex-[1_1_10rem] flex-col items-start gap-1">
            <Link
              className="py-1 text-sm wrap-anywhere underline-offset-4 hover:underline"
              to={getTaskPath(id, lifeAreaId)}
            >
              {title}
            </Link>
            {details}
          </div>
          {children}
        </div>
      </div>
      {message && (
        <p className="text-sm text-destructive" role="alert">
          {message}
        </p>
      )}
    </li>
  );
};

export default TaskRow;

import { Link } from "react-router";

import LinkifiedText from "@/components/commons/LinkifiedText";
import { Checkbox } from "@/components/ui/checkbox";
import useCompleteTask from "@/hooks/useCompleteTask";
import { getTaskPath } from "@/utils";

import type { TaskRowProps } from "./types";

// The checkbox completes the task; the title opens it in its area or the Inbox.
const TaskRow = ({ task, leading, details, children, error }: TaskRowProps) => {
  const { id, title, lifeAreaId } = task;
  const { completeTask, isCompleting, error: completeError } = useCompleteTask(task);
  const message = completeError?.message ?? error;
  const taskPath = getTaskPath(id, lifeAreaId);

  const renderTitleText = (text: string) => (
    <Link className="underline-offset-4 hover:underline" to={taskPath}>
      {text}
    </Link>
  );

  return (
    <li className="grid gap-1 py-2">
      <div className="flex items-start gap-3">
        <Checkbox
          aria-label={`Complete ${title}`}
          checked={isCompleting}
          className="mt-1.5"
          disabled={isCompleting}
          onCheckedChange={completeTask}
        />
        {leading}
        {/* The end of the row wraps under the title rather than squeezing it. */}
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
          <div className="flex min-w-0 flex-[1_1_10rem] flex-col items-start gap-1">
            {/* Links can't nest, so any web address in the title opens on its own and the rest opens the task. */}
            <p className="py-1 text-sm wrap-anywhere">
              <LinkifiedText renderText={renderTitleText} text={title} />
            </p>
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

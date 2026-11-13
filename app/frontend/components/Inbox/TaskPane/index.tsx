import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { useTask } from "@/hooks/reactQuery/useTasksApi";
import routes from "@/routes";

import Details from "./Details";

const TaskPane = () => {
  const { taskId = "" } = useParams();
  const { data: task, isPending, error } = useTask(taskId);

  return (
    <div className="flex flex-col gap-4">
      {/* On narrow screens the pane replaces the list, so this leads back to it. */}
      <Button asChild className="self-start lg:hidden" size="sm" variant="ghost">
        <Link to={routes.inbox.index}>
          <ArrowLeft />
          Inbox
        </Link>
      </Button>
      {!isPending && !task && (
        <p className="text-sm text-destructive" role="alert">
          {error?.message}
        </p>
      )}
      {task && <Details key={task.id} task={task} />}
    </div>
  );
};

export default TaskPane;

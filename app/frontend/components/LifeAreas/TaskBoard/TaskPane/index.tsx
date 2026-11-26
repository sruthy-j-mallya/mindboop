import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router";

import ListSkeleton from "@/components/commons/ListSkeleton";
import TaskDetails from "@/components/commons/TaskDetails";
import { Button } from "@/components/ui/button";
import { useLifeAreas } from "@/hooks/reactQuery/useLifeAreasApi";
import { useTask } from "@/hooks/reactQuery/useTasksApi";
import { getTaskListPath } from "@/utils";

import { INBOX_NAME } from "../../constants";

const TaskPane = () => {
  const { taskId = "", lifeAreaId } = useParams();
  const { data: task, isPending, error } = useTask(taskId);
  const { data: lifeAreas = [] } = useLifeAreas({ enabled: !!lifeAreaId });
  const listName = lifeAreas.find(({ id }) => id === lifeAreaId)?.name ?? INBOX_NAME;

  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* On narrow screens the pane replaces the list, so this leads back to it. */}
      <Button asChild className="self-start lg:hidden" size="sm" variant="ghost">
        <Link to={getTaskListPath(lifeAreaId)}>
          <ArrowLeft />
          {listName}
        </Link>
      </Button>
      {isPending && <ListSkeleton />}
      {!isPending && !task && (
        <p className="text-sm text-destructive" role="alert">
          {error?.message}
        </p>
      )}
      {task && <TaskDetails key={task.id} task={task} />}
    </div>
  );
};

export default TaskPane;

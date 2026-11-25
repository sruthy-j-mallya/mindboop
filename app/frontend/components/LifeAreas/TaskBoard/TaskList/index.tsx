import { Inbox } from "lucide-react";

import type { LifeArea } from "@/apis/types";
import { Button } from "@/components/ui/button";
import { useInfiniteTasks } from "@/hooks/reactQuery/useTasksApi";

import { getTaskFilters } from "../utils";
import EmptyList from "./EmptyList";
import TaskRow from "./TaskRow";

type TaskListProps = { lifeArea?: LifeArea };

// The tasks still to do in the area (or the Inbox), soonest due first, then newest first.
const TaskList = ({ lifeArea }: TaskListProps) => {
  const { data, isPending, error, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteTasks(
    getTaskFilters(lifeArea),
  );
  const tasks = data?.pages.flatMap((page) => page.tasks) ?? [];

  const handleLoadMore = () => fetchNextPage();

  if (isPending) return null;

  if (error) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {error.message}
      </p>
    );
  }

  if (tasks.length === 0 && lifeArea) {
    return (
      <EmptyList
        hint="Add one above, or drag one here from the Inbox or another area."
        icon={Inbox}
        title={`Nothing in ${lifeArea.name} yet`}
      />
    );
  }

  if (tasks.length === 0) {
    return (
      <EmptyList
        hint="There are no tasks to do. Add one above to get started."
        icon={Inbox}
        title="Your Inbox is empty"
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <ul aria-label="Tasks" className="flex flex-col gap-1">
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
      </ul>
      {hasNextPage && (
        <Button disabled={isFetchingNextPage} type="button" variant="ghost" onClick={handleLoadMore}>
          Load more
        </Button>
      )}
    </div>
  );
};

export default TaskList;

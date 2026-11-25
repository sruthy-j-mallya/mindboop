import { Inbox } from "lucide-react";

import type { LifeArea } from "@/apis/types";
import ListSkeleton from "@/components/commons/ListSkeleton";
import { SCHEDULE_REFRESH_INTERVAL } from "@/components/commons/ScheduleLabel/constants";
import { Button } from "@/components/ui/button";
import { useInfiniteTasks } from "@/hooks/reactQuery/useTasksApi";
import useCurrentTime from "@/hooks/useCurrentTime";

import { getTaskFilters } from "../utils";
import EmptyList from "./EmptyList";
import Group from "./Group";
import TaskRow from "./TaskRow";
import { groupTasks } from "./utils";

type TaskListProps = { lifeArea?: LifeArea };

// The tasks still to do in the area (or the Inbox), soonest due first, then newest first.
const TaskList = ({ lifeArea }: TaskListProps) => {
  const { data, isPending, error, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteTasks(
    getTaskFilters(lifeArea),
  );
  const tasks = data?.pages.flatMap((page) => page.tasks) ?? [];

  const now = useCurrentTime(true, SCHEDULE_REFRESH_INTERVAL);
  const groups = groupTasks(tasks, now);

  const handleLoadMore = () => fetchNextPage();

  if (isPending) return <ListSkeleton className="px-2" />;

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
      {/* Headings only once there's something to tell apart. */}
      {groups.length > 1 ? (
        <ul aria-label="Tasks" className="flex flex-col gap-4">
          {groups.map((group) => (
            <Group key={group.id} group={group} />
          ))}
        </ul>
      ) : (
        <ul aria-label="Tasks" className="flex flex-col gap-1">
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </ul>
      )}
      {hasNextPage && (
        <Button disabled={isFetchingNextPage} type="button" variant="ghost" onClick={handleLoadMore}>
          Load more
        </Button>
      )}
    </div>
  );
};

export default TaskList;

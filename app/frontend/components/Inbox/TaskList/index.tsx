import { Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useInfiniteTasks } from "@/hooks/reactQuery/useTasksApi";

import { INBOX_FILTERS } from "../constants";
import TaskRow from "./TaskRow";

const TaskList = () => {
  const { data, isPending, error, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteTasks(INBOX_FILTERS);
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

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
        <Inbox className="size-8" />
        <p className="font-medium text-foreground">Your Inbox is empty</p>
        <p className="text-sm">There are no tasks to do. Add one above to get started.</p>
      </div>
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

import ListSkeleton from "@/components/commons/ListSkeleton";
import { Button } from "@/components/ui/button";
import { useAllLifeAreas } from "@/hooks/reactQuery/useLifeAreasApi";
import { useInfiniteTasks } from "@/hooks/reactQuery/useTasksApi";

import EmptyList from "../TaskBoard/TaskList/EmptyList";
import type { ArchiveListProps } from "./types";

// The completed or the deleted tasks, from every list.
const ArchiveList = ({
  title,
  icon,
  filters,
  emptyTitle,
  emptyHint,
  error,
  renderTask,
}: ArchiveListProps) => {
  const {
    data,
    isPending,
    error: loadError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteTasks(filters);
  const { data: lifeAreas = [] } = useAllLifeAreas();
  const tasks = data?.pages.flatMap((page) => page.tasks) ?? [];
  const message = loadError?.message ?? error;

  const handleLoadMore = () => fetchNextPage();

  return (
    <section
      aria-labelledby="task-archive-heading"
      className="mx-auto flex w-full max-w-3xl min-w-0 flex-1 flex-col gap-4 p-4 max-lg:pt-4 lg:overflow-y-auto lg:pt-0"
    >
      <h1 className="text-2xl font-semibold" id="task-archive-heading">
        {title}
      </h1>
      {message && (
        <p className="text-sm text-destructive" role="alert">
          {message}
        </p>
      )}
      {isPending && <ListSkeleton />}
      {!isPending && !loadError && tasks.length === 0 && (
        <EmptyList hint={emptyHint} icon={icon} title={emptyTitle} />
      )}
      {tasks.length > 0 && (
        <ul aria-labelledby="task-archive-heading" className="flex flex-col divide-y">
          {tasks.map((task) =>
            renderTask(
              task,
              lifeAreas.find(({ id }) => id === task.lifeAreaId),
            ),
          )}
        </ul>
      )}
      {hasNextPage && (
        <Button disabled={isFetchingNextPage} type="button" variant="ghost" onClick={handleLoadMore}>
          Load more
        </Button>
      )}
    </section>
  );
};

export default ArchiveList;

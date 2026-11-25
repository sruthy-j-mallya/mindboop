import type { LifeArea } from "@/apis/types";
import ListSkeleton from "@/components/commons/ListSkeleton";
import { Button } from "@/components/ui/button";
import { useInfiniteTasks } from "@/hooks/reactQuery/useTasksApi";

import { getCompletedTaskFilters } from "../utils";
import CompletedRow from "./CompletedRow";

type CompletedListProps = { lifeArea?: LifeArea };

// Most recently changed first.
const CompletedList = ({ lifeArea }: CompletedListProps) => {
  const { data, isPending, error, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteTasks(
    getCompletedTaskFilters(lifeArea),
  );
  const tasks = data?.pages.flatMap((page) => page.tasks) ?? [];

  const handleLoadMore = () => fetchNextPage();

  if (isPending) return <ListSkeleton className="px-3" rows={2} />;

  if (error) {
    return (
      <p className="px-3 text-sm text-destructive" role="alert">
        {error.message}
      </p>
    );
  }

  if (tasks.length === 0) {
    return <p className="px-3 py-2 text-sm text-muted-foreground">Nothing completed here yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <ul aria-label="Completed tasks" className="flex flex-col gap-1">
        {tasks.map((task) => (
          <CompletedRow key={task.id} task={task} />
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

export default CompletedList;

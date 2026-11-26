import { CircleCheck } from "lucide-react";
import { toast } from "sonner";

import type { Task } from "@/apis/types";
import { useUpdateTask } from "@/hooks/reactQuery/useTasksApi";

import ArchiveList from "./ArchiveList";
import ArchiveRow from "./ArchiveRow";
import { COMPLETED_FILTERS, COMPLETED_NAME } from "./constants";
import { describeReturn } from "./utils";

// The mutation lives here and not in a row, which leaves the list before its callbacks would run.
const Completed = () => {
  const { mutate: updateTask, variables, isPending, error } = useUpdateTask();

  const handleReopen = ({ id }: Task, listName: string) =>
    updateTask(
      { id, isCompleted: false },
      { onSuccess: ({ task }) => toast(describeReturn("Reopened", task, listName)) },
    );

  return (
    <ArchiveList
      emptyHint="Tasks you tick off or finish with a session end up here."
      emptyTitle="Nothing completed yet"
      error={error?.message}
      filters={COMPLETED_FILTERS}
      icon={CircleCheck}
      title={COMPLETED_NAME}
      renderTask={(task, lifeArea) => (
        <ArchiveRow
          key={task.id}
          actionLabel="Reopen"
          isBusy={isPending && variables.id === task.id}
          lifeArea={lifeArea}
          task={task}
          onAction={handleReopen}
        />
      )}
    />
  );
};

export default Completed;

import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { Task } from "@/apis/types";
import { useRestoreTask } from "@/hooks/reactQuery/useTaskRestorationsApi";

import ArchiveList from "./ArchiveList";
import ArchiveRow from "./ArchiveRow";
import { DELETED_FILTERS, DELETED_NAME } from "./constants";
import { describeReturn } from "./utils";

// The mutation lives here and not in a row, which leaves the list before its callbacks would run.
const Deleted = () => {
  const { mutate: restoreTask, variables: restoringId, isPending, error } = useRestoreTask();

  const handleRestore = ({ id }: Task, listName: string) =>
    restoreTask(id, { onSuccess: ({ task }) => toast(describeReturn("Restored", task, listName)) });

  return (
    <ArchiveList
      emptyHint="Tasks you delete wait here, in case you want one back."
      emptyTitle="Nothing deleted"
      error={error?.message}
      filters={DELETED_FILTERS}
      icon={Trash2}
      title={DELETED_NAME}
      renderTask={(task, lifeArea) => (
        <ArchiveRow
          key={task.id}
          actionLabel="Restore"
          isBusy={isPending && restoringId === task.id}
          lifeArea={lifeArea}
          task={task}
          onAction={handleRestore}
        />
      )}
    />
  );
};

export default Deleted;

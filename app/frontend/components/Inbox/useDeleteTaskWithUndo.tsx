import { useMatch, useNavigate } from "react-router";
import { toast } from "sonner";

import type { ApiError } from "@/apis/axios";
import type { Task } from "@/apis/types";
import UndoLabel from "@/components/commons/UndoLabel";
import { UNDO_TOAST_DURATION } from "@/constants";
import { useRestoreTask } from "@/hooks/reactQuery/useTaskRestorationsApi";
import { useDeleteTask } from "@/hooks/reactQuery/useTasksApi";
import routes from "@/routes";

// Deletes a task from its list row or its pane, then offers to undo it in a toast. A deleted task leaves the Inbox, so
// its pane closes with it. `isDeleting` stays true after the delete, until the refreshed list drops the task.
// The promises (mutateAsync) settle even once the row has unmounted, which mutate's callbacks wouldn't.
const useDeleteTaskWithUndo = ({ id, title }: Pick<Task, "id" | "title">) => {
  const navigate = useNavigate();
  const isSelected = useMatch(routes.inbox.show)?.params.taskId === id;
  const { mutateAsync: deleteTask, isPending, isSuccess, error } = useDeleteTask();
  const { mutateAsync: restoreTask } = useRestoreTask();

  const handleRestoreFailed = (restoreError: ApiError) => toast.error(restoreError.message);

  const handleUndo = () => restoreTask(id).catch(handleRestoreFailed);

  const handleDeleted = () => {
    if (isSelected) navigate(routes.inbox.index);
    toast(`Deleted “${title}”`, {
      action: { label: <UndoLabel />, onClick: handleUndo },
      duration: UNDO_TOAST_DURATION,
    });
  };

  // A failed delete shows through `error`, so the rejection needs no handling here.
  const deleteTaskWithUndo = () => deleteTask(id).then(handleDeleted, () => undefined);

  return { deleteTask: deleteTaskWithUndo, isDeleting: isPending || isSuccess, error };
};

export default useDeleteTaskWithUndo;

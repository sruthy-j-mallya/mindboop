import { useNavigate } from "react-router";
import { toast } from "sonner";

import type { ApiError } from "@/apis/axios";
import type { Task } from "@/apis/types";
import UndoLabel from "@/components/commons/UndoLabel";
import { UNDO_TOAST_DURATION } from "@/constants";
import { useUpdateTask } from "@/hooks/reactQuery/useTasksApi";
import { useUserPreference } from "@/hooks/reactQuery/useUserPreferencesApi";
import useOpenTask from "@/hooks/useOpenTask";
import { playCompletionSound } from "@/utils/completionSound";

// Completes a task from its list row or its pane, then offers to undo it in a toast. A completed task leaves its list
// (the Inbox or an area), so its pane closes with it; a pane shown elsewhere (the Calendar's popover) closes through
// `onCompleted`.
// `isCompleting` stays true after the save, until the refreshed list drops the task. The chime plays with the click, as
// the checkbox ticks. The promises (mutateAsync) settle even once the row has unmounted, which mutate's callbacks
// wouldn't.
const useCompleteTask = ({ id, title }: Pick<Task, "id" | "title">, onCompleted?: () => void) => {
  const navigate = useNavigate();
  const { openTaskId, listPath } = useOpenTask();
  const isSelected = openTaskId === id;
  const { data: preference } = useUserPreference();
  const { mutateAsync: updateTask, isPending, isSuccess, error, reset } = useUpdateTask();
  // Apart from the completing, so undoing doesn't show as it.
  const { mutateAsync: reopenTask } = useUpdateTask();

  const handleReopenFailed = (reopenError: ApiError) => toast.error(reopenError.message);

  // Unticks the checkbox, if the row is still there.
  const handleUndo = () => reopenTask({ id, isCompleted: false }).then(reset, handleReopenFailed);

  const handleCompleted = () => {
    if (isSelected) navigate(listPath);
    onCompleted?.();
    toast(`Completed “${title}”`, {
      action: { label: <UndoLabel />, onClick: handleUndo },
      duration: UNDO_TOAST_DURATION,
    });
  };

  // A failed save shows through `error`, so the rejection needs no handling here.
  const completeTask = () => {
    playCompletionSound(preference?.completionSound);
    void updateTask({ id, isCompleted: true }).then(handleCompleted, () => undefined);
  };

  return { completeTask, isCompleting: isPending || isSuccess, isSelected, error };
};

export default useCompleteTask;

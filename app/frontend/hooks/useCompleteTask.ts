import { useNavigate } from "react-router";

import { useUpdateTask } from "@/hooks/reactQuery/useTasksApi";
import { useUserPreference } from "@/hooks/reactQuery/useUserPreferencesApi";
import useOpenTask from "@/hooks/useOpenTask";
import { playCompletionSound } from "@/utils/completionSound";

// Completes a task from its list row or its pane. A completed task leaves its list (the Inbox or an area), so its pane closes with it; a pane
// shown elsewhere (the Calendar's popover) closes through `onCompleted`.
// `isCompleting` stays true after the save, until the refreshed list drops the task. The chime plays with the click, as
// the checkbox ticks, since the row may be gone by the time the save's callbacks would run.
const useCompleteTask = (id: string, onCompleted?: () => void) => {
  const navigate = useNavigate();
  const { openTaskId, listPath } = useOpenTask();
  const isSelected = openTaskId === id;
  const { data: preference } = useUserPreference();
  const { mutate: updateTask, isPending, isSuccess, error } = useUpdateTask();

  const handleCompleted = () => {
    if (isSelected) navigate(listPath);
    onCompleted?.();
  };

  const completeTask = () => {
    playCompletionSound(preference?.completionSound);
    updateTask({ id, isCompleted: true }, { onSuccess: handleCompleted });
  };

  return { completeTask, isCompleting: isPending || isSuccess, isSelected, error };
};

export default useCompleteTask;

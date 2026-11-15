import { useMatch, useNavigate } from "react-router";

import { useUpdateTask } from "@/hooks/reactQuery/useTasksApi";
import routes from "@/routes";

// Completes a task from its list row or its pane. A completed task leaves the Inbox, so its pane closes with it.
// `isCompleting` stays true after the save, until the refreshed list drops the task.
const useCompleteTask = (id: string) => {
  const navigate = useNavigate();
  const isSelected = useMatch(routes.inbox.show)?.params.taskId === id;
  const { mutate: updateTask, isPending, isSuccess, error } = useUpdateTask();

  const handleCompleted = () => {
    if (isSelected) navigate(routes.inbox.index);
  };

  const completeTask = () => updateTask({ id, isCompleted: true }, { onSuccess: handleCompleted });

  return { completeTask, isCompleting: isPending || isSuccess, isSelected, error };
};

export default useCompleteTask;

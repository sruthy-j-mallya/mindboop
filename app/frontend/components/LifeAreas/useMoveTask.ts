import { useNavigate } from "react-router";
import { toast } from "sonner";

import type { ApiError } from "@/apis/axios";
import type { Task } from "@/apis/types";
import { useUpdateTask } from "@/hooks/reactQuery/useTasksApi";
import useOpenTask from "@/hooks/useOpenTask";

import type { DropTarget } from "./types";

// Moves a task dropped on an area (or the Inbox) there. It leaves the list it was in, so its pane closes if it's open.
const useMoveTask = () => {
  const navigate = useNavigate();
  const { openTaskId, listPath } = useOpenTask();
  const { mutate: updateTask } = useUpdateTask();

  const moveTask = ({ id, title, lifeAreaId }: Task, target: DropTarget) => {
    if (lifeAreaId === target.lifeAreaId) return;

    const handleMoved = () => {
      if (openTaskId === id) navigate(listPath);
      toast(`Moved “${title}” to ${target.name}`);
    };
    const handleError = (error: ApiError) => toast.error(error.message);

    updateTask({ id, lifeAreaId: target.lifeAreaId }, { onSuccess: handleMoved, onError: handleError });
  };

  return moveTask;
};

export default useMoveTask;

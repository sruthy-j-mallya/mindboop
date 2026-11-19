import { useNavigate } from "react-router";

import type { Task } from "@/apis/types";
import LifeAreaPicker from "@/components/commons/LifeAreaPicker";
import { useUpdateTask } from "@/hooks/reactQuery/useTasksApi";
import useOpenTask from "@/hooks/useOpenTask";
import { getTaskPath } from "@/utils";

type TaskLifeAreaPickerProps = { task: Task; isCompact?: boolean };

// Moves a task to another area of life (or the Inbox). A task open beside a list moves with it: its pane opens beside
// its new list.
const TaskLifeAreaPicker = ({ task, isCompact = false }: TaskLifeAreaPickerProps) => {
  const navigate = useNavigate();
  const { openTaskId } = useOpenTask();
  const { mutate: updateTask, error } = useUpdateTask();

  const handleSave = (lifeAreaId: string | null) => {
    const handleMoved = () => {
      if (openTaskId === task.id) navigate(getTaskPath(task.id, lifeAreaId));
    };

    updateTask({ id: task.id, lifeAreaId }, { onSuccess: handleMoved });
  };

  return (
    <div className="flex flex-col gap-1">
      <LifeAreaPicker isCompact={isCompact} lifeAreaId={task.lifeAreaId} onSave={handleSave} />
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default TaskLifeAreaPicker;

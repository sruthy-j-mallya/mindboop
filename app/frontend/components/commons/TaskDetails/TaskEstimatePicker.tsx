import { Hourglass } from "lucide-react";

import EstimatePicker from "@/components/commons/EstimatePicker";
import { Button } from "@/components/ui/button";
import { useUpdateTask } from "@/hooks/reactQuery/useTasksApi";
import { formatMinutes } from "@/utils";

import { DETAIL_BUTTON_CLASS_NAME } from "./constants";
import type { DetailPickerProps } from "./types";

// A task's estimate, or a quiet offer to add one.
const TaskEstimatePicker = ({ task }: DetailPickerProps) => {
  const { mutate: updateTask, error } = useUpdateTask();

  const handleSave = (estimatedMinutes: number | null) => updateTask({ id: task.id, estimatedMinutes });

  return (
    <div className="flex flex-col gap-1">
      <EstimatePicker estimatedMinutes={task.estimatedMinutes} onSave={handleSave}>
        <Button className={DETAIL_BUTTON_CLASS_NAME} size="sm" type="button" variant="ghost">
          <Hourglass />
          {task.estimatedMinutes ? formatMinutes(task.estimatedMinutes) : "Estimate"}
        </Button>
      </EstimatePicker>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default TaskEstimatePicker;

import { Hourglass } from "lucide-react";

import EstimatePicker from "@/components/commons/EstimatePicker";
import { Button } from "@/components/ui/button";
import { useUpdateTask } from "@/hooks/reactQuery/useTasksApi";
import { formatMinutes } from "@/utils";

import { DETAIL_BUTTON_CLASS_NAME } from "./constants";
import type { DetailPickerProps } from "./types";

// A task's estimate. Hidden while unset, unless it's being picked or couldn't be saved.
const TaskEstimatePicker = ({ task, isOpen, onOpenChange }: DetailPickerProps) => {
  const { mutate: updateTask, isPending, error } = useUpdateTask();

  const handleSave = (estimatedMinutes: number | null) => updateTask({ id: task.id, estimatedMinutes });

  if (!task.estimatedMinutes && !isOpen && !isPending && !error) return null;

  return (
    <div className="flex flex-col gap-1">
      <EstimatePicker
        estimatedMinutes={task.estimatedMinutes}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onSave={handleSave}
      >
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

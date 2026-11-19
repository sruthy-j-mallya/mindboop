import { Hourglass } from "lucide-react";

import type { Task } from "@/apis/types";
import EstimatePicker from "@/components/commons/EstimatePicker";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useUpdateTask } from "@/hooks/reactQuery/useTasksApi";
import { formatMinutes } from "@/utils";

type TaskEstimatePickerProps = {
  task: Task;
  // Just the hourglass until set, named by a tooltip, where room is tight (the Calendar's popover).
  isCompact?: boolean;
};

// A task's estimate button: the estimate once set, "Estimate" until then (or only its icon, when compact).
const TaskEstimatePicker = ({ task, isCompact = false }: TaskEstimatePickerProps) => {
  const { mutate: updateTask, error } = useUpdateTask();
  const isIconOnly = isCompact && !task.estimatedMinutes;

  const handleSave = (estimatedMinutes: number | null) => updateTask({ id: task.id, estimatedMinutes });

  const button = (
    <Button
      aria-label={isIconOnly ? "Estimate" : undefined}
      className="text-muted-foreground"
      size={isIconOnly ? "icon-sm" : "sm"}
      type="button"
      variant="ghost"
    >
      <Hourglass />
      {task.estimatedMinutes ? formatMinutes(task.estimatedMinutes) : !isIconOnly && "Estimate"}
    </Button>
  );

  return (
    <div className="flex flex-col gap-1">
      {isCompact ? (
        // The tooltip's trigger takes the picker's trigger props on to the button, so one button opens both.
        <TooltipProvider>
          <Tooltip>
            <EstimatePicker estimatedMinutes={task.estimatedMinutes} onSave={handleSave}>
              <TooltipTrigger asChild>{button}</TooltipTrigger>
            </EstimatePicker>
            <TooltipContent>Estimate</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <EstimatePicker estimatedMinutes={task.estimatedMinutes} onSave={handleSave}>
          {button}
        </EstimatePicker>
      )}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default TaskEstimatePicker;

import { Hourglass } from "lucide-react";

import type { Task } from "@/apis/types";
import CommonEstimatePicker from "@/components/commons/EstimatePicker";
import { Button } from "@/components/ui/button";
import { useUpdateTask } from "@/hooks/reactQuery/useTasksApi";
import { formatMinutes } from "@/utils";

type EstimatePickerProps = { task: Task };

// The pane's estimate button: the estimate once set, "Estimate" until then.
const EstimatePicker = ({ task }: EstimatePickerProps) => {
  const { mutate: updateTask, error } = useUpdateTask();

  const handleSave = (estimatedMinutes: number | null) => updateTask({ id: task.id, estimatedMinutes });

  return (
    <div className="flex flex-col gap-1">
      <CommonEstimatePicker estimatedMinutes={task.estimatedMinutes} onSave={handleSave}>
        <Button className="text-muted-foreground" size="sm" type="button" variant="ghost">
          <Hourglass />
          {task.estimatedMinutes ? formatMinutes(task.estimatedMinutes) : "Estimate"}
        </Button>
      </CommonEstimatePicker>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default EstimatePicker;

import ScheduleLabel from "@/components/commons/ScheduleLabel";
import SchedulePicker from "@/components/commons/SchedulePicker";
import type { SchedulePayload } from "@/components/commons/SchedulePicker/types";
import { Button } from "@/components/ui/button";
import { useUpdateTask } from "@/hooks/reactQuery/useTasksApi";

import { DETAIL_BUTTON_CLASS_NAME } from "./constants";
import type { DetailPickerProps } from "./types";

// A task's schedule. Hidden while unscheduled, unless it's being picked or couldn't be saved.
const DueDatePicker = ({ task, isOpen, onOpenChange }: DetailPickerProps) => {
  const { mutate: updateTask, isPending, error } = useUpdateTask();

  const handleSave = (schedule: SchedulePayload) => updateTask({ id: task.id, ...schedule });

  if (!task.startsAt && !isOpen && !isPending && !error) return null;

  return (
    <div className="flex flex-col gap-1">
      <SchedulePicker isOpen={isOpen} schedule={task} onOpenChange={onOpenChange} onSave={handleSave}>
        <Button className={DETAIL_BUTTON_CLASS_NAME} size="sm" type="button" variant="ghost">
          {task.startsAt ? <ScheduleLabel schedule={task} /> : "Due date"}
        </Button>
      </SchedulePicker>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default DueDatePicker;

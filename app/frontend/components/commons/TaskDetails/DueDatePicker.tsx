import { CalendarDays } from "lucide-react";

import ScheduleLabel from "@/components/commons/ScheduleLabel";
import SchedulePicker from "@/components/commons/SchedulePicker";
import type { SchedulePayload } from "@/components/commons/SchedulePicker/types";
import { Button } from "@/components/ui/button";
import { useUpdateTask } from "@/hooks/reactQuery/useTasksApi";

import { DETAIL_BUTTON_CLASS_NAME } from "./constants";
import type { DetailPickerProps } from "./types";

// A task's schedule, or a quiet offer to add one.
const DueDatePicker = ({ task }: DetailPickerProps) => {
  const { mutate: updateTask, error } = useUpdateTask();

  const handleSave = (schedule: SchedulePayload) => updateTask({ id: task.id, ...schedule });

  return (
    <div className="flex flex-col gap-1">
      <SchedulePicker schedule={task} onSave={handleSave}>
        <Button className={DETAIL_BUTTON_CLASS_NAME} size="sm" type="button" variant="ghost">
          {!task.startsAt && <CalendarDays />}
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

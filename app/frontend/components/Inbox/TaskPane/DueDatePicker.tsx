import { CalendarDays } from "lucide-react";

import type { Task } from "@/apis/types";
import ScheduleLabel from "@/components/commons/ScheduleLabel";
import SchedulePicker from "@/components/commons/SchedulePicker";
import type { SchedulePayload } from "@/components/commons/SchedulePicker/types";
import { Button } from "@/components/ui/button";
import { useUpdateTask } from "@/hooks/reactQuery/useTasksApi";

type DueDatePickerProps = { task: Task };

// The pane's schedule button: the date once set, "Due date" until then.
const DueDatePicker = ({ task }: DueDatePickerProps) => {
  const { mutate: updateTask, error } = useUpdateTask();

  const handleSave = (schedule: SchedulePayload) => updateTask({ id: task.id, ...schedule });

  return (
    <div className="flex flex-col gap-1">
      <SchedulePicker schedule={task} onSave={handleSave}>
        <Button className="text-muted-foreground" size="sm" type="button" variant="ghost">
          <CalendarDays />
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

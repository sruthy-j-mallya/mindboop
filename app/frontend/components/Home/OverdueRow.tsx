import type { Task } from "@/apis/types";
import ScheduleLabel from "@/components/commons/ScheduleLabel";
import { Button } from "@/components/ui/button";
import { useUpdateTask } from "@/hooks/reactQuery/useTasksApi";

import TaskRow from "./TaskRow";
import { getTodaySchedule } from "./utils";

type OverdueRowProps = { task: Task };

const OverdueRow = ({ task }: OverdueRowProps) => {
  const { mutate: updateTask, isPending, error } = useUpdateTask();

  const handleMoveToToday = () => updateTask({ id: task.id, ...getTodaySchedule(Date.now()) });

  return (
    <TaskRow error={error?.message} task={task}>
      <ScheduleLabel className="text-xs" schedule={task} />
      <Button
        aria-label={`Move ${task.title} to today`}
        disabled={isPending}
        size="sm"
        type="button"
        variant="ghost"
        onClick={handleMoveToToday}
      >
        Move to today
      </Button>
    </TaskRow>
  );
};

export default OverdueRow;

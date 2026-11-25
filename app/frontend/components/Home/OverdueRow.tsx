import { addDays } from "date-fns";
import { CalendarDays } from "lucide-react";

import type { Task } from "@/apis/types";
import ScheduleLabel from "@/components/commons/ScheduleLabel";
import SchedulePicker from "@/components/commons/SchedulePicker";
import { Button } from "@/components/ui/button";

import TaskRow from "./TaskRow";
import useRescheduleTask from "./useRescheduleTask";
import { getDaySchedule } from "./utils";

type OverdueRowProps = { task: Task };

const OverdueRow = ({ task }: OverdueRowProps) => {
  const { title } = task;
  const { rescheduleTask, isRescheduling, error } = useRescheduleTask(task);

  const handleMoveToToday = () => rescheduleTask(getDaySchedule(Date.now()));
  const handleMoveToTomorrow = () => rescheduleTask(getDaySchedule(addDays(Date.now(), 1)));

  return (
    <TaskRow error={error?.message} task={task}>
      <ScheduleLabel className="text-xs" schedule={task} />
      <div className="flex items-center">
        <Button
          aria-label={`Move ${title} to today`}
          disabled={isRescheduling}
          size="sm"
          title="Move to today"
          type="button"
          variant="ghost"
          onClick={handleMoveToToday}
        >
          Today
        </Button>
        <Button
          aria-label={`Move ${title} to tomorrow`}
          disabled={isRescheduling}
          size="sm"
          title="Move to tomorrow"
          type="button"
          variant="ghost"
          onClick={handleMoveToTomorrow}
        >
          Tomorrow
        </Button>
        <SchedulePicker align="end" clearLabel="Remove date" schedule={task} onSave={rescheduleTask}>
          <Button
            aria-label={`Pick a date for ${title}`}
            disabled={isRescheduling}
            size="icon-sm"
            title="Pick a date"
            type="button"
            variant="ghost"
          >
            <CalendarDays />
          </Button>
        </SchedulePicker>
      </div>
    </TaskRow>
  );
};

export default OverdueRow;

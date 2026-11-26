import { addDays } from "date-fns";
import { CalendarDays, Sun, Sunrise } from "lucide-react";

import type { Task } from "@/apis/types";
import ScheduleLabel from "@/components/commons/ScheduleLabel";
import SchedulePicker from "@/components/commons/SchedulePicker";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
      <TooltipProvider>
        <div className="flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label={`Move ${title} to today`}
                disabled={isRescheduling}
                size="icon-sm"
                type="button"
                variant="ghost"
                onClick={handleMoveToToday}
              >
                <Sun />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Move to today</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label={`Move ${title} to tomorrow`}
                disabled={isRescheduling}
                size="icon-sm"
                type="button"
                variant="ghost"
                onClick={handleMoveToTomorrow}
              >
                <Sunrise />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Move to tomorrow</TooltipContent>
          </Tooltip>
          <Tooltip>
            <SchedulePicker align="end" clearLabel="Remove date" schedule={task} onSave={rescheduleTask}>
              <TooltipTrigger asChild>
                <Button
                  aria-label={`Pick a date for ${title}`}
                  disabled={isRescheduling}
                  size="icon-sm"
                  type="button"
                  variant="ghost"
                >
                  <CalendarDays />
                </Button>
              </TooltipTrigger>
            </SchedulePicker>
            <TooltipContent>Pick a date</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </TaskRow>
  );
};

export default OverdueRow;

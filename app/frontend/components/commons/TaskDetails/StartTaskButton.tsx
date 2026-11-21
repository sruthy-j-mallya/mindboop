import { useState } from "react";

import { Play, Timer } from "lucide-react";
import { useNavigate } from "react-router";

import type { Task, TimeLog } from "@/apis/types";
import type { TimerLocationState } from "@/components/Timer/types";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCurrentTimeLog } from "@/hooks/reactQuery/useCurrentTimeLogsApi";
import routes from "@/routes";

import SwitchSessionDialog from "./SwitchSessionDialog";

type StartTaskButtonProps = {
  task: Task;
  // Just the icon, named by a tooltip, where room is tight (the Calendar's popover).
  isIconOnly?: boolean;
};

// Opens the Timer page with this task picked. With another task on the clock, it first asks how to wrap that one up;
// with this one on the clock, it just leads to it.
const StartTaskButton = ({ task, isIconOnly = false }: StartTaskButtonProps) => {
  const navigate = useNavigate();
  const { data: timeLog, isPending } = useCurrentTimeLog();
  // The session to switch from, kept while the dialog is open: ending it refetches the current time log as null, and
  // the dialog must stay mounted for its success callback to lead on to the Timer.
  const [switchingFrom, setSwitchingFrom] = useState<TimeLog | null>(null);
  const isOnTheClock = timeLog?.taskId === task.id;
  const label = isOnTheClock ? "On the clock" : "Start";

  const startTask = () => {
    const state: TimerLocationState = { taskId: task.id };
    navigate(routes.timer, { state });
  };

  const handleClick = () => {
    if (isOnTheClock) navigate(routes.timer);
    else if (timeLog) setSwitchingFrom(timeLog);
    else startTask();
  };

  const handleSwitchDialogClose = () => setSwitchingFrom(null);

  const button = (
    <Button
      aria-label={isIconOnly ? label : undefined}
      className="shrink-0"
      disabled={isPending}
      size={isIconOnly ? "icon-sm" : "sm"}
      type="button"
      onClick={handleClick}
    >
      {isOnTheClock ? <Timer /> : <Play />}
      {!isIconOnly && label}
    </Button>
  );

  return (
    <>
      {isIconOnly ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        button
      )}
      {switchingFrom && (
        <SwitchSessionDialog timeLog={switchingFrom} onClose={handleSwitchDialogClose} onSwitch={startTask} />
      )}
    </>
  );
};

export default StartTaskButton;

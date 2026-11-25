import { Play, Timer } from "lucide-react";

import type { Task } from "@/apis/types";
import SwitchSessionDialog from "@/components/commons/SwitchSessionDialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import useStartTask from "@/hooks/useStartTask";

type StartTaskButtonProps = { task: Task };

// Just an icon, named by a tooltip. Opens the Timer page with this task picked.
const StartTaskButton = ({ task }: StartTaskButtonProps) => {
  const { startTask, isLoadingSession, runningTaskId, switchDialogProps } = useStartTask();
  const isOnTheClock = runningTaskId === task.id;
  const label = isOnTheClock ? "On the clock" : "Start";

  const handleClick = () => startTask(task.id);

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label={label}
              className="shrink-0"
              disabled={isLoadingSession}
              size="icon-sm"
              type="button"
              onClick={handleClick}
            >
              {isOnTheClock ? <Timer /> : <Play />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {switchDialogProps && <SwitchSessionDialog {...switchDialogProps} />}
    </>
  );
};

export default StartTaskButton;

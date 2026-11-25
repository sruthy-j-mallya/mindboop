import { Play, Timer } from "lucide-react";

import type { Task } from "@/apis/types";
import SwitchSessionDialog from "@/components/commons/SwitchSessionDialog";
import { Button } from "@/components/ui/button";
import useStartTask from "@/hooks/useStartTask";

type StartTaskButtonProps = { task: Task };

// Opens the Timer page with this task picked.
const StartTaskButton = ({ task }: StartTaskButtonProps) => {
  const { startTask, isLoadingSession, runningTaskId, switchDialogProps } = useStartTask();
  const isOnTheClock = runningTaskId === task.id;
  const label = isOnTheClock ? "On the clock" : "Start";

  const handleClick = () => startTask(task.id);

  return (
    <>
      <Button className="shrink-0" disabled={isLoadingSession} size="sm" type="button" onClick={handleClick}>
        {isOnTheClock ? <Timer /> : <Play />}
        {label}
      </Button>
      {switchDialogProps && <SwitchSessionDialog {...switchDialogProps} />}
    </>
  );
};

export default StartTaskButton;

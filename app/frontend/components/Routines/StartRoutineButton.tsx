import { cn } from "cn";
import { Play, Timer } from "lucide-react";

import type { Routine } from "@/apis/types";
import { Button } from "@/components/ui/button";
import useStartRoutine from "@/hooks/useStartRoutine";

type StartRoutineButtonProps = {
  routine: Routine;
  // With the word beside the icon, where there's room (the pane's header).
  hasLabel?: boolean;
};

// Starts the routine's timer, or leads to it while it's on the clock.
const StartRoutineButton = ({ routine, hasLabel = false }: StartRoutineButtonProps) => {
  const { startRoutine, isStarting, runningRoutineId } = useStartRoutine();
  const isOnTheClock = runningRoutineId === routine.id;
  const label = isOnTheClock ? "On the clock" : "Start";

  const handleClick = () => startRoutine(routine);

  return (
    <Button
      aria-label={hasLabel ? undefined : `${label}: ${routine.title}`}
      className={cn("shrink-0", !hasLabel && "text-primary")}
      disabled={isStarting}
      size={hasLabel ? "sm" : "icon-sm"}
      title={hasLabel ? undefined : label}
      type="button"
      variant={hasLabel ? "default" : "ghost"}
      onClick={handleClick}
    >
      {isOnTheClock ? <Timer /> : <Play />}
      {hasLabel && label}
    </Button>
  );
};

export default StartRoutineButton;

import { Hourglass, Play, Timer } from "lucide-react";

import type { LifeArea } from "@/apis/types";
import LifeAreaBadge from "@/components/commons/LifeArea/Badge";
import ScheduleLabel from "@/components/commons/ScheduleLabel";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatMinutes } from "@/utils";

import TaskRow from "./TaskRow";
import type { StartableRowProps } from "./types";

type AgendaRowProps = StartableRowProps & { lifeArea?: LifeArea };

// A task of today's on one line: its area's badge, its title, its estimate and time, and a way to start it.
const AgendaRow = ({ task, lifeArea, isOnTheClock, isDisabled, onStart }: AgendaRowProps) => {
  const { id, title, estimatedMinutes } = task;
  const label = isOnTheClock ? "On the clock" : "Start";

  const handleStart = () => onStart(id);

  return (
    <TaskRow
      task={task}
      leading={
        lifeArea && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                {/* Focusable so keyboard users can read the area's name too. */}
                <span aria-label={lifeArea.name} className="mt-1 shrink-0 rounded" role="img" tabIndex={0}>
                  <LifeAreaBadge
                    className="size-5 rounded text-xs"
                    color={lifeArea.color}
                    emoji={lifeArea.emoji}
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent>{lifeArea.name}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      }
    >
      {!!estimatedMinutes && (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Hourglass aria-hidden className="size-3" />
          {formatMinutes(estimatedMinutes)}
        </span>
      )}
      <ScheduleLabel isDayHidden className="text-xs" schedule={task} />
      <Button
        aria-label={`${label}: ${title}`}
        className="text-primary"
        disabled={isDisabled}
        size="icon-sm"
        title={label}
        type="button"
        variant="ghost"
        onClick={handleStart}
      >
        {isOnTheClock ? <Timer /> : <Play />}
      </Button>
    </TaskRow>
  );
};

export default AgendaRow;

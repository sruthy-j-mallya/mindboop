import { Hourglass, Play, Timer } from "lucide-react";

import type { LifeArea } from "@/apis/types";
import LifeAreaBadge from "@/components/commons/LifeArea/Badge";
import ScheduleLabel from "@/components/commons/ScheduleLabel";
import { Button } from "@/components/ui/button";
import { formatMinutes } from "@/utils";

import TaskRow from "./TaskRow";
import type { StartableRowProps } from "./types";

type AgendaRowProps = StartableRowProps & { lifeArea?: LifeArea };

// A task of today's, with its area and estimate when it has them, and a way to start it.
const AgendaRow = ({ task, lifeArea, isOnTheClock, isDisabled, onStart }: AgendaRowProps) => {
  const { id, title, estimatedMinutes } = task;
  const label = isOnTheClock ? "On the clock" : "Start";
  const hasDetails = !!lifeArea || !!estimatedMinutes;

  const handleStart = () => onStart(id);

  return (
    <TaskRow
      task={task}
      details={
        hasDetails && (
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {lifeArea && (
              <span className="flex items-center gap-1">
                <LifeAreaBadge
                  className="size-4 rounded text-[0.625rem]"
                  color={lifeArea.color}
                  emoji={lifeArea.emoji}
                />
                {lifeArea.name}
              </span>
            )}
            {!!estimatedMinutes && (
              <span className="flex items-center gap-1">
                <Hourglass aria-hidden className="size-3" />
                {formatMinutes(estimatedMinutes)}
              </span>
            )}
          </p>
        )
      }
    >
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

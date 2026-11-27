import { Maximize2, Pause } from "lucide-react";
import { Link } from "react-router";

import type { TimeLog } from "@/apis/types";
import { Button } from "@/components/ui/button";
import useCurrentTime from "@/hooks/useCurrentTime";
import routes from "@/routes";
import { formatRemainingTime } from "@/utils";
import { getClockState } from "@/utils/timeLogs";

type MiniTimerProps = { timeLog: TimeLog };

// What's on the clock and its time, while the user is away from the Timer page, with a way back to it. It floats in a
// corner; on phones it spans the screen above the bottom bar, where the page keeps room for it (AppLayout).
const MiniTimer = ({ timeLog }: MiniTimerProps) => {
  const currentTime = useCurrentTime(timeLog.isRunning);
  const { seconds } = getClockState(timeLog, currentTime);
  const title = timeLog.taskTitle ?? timeLog.routineTitle;

  return (
    <section
      data-mini-timer
      aria-label="Current session"
      className="fixed right-4 bottom-4 z-40 flex items-center gap-3 rounded-full border bg-background py-1.5 pr-1.5 pl-4 shadow-lg max-md:bottom-[calc(var(--bottom-bar-height)+0.75rem)] max-md:left-4"
    >
      {title && <p className="min-w-0 truncate text-sm max-md:flex-1 md:max-w-48">{title}</p>}
      {timeLog.currentBreak && (
        <p className="flex shrink-0 items-center gap-1 text-sm text-muted-foreground">
          <Pause aria-hidden className="size-3.5" />
          Paused
        </p>
      )}
      <p className="shrink-0 text-lg font-medium tabular-nums" role="timer">
        {formatRemainingTime(seconds)}
      </p>
      <Button asChild className="rounded-full" size="icon-sm" variant="secondary">
        <Link aria-label="Back to timer" title="Back to timer" to={routes.timer}>
          <Maximize2 />
        </Link>
      </Button>
    </section>
  );
};

export default MiniTimer;

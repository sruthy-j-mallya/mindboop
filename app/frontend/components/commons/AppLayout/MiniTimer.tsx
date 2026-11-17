import { Maximize2 } from "lucide-react";
import { Link } from "react-router";

import type { TimeLog } from "@/apis/types";
import { Button } from "@/components/ui/button";
import useCurrentTime from "@/hooks/useCurrentTime";
import routes from "@/routes";
import { formatRemainingTime } from "@/utils";
import { getClockState } from "@/utils/timeLogs";

type MiniTimerProps = { timeLog: TimeLog };

// The session's clock, floating in a corner while the user is away from the Timer page, with a way back to it.
const MiniTimer = ({ timeLog }: MiniTimerProps) => {
  const currentTime = useCurrentTime(timeLog.isRunning);
  const { seconds } = getClockState(timeLog, currentTime);

  return (
    <section
      aria-label="Current session"
      className="fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full border bg-background py-1.5 pr-1.5 pl-4 shadow-lg"
    >
      <p className="text-lg font-medium tabular-nums" role="timer">
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

import type { TimeLog } from "@/apis/types";
import useCurrentTime from "@/hooks/useCurrentTime";
import { formatRemainingTime } from "@/utils";
import { getClockState } from "@/utils/timeLogs";

type RunningSessionProps = { timeLog: TimeLog };

// What's on the clock and its time. A component of its own, so the ticking re-renders nothing else.
const RunningSession = ({ timeLog }: RunningSessionProps) => {
  const { taskTitle, routineTitle, mode, currentBreak } = timeLog;
  const currentTime = useCurrentTime(timeLog.isRunning);
  const { seconds } = getClockState(timeLog, currentTime);
  const caption = mode === "stopwatch" ? "elapsed" : "left";

  return (
    <div className="grid gap-1">
      <p className="text-lg font-semibold wrap-anywhere">{taskTitle ?? routineTitle}</p>
      <p className="text-muted-foreground tabular-nums" role="timer">
        {formatRemainingTime(seconds)} {currentBreak ? `${caption}, paused` : caption}
      </p>
    </div>
  );
};

export default RunningSession;

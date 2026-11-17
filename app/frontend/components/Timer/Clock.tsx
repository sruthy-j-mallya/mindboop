import type { TimeLog } from "@/apis/types";
import useCurrentTime from "@/hooks/useCurrentTime";
import { formatRemainingTime, getRemainingSeconds } from "@/utils";
import { getClockState } from "@/utils/timeLogs";

import Dial from "./Dial";

type ClockProps = { timeLog: TimeLog };

const Clock = ({ timeLog }: ClockProps) => {
  const { isRunning, currentBreak, mode } = timeLog;
  const currentTime = useCurrentTime(isRunning || !!currentBreak);
  const { seconds, fill } = getClockState(timeLog, currentTime);
  const breakRemainingSeconds = currentBreak && getRemainingSeconds(currentBreak.endsAt, currentTime);

  const getCaption = () => {
    if (breakRemainingSeconds === null) return mode === "stopwatch" ? "elapsed" : "remaining";

    return breakRemainingSeconds > 0
      ? `back in ${formatRemainingTime(breakRemainingSeconds)}`
      : "break's over";
  };

  return (
    <Dial fill={fill}>
      <p className="text-6xl font-medium tabular-nums" role="timer">
        {formatRemainingTime(seconds)}
      </p>
      <p className="text-muted-foreground">{getCaption()}</p>
    </Dial>
  );
};

export default Clock;

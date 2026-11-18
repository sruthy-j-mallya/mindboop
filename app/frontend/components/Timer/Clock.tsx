import type { TimeLog } from "@/apis/types";
import { formatRemainingTime, getRemainingSeconds } from "@/utils";
import { getClockState, getOverrunSeconds } from "@/utils/timeLogs";

import Dial from "./Dial";
import OverrunToggle from "./OverrunToggle";

type ClockProps = {
  timeLog: TimeLog;
  currentTime: number;
  isOverrunIncluded: boolean;
  onOverrunToggle: () => void;
};

// A timer stays at zero once its time is up, with the time past it counting up underneath.
const Clock = ({ timeLog, currentTime, isOverrunIncluded, onOverrunToggle }: ClockProps) => {
  const { currentBreak, mode } = timeLog;
  const { seconds, fill } = getClockState(timeLog, currentTime);
  const overrunSeconds = getOverrunSeconds(timeLog, currentTime);
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
      {overrunSeconds > 0 && !currentBreak ? (
        <OverrunToggle isIncluded={isOverrunIncluded} seconds={overrunSeconds} onToggle={onOverrunToggle} />
      ) : (
        <p className="text-muted-foreground">{getCaption()}</p>
      )}
    </Dial>
  );
};

export default Clock;

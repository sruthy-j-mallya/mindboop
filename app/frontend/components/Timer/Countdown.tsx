import type { TimeLog } from "@/apis/types";
import useCurrentTime from "@/hooks/useCurrentTime";
import { getBreakRemainingSeconds } from "@/utils";

import { formatRemainingTime, getTimerState } from "./utils";

type CountdownProps = { timeLog: TimeLog };

const Countdown = ({ timeLog }: CountdownProps) => {
  const { isRunning, currentBreak } = timeLog;
  const currentTime = useCurrentTime(isRunning || !!currentBreak);
  const { remainingSeconds, progress } = getTimerState(timeLog, currentTime);
  const breakRemainingSeconds = currentBreak && getBreakRemainingSeconds(currentBreak.endsAt, currentTime);

  const getCaption = () => {
    if (breakRemainingSeconds === null) return "remaining";

    return breakRemainingSeconds > 0
      ? `back in ${formatRemainingTime(breakRemainingSeconds)}`
      : "break's over";
  };

  return (
    <div className="relative mx-auto aspect-square w-full max-w-xs">
      <svg aria-hidden="true" className="size-full -rotate-90 fill-none" viewBox="0 0 100 100">
        <circle className="stroke-secondary/40" cx="50" cy="50" r="49.5" strokeWidth="0.5" />
        <circle className="stroke-border" cx="50" cy="50" r="46" strokeWidth="2.5" />
        <circle
          className="stroke-primary transition-[stroke-dasharray] duration-1000 ease-linear"
          cx="50"
          cy="50"
          pathLength={1}
          r="46"
          strokeDasharray={`${progress} 1`}
          strokeLinecap="round"
          strokeWidth="2.5"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <p className="text-6xl font-medium tabular-nums" role="timer">
          {formatRemainingTime(remainingSeconds)}
        </p>
        <p className="text-muted-foreground">{getCaption()}</p>
      </div>
    </div>
  );
};

export default Countdown;

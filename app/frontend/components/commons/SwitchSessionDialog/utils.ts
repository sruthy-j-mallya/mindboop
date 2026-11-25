import type { TimeLog } from "@/apis/types";
import { formatRemainingTime } from "@/utils";
import { getClockState } from "@/utils/timeLogs";

// "Timer · 12:30 left", "Stopwatch · 04:10 elapsed", or "Timer · paused" while on a break.
export const describeSession = (timeLog: TimeLog, currentTime: number) => {
  const modeLabel = timeLog.mode === "stopwatch" ? "Stopwatch" : "Timer";
  if (timeLog.currentBreak) return `${modeLabel} · paused`;

  const { seconds } = getClockState(timeLog, currentTime);
  const caption = timeLog.mode === "stopwatch" ? "elapsed" : "left";

  return `${modeLabel} · ${formatRemainingTime(seconds)} ${caption}`;
};

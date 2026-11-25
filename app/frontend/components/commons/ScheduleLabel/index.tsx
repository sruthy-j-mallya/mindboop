import { cn } from "cn";

import useCurrentTime from "@/hooks/useCurrentTime";

import { SCHEDULE_REFRESH_INTERVAL, SCHEDULE_TONE_CLASS_NAMES } from "./constants";
import type { Schedule } from "./types";
import { formatSchedule, formatTodaySchedule, getScheduleTone } from "./utils";

type ScheduleLabelProps = {
  schedule: Schedule;
  // For a list of today's tasks, where the day would only repeat itself.
  isDayHidden?: boolean;
  className?: string;
};

// The task's date or duration in words, red once overdue and highlighted for today. Renders nothing when unscheduled.
const ScheduleLabel = ({ schedule, isDayHidden = false, className }: ScheduleLabelProps) => {
  const now = useCurrentTime(!!schedule.startsAt, SCHEDULE_REFRESH_INTERVAL);
  const label = (isDayHidden ? formatTodaySchedule : formatSchedule)(schedule, now);

  if (!label) return null;

  return (
    <span className={cn(SCHEDULE_TONE_CLASS_NAMES[getScheduleTone(schedule, now)], className)}>{label}</span>
  );
};

export default ScheduleLabel;

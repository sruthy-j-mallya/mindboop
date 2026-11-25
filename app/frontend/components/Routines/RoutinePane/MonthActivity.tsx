import { useState } from "react";

import { addMonths, format, isSameMonth, startOfMonth } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { Routine } from "@/apis/types";
import { toAreaColorStyle } from "@/components/commons/LifeArea/utils";
import { Button } from "@/components/ui/button";
import { useRoutineTimeLogs } from "@/hooks/reactQuery/useRoutineTimeLogsApi";
import useWeekStartsOn from "@/hooks/useWeekStartsOn";

import { getMinutesByDay, getWeekdays } from "../utils";
import DayCell from "./DayCell";
import LogTimeDialog from "./LogTimeDialog";
import { describeDaysDone, getMonthDays, getMonthRange } from "./utils";

type MonthActivityProps = { routine: Pick<Routine, "id" | "title" | "color" | "durationMinutes"> };

// A month of days, the ones the routine was done on filled in its colour. The rest stay plain: a day without it isn't a
// mark against anyone. Picking a day up to today logs time on it by hand.
const MonthActivity = ({ routine }: MonthActivityProps) => {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [loggingDate, setLoggingDate] = useState<Date | null>(null);
  const weekStartsOn = useWeekStartsOn();
  const now = new Date();
  const { from, to } = getMonthRange(month, weekStartsOn);
  const { data: timeLogs = [], error } = useRoutineTimeLogs({
    routineId: routine.id,
    from: from.toISOString(),
    to: to.toISOString(),
  });
  const days = getMonthDays(month, getMinutesByDay(timeLogs), now, weekStartsOn);
  const daysDone = days.filter(({ isInMonth, minutes }) => isInMonth && minutes > 0).length;
  const isCurrentMonth = isSameMonth(month, now);

  const handlePrevious = () => setMonth((shown) => addMonths(shown, -1));
  const handleNext = () => setMonth((shown) => addMonths(shown, 1));
  const handleLogTimeClose = () => setLoggingDate(null);

  return (
    <section
      aria-label="Days done"
      className="grid gap-3 rounded-xl bg-muted/50 p-4"
      style={toAreaColorStyle(routine.color)}
    >
      <header className="flex items-center justify-between gap-2">
        <div className="grid">
          <h2 className="text-base font-medium">{format(month, "MMMM yyyy")}</h2>
          <p className="text-xs text-muted-foreground">{describeDaysDone(daysDone)}</p>
        </div>
        <div className="flex gap-1">
          <Button
            aria-label="Previous month"
            size="icon-sm"
            type="button"
            variant="ghost"
            onClick={handlePrevious}
          >
            <ChevronLeft />
          </Button>
          <Button
            aria-label="Next month"
            disabled={isCurrentMonth}
            size="icon-sm"
            type="button"
            variant="ghost"
            onClick={handleNext}
          >
            <ChevronRight />
          </Button>
        </div>
      </header>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error.message}
        </p>
      )}
      <div className="grid grid-cols-7 gap-y-1.5 text-center text-sm">
        {getWeekdays(weekStartsOn).map(({ value, label }) => (
          <span key={value} className="text-xs text-muted-foreground">
            {label.slice(0, 3)}
          </span>
        ))}
        {days.map((day) => (
          <DayCell key={day.key} day={day} onSelect={setLoggingDate} />
        ))}
      </div>
      {loggingDate && <LogTimeDialog date={loggingDate} routine={routine} onClose={handleLogTimeClose} />}
    </section>
  );
};

export default MonthActivity;

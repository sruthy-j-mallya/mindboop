import { useState } from "react";

import { cn } from "cn";
import { addMonths, format, isSameMonth, startOfMonth } from "date-fns";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

import type { Routine } from "@/apis/types";
import { toAreaColorStyle } from "@/components/commons/LifeArea/utils";
import { Button } from "@/components/ui/button";
import { useRoutineTimeLogs } from "@/hooks/reactQuery/useRoutineTimeLogsApi";

import { WEEKDAYS } from "../constants";
import { getMinutesByDay } from "../utils";
import { describeDay, describeDaysDone, getMonthDays, getMonthRange } from "./utils";

type MonthActivityProps = { routine: Pick<Routine, "id" | "color"> };

// A month of days, the ones the routine was done on filled in its colour. The rest stay plain: a day without it isn't a
// mark against anyone.
const MonthActivity = ({ routine }: MonthActivityProps) => {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const now = new Date();
  const { from, to } = getMonthRange(month);
  const { data: timeLogs = [], error } = useRoutineTimeLogs({
    routineId: routine.id,
    from: from.toISOString(),
    to: to.toISOString(),
  });
  const days = getMonthDays(month, getMinutesByDay(timeLogs), now);
  const daysDone = days.filter(({ isInMonth, minutes }) => isInMonth && minutes > 0).length;
  const isCurrentMonth = isSameMonth(month, now);

  const handlePrevious = () => setMonth((shown) => addMonths(shown, -1));
  const handleNext = () => setMonth((shown) => addMonths(shown, 1));

  return (
    <section
      aria-label="Days done"
      className="grid gap-4 rounded-2xl bg-muted/50 p-4"
      style={toAreaColorStyle(routine.color)}
    >
      <header className="flex items-center justify-between gap-2">
        <div className="grid">
          <h2 className="font-medium">{format(month, "MMMM yyyy")}</h2>
          <p className="text-sm text-muted-foreground">{describeDaysDone(daysDone)}</p>
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
      <div className="grid grid-cols-7 gap-y-2 text-center text-sm">
        {WEEKDAYS.map(({ value, label }) => (
          <span key={value} className="text-xs text-muted-foreground">
            {label.slice(0, 3)}
          </span>
        ))}
        {days.map(({ key, date, minutes, isInMonth, isToday, isFuture }) => {
          const isDone = minutes > 0;
          const label = describeDay(date, minutes);

          return (
            <div
              key={key}
              aria-label={label}
              className={cn("flex flex-col items-center gap-1", (!isInMonth || isFuture) && "opacity-40")}
              role="img"
              title={label}
            >
              <span className={cn("text-xs", isToday && "font-semibold text-primary")}>
                {format(date, "d")}
              </span>
              <span
                className={cn(
                  "flex size-8 items-center justify-center",
                  isDone ? "bg-(--area-color) text-white" : "bg-muted",
                )}
              >
                {isDone && <Check className="size-4" />}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default MonthActivity;

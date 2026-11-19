import { cn } from "cn";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isThisMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import { WEEK_OPTIONS } from "../constants";
import type { DayCounts } from "./types";
import { getDayLabel, toDayKey, toMonthKey } from "./utils";

type MonthGridProps = { month: Date; counts: Map<string, DayCounts>; onSelectDay: (day: Date) => void };

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

// One month of the year view. A day with tasks gets a solid dot and one with logged time a faded one; picking a day
// opens it in the day view.
const MonthGrid = ({ month, counts, onSelectDay }: MonthGridProps) => {
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), WEEK_OPTIONS),
    end: endOfWeek(endOfMonth(month), WEEK_OPTIONS),
  });

  return (
    <section
      aria-label={format(month, "MMMM yyyy")}
      className="flex flex-col gap-2"
      data-current-month={isThisMonth(month) || undefined}
      data-month={toMonthKey(month)}
    >
      <h4 className="px-1 text-sm font-semibold">{format(month, "MMMM")}</h4>
      <div className="grid grid-cols-7 gap-0.5 text-center text-xs">
        {WEEKDAYS.map((weekday, index) => (
          <span key={index} aria-hidden className="py-1 text-muted-foreground">
            {weekday}
          </span>
        ))}
        {days.map((day) => {
          const dayCounts = counts.get(toDayKey(day));
          const isInMonth = isSameMonth(day, month);

          if (!isInMonth) return <span key={day.toISOString()} aria-hidden />;

          return (
            <button
              key={day.toISOString()}
              aria-label={getDayLabel(day, dayCounts)}
              type="button"
              className={cn(
                "flex h-8 flex-col items-center justify-center gap-0.5 rounded-md hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                isToday(day) && "bg-primary font-semibold text-primary-foreground hover:bg-primary/90",
              )}
              onClick={() => onSelectDay(day)}
            >
              {format(day, "d")}
              <span aria-hidden className="flex h-1 gap-0.5">
                {!!dayCounts?.tasks && <span className="size-1 rounded-full bg-current" />}
                {!!dayCounts?.timeLogs && <span className="size-1 rounded-full bg-current opacity-40" />}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default MonthGrid;

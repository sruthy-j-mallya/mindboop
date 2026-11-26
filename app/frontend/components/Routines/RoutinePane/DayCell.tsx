import { cn } from "cn";
import { format } from "date-fns";
import { Check } from "lucide-react";

import type { MonthDay } from "./types";
import { describeDay } from "./utils";

type DayCellProps = { day: MonthDay; onSelect: (date: Date) => void };

// A day of the month grid. Picking one logs time on it, so a day still to come can't be picked.
const DayCell = ({ day, onSelect }: DayCellProps) => {
  const { date, minutes, isInMonth, isToday, isFuture } = day;
  const isDone = minutes > 0;
  const label = describeDay(date, minutes);

  const handleClick = () => onSelect(date);

  return (
    <button
      aria-label={isFuture ? label : `Log time on ${label}`}
      className={cn(
        "group flex flex-col items-center gap-0.5 justify-self-center rounded-md px-1 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        !isFuture && "cursor-pointer",
        (!isInMonth || isFuture) && "opacity-40",
      )}
      disabled={isFuture}
      title={label}
      type="button"
      onClick={handleClick}
    >
      <span className={cn("text-xs", isToday && "font-semibold text-primary")}>{format(date, "d")}</span>
      <span
        className={cn(
          "flex size-7 items-center justify-center rounded-full transition-shadow group-enabled:group-hover:ring-2 group-enabled:group-hover:ring-(--area-color)",
          isDone ? "bg-(--area-color) text-white" : "border border-input",
          isToday && "outline-2 outline-offset-2 outline-ring",
        )}
      >
        {isDone && <Check className="size-3.5" />}
      </span>
    </button>
  );
};

export default DayCell;

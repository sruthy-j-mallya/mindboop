import { isSameDay, startOfDay } from "date-fns";

import { Button } from "@/components/ui/button";
import { PICKED_CLASS_NAME } from "@/constants";
import useCurrentTime from "@/hooks/useCurrentTime";
import useWeekStartsOn from "@/hooks/useWeekStartsOn";

import { getQuickDays } from "./utils";

type QuickDaysProps = { value: Date; onPick: (day: Date) => void };

// The days picked most, without looking for them in the calendar.
const QuickDays = ({ value, onPick }: QuickDaysProps) => {
  const now = useCurrentTime(false);
  const weekStartsOn = useWeekStartsOn();

  return (
    <div aria-label="Quick dates" className="grid grid-cols-3 gap-1" role="group">
      {getQuickDays(startOfDay(now), weekStartsOn).map(({ label, day }) => {
        const isPicked = isSameDay(day, value);

        return (
          <Button
            key={label}
            aria-pressed={isPicked}
            className={isPicked ? PICKED_CLASS_NAME : undefined}
            size="xs"
            type="button"
            variant="ghost"
            onClick={() => onPick(day)}
          >
            {label}
          </Button>
        );
      })}
    </div>
  );
};

export default QuickDays;

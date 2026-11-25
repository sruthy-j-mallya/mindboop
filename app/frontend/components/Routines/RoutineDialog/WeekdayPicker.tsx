import { cn } from "cn";

import { PICKED_CLASS_NAME } from "@/constants";
import useWeekStartsOn from "@/hooks/useWeekStartsOn";

import { getWeekdays } from "../utils";

type WeekdayPickerProps = {
  value: number[];
  // One day for a weekly reminder, any number for a custom one.
  isMultiple: boolean;
  onChange: (days: number[]) => void;
};

// A row of round day buttons, in the order of the week picked in Settings.
const WeekdayPicker = ({ value, isMultiple, onChange }: WeekdayPickerProps) => {
  const weekStartsOn = useWeekStartsOn();

  const handleToggle = (day: number) => {
    if (!isMultiple) onChange([day]);
    else onChange(value.includes(day) ? value.filter((picked) => picked !== day) : [...value, day]);
  };

  return (
    <div className="flex gap-1.5">
      {getWeekdays(weekStartsOn).map(({ value: day, short, label }) => {
        const isPicked = value.includes(day);

        return (
          <button
            key={day}
            aria-label={label}
            aria-pressed={isPicked}
            className={cn(
              "flex size-9 items-center justify-center rounded-full text-sm font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
              isPicked ? PICKED_CLASS_NAME : "bg-muted hover:bg-accent",
            )}
            title={label}
            type="button"
            onClick={() => handleToggle(day)}
          >
            {short}
          </button>
        );
      })}
    </div>
  );
};

export default WeekdayPicker;

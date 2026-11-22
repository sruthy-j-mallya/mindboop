import { cn } from "cn";

import { WEEKDAYS } from "../constants";

type WeekdayPickerProps = {
  value: number[];
  // One day for a weekly reminder, any number for a custom one.
  isMultiple: boolean;
  onChange: (days: number[]) => void;
};

// A row of round day buttons, Monday first.
const WeekdayPicker = ({ value, isMultiple, onChange }: WeekdayPickerProps) => {
  const handleToggle = (day: number) => {
    if (!isMultiple) onChange([day]);
    else onChange(value.includes(day) ? value.filter((picked) => picked !== day) : [...value, day]);
  };

  return (
    <div className="flex gap-1.5">
      {WEEKDAYS.map(({ value: day, short, label }) => {
        const isPicked = value.includes(day);

        return (
          <button
            key={day}
            aria-label={label}
            aria-pressed={isPicked}
            className={cn(
              "flex size-9 items-center justify-center text-sm font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
              isPicked ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-accent",
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

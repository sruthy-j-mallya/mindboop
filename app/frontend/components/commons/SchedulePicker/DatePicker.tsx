import { useState } from "react";

import { cn } from "cn";
import { format, isSameYear } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import useWeekStartsOn from "@/hooks/useWeekStartsOn";

import {
  CALENDAR_CLASS_NAME,
  CALENDAR_CLASS_NAMES,
  DATE_LABEL_FORMAT,
  OTHER_YEAR_DATE_LABEL_FORMAT,
} from "./constants";

type DatePickerProps = {
  label: string;
  value: Date;
  className?: string;
  onChange: (day: Date) => void;
};

// A date field that opens the same calendar as the Date tab. Picking a day closes it.
const DatePicker = ({ label, value, className, onChange }: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [month, setMonth] = useState(value);
  const weekStartsOn = useWeekStartsOn();

  const handleOpenChange = (isOpening: boolean) => {
    if (isOpening) setMonth(value);
    setIsOpen(isOpening);
  };

  const handleSelectDay = (day: Date) => {
    onChange(day);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          aria-label={label}
          className={cn(
            "h-auto justify-start px-0 font-normal whitespace-nowrap underline-offset-4 hover:bg-transparent hover:underline has-[>svg]:px-0 dark:hover:bg-transparent",
            className,
          )}
          type="button"
          variant="ghost"
        >
          {format(value, isSameYear(value, new Date()) ? DATE_LABEL_FORMAT : OTHER_YEAR_DATE_LABEL_FORMAT)}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-3">
        <Calendar
          required
          className={CALENDAR_CLASS_NAME}
          classNames={CALENDAR_CLASS_NAMES}
          mode="single"
          month={month}
          selected={value}
          weekStartsOn={weekStartsOn}
          onMonthChange={setMonth}
          onSelect={handleSelectDay}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;

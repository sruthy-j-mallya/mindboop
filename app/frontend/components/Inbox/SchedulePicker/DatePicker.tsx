import { useState } from "react";

import { cn } from "cn";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { DATE_LABEL_FORMAT } from "./constants";

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
          className={cn("min-w-0 shrink justify-start bg-input-background px-3 font-normal", className)}
          type="button"
          variant="outline"
        >
          <span className="truncate">{format(value, DATE_LABEL_FORMAT)}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-3">
        <Calendar
          required
          className="p-0 [--cell-size:--spacing(9)]"
          mode="single"
          month={month}
          selected={value}
          weekStartsOn={1}
          onMonthChange={setMonth}
          onSelect={handleSelectDay}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;

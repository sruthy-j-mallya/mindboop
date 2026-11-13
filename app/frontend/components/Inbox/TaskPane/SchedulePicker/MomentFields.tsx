import type { ChangeEvent } from "react";

import { Input } from "@/components/ui/input";

import { parseDateInputValue, toDateInputValue, toTimeInputValue } from "./utils";

type MomentFieldsProps = {
  label: string;
  value: Date;
  hasTime: boolean;
  onDayChange: (day: Date) => void;
  onTimeChange: (time: string) => void;
};

// A labelled date input, plus a time input unless the duration is all day. Cleared or half-typed values are ignored.
const MomentFields = ({ label, value, hasTime, onDayChange, onTimeChange }: MomentFieldsProps) => {
  const handleDayChange = (event: ChangeEvent<HTMLInputElement>) => {
    const day = parseDateInputValue(event.target.value);
    if (day) onDayChange(day);
  };

  const handleTimeChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.value) onTimeChange(event.target.value);
  };

  return (
    <div className="grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-2 text-sm">
      <span>{label}</span>
      <Input
        aria-label={`${label} date`}
        className={hasTime ? undefined : "col-span-2"}
        type="date"
        value={toDateInputValue(value)}
        onChange={handleDayChange}
      />
      {hasTime && (
        <Input
          aria-label={`${label} time`}
          className="w-28"
          type="time"
          value={toTimeInputValue(value)}
          onChange={handleTimeChange}
        />
      )}
    </div>
  );
};

export default MomentFields;

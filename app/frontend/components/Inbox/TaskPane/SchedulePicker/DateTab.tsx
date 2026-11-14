import { useState } from "react";

import { Clock, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

import TimePicker from "./TimePicker";
import type { ScheduleDraft } from "./types";
import { moveStart, setDateTime, toTimeInputValue, withDay } from "./utils";

type DateTabProps = { draft: ScheduleDraft; onChange: (draft: ScheduleDraft) => void };

// A single day, with an optional time. Without a time the task is due all day.
const DateTab = ({ draft, onChange }: DateTabProps) => {
  const [month, setMonth] = useState(draft.startsAt);

  // Picking an outside day (from the next or last month) turns the calendar to that month.
  const handleSelectDay = (day: Date) => {
    onChange(moveStart(draft, withDay(draft.startsAt, day)));
    setMonth(day);
  };

  const handleTimeChange = (time: string) => onChange(setDateTime(draft, time));

  const handleRemoveTime = () => onChange(setDateTime(draft, ""));

  return (
    // Sized to the calendar, so the time row lines up with its first and last columns.
    <div className="mx-auto flex w-fit flex-col gap-3">
      <Calendar
        required
        className="p-0 [--cell-size:--spacing(9)]"
        mode="single"
        month={month}
        selected={draft.startsAt}
        weekStartsOn={1}
        onMonthChange={setMonth}
        onSelect={handleSelectDay}
      />
      <div className="flex items-center gap-2 pl-2 text-sm">
        <Clock className="size-4 text-muted-foreground" />
        <span className="flex-1">Time</span>
        <TimePicker
          isClearable
          label="Time"
          placeholder="Add time"
          value={draft.isAllDay ? "" : toTimeInputValue(draft.startsAt)}
          onChange={handleTimeChange}
        />
        {/* Hidden rather than removed while there's no time, so the row keeps its width. */}
        <Button
          aria-label="Remove time"
          className={draft.isAllDay ? "invisible" : undefined}
          size="icon-sm"
          type="button"
          variant="ghost"
          onClick={handleRemoveTime}
        >
          <X />
        </Button>
      </div>
    </div>
  );
};

export default DateTab;

import { type ChangeEvent, useState } from "react";

import { Clock, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";

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

  const handleTimeChange = (event: ChangeEvent<HTMLInputElement>) =>
    onChange(setDateTime(draft, event.target.value));

  const handleRemoveTime = () => onChange(setDateTime(draft, ""));

  return (
    <div className="flex flex-col gap-3">
      <Calendar
        required
        className="mx-auto p-0 [--cell-size:--spacing(9)]"
        mode="single"
        month={month}
        selected={draft.startsAt}
        weekStartsOn={1}
        onMonthChange={setMonth}
        onSelect={handleSelectDay}
      />
      <div className="flex items-center gap-3 text-sm">
        <Clock className="size-4 text-muted-foreground" />
        <span className="flex-1">Time</span>
        <Input
          aria-label="Time"
          className="w-32"
          type="time"
          value={draft.isAllDay ? "" : toTimeInputValue(draft.startsAt)}
          onChange={handleTimeChange}
        />
        {!draft.isAllDay && (
          <Button
            aria-label="Remove time"
            size="icon-sm"
            type="button"
            variant="ghost"
            onClick={handleRemoveTime}
          >
            <X />
          </Button>
        )}
      </div>
    </div>
  );
};

export default DateTab;

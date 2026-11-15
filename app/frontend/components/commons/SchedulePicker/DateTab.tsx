import { useState } from "react";

import { Calendar } from "@/components/ui/calendar";

import { CALENDAR_CLASS_NAME, CALENDAR_CLASS_NAMES } from "./constants";
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

  return (
    // Sized to the calendar, so the time row spans it.
    <div className="mx-auto flex w-fit flex-col gap-2">
      <Calendar
        required
        className={CALENDAR_CLASS_NAME}
        classNames={CALENDAR_CLASS_NAMES}
        mode="single"
        month={month}
        selected={draft.startsAt}
        weekStartsOn={1}
        onMonthChange={setMonth}
        onSelect={handleSelectDay}
      />
      <TimePicker
        isClearable
        label="Time"
        placeholder="Time"
        value={draft.isAllDay ? "" : toTimeInputValue(draft.startsAt)}
        variant="row"
        onChange={handleTimeChange}
      />
    </div>
  );
};

export default DateTab;

import { useState } from "react";

import { startOfDay } from "date-fns";

import { Calendar } from "@/components/ui/calendar";
import useWeekStartsOn from "@/hooks/useWeekStartsOn";

import { CALENDAR_CLASS_NAME, CALENDAR_CLASS_NAMES } from "./constants";
import QuickDays from "./QuickDays";
import TimePicker from "./TimePicker";
import type { ScheduleDraft } from "./types";
import { getMinStartTime, moveStart, setDateTime, toTimeInputValue, withDay } from "./utils";

type DateTabProps = { draft: ScheduleDraft; now: number; onChange: (draft: ScheduleDraft) => void };

// A single day, with an optional time. Without a time the task is due all day. Past days and times can't be picked.
const DateTab = ({ draft, now, onChange }: DateTabProps) => {
  const [month, setMonth] = useState(draft.startsAt);
  const weekStartsOn = useWeekStartsOn();

  // Picking an outside day (from the next or last month) turns the calendar to that month.
  const handleSelectDay = (day: Date) => {
    onChange(moveStart(draft, withDay(draft.startsAt, day)));
    setMonth(day);
  };

  const handleTimeChange = (time: string) => onChange(setDateTime(draft, time));

  return (
    // Sized to the calendar, so the time row spans it.
    <div className="mx-auto flex w-fit flex-col gap-2">
      <QuickDays value={draft.startsAt} onPick={handleSelectDay} />
      <Calendar
        required
        className={CALENDAR_CLASS_NAME}
        classNames={CALENDAR_CLASS_NAMES}
        disabled={{ before: startOfDay(now) }}
        mode="single"
        month={month}
        selected={draft.startsAt}
        weekStartsOn={weekStartsOn}
        onMonthChange={setMonth}
        onSelect={handleSelectDay}
      />
      <TimePicker
        isClearable
        label="Time"
        minTime={getMinStartTime(draft.startsAt, now)}
        placeholder="Time"
        value={draft.isAllDay ? "" : toTimeInputValue(draft.startsAt)}
        variant="row"
        onChange={handleTimeChange}
      />
    </div>
  );
};

export default DateTab;

import { useId } from "react";

import { startOfDay } from "date-fns";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import MomentFields from "./MomentFields";
import type { ScheduleDraft } from "./types";
import { getMinStartTime, moveStart, setAllDay, withDay, withTime } from "./utils";

type DurationTabProps = {
  draft: ScheduleDraft;
  now: number;
  onChange: (draft: ScheduleDraft) => void;
};

// A start and an end, as days (all day) or times. Moving the start moves the end with it. The start can't be picked in
// the past, nor the end before the start's day.
const DurationTab = ({ draft, now, onChange }: DurationTabProps) => {
  const allDayId = useId();
  const hasTime = !draft.isAllDay;

  const handleStartDayChange = (day: Date) => onChange(moveStart(draft, withDay(draft.startsAt, day)));

  const handleStartTimeChange = (time: string) => onChange(moveStart(draft, withTime(draft.startsAt, time)));

  const handleEndDayChange = (day: Date) => onChange({ ...draft, endsAt: withDay(draft.endsAt, day) });

  const handleEndTimeChange = (time: string) => onChange({ ...draft, endsAt: withTime(draft.endsAt, time) });

  const handleAllDayChange = (isAllDay: boolean) => onChange(setAllDay(draft, isAllDay, now));

  return (
    <div className="flex flex-col gap-2 pt-1">
      <MomentFields
        fromDay={startOfDay(now)}
        hasTime={hasTime}
        label="Start"
        minTime={getMinStartTime(draft.startsAt, now)}
        value={draft.startsAt}
        onDayChange={handleStartDayChange}
        onTimeChange={handleStartTimeChange}
      />
      <MomentFields
        fromDay={startOfDay(draft.startsAt)}
        hasTime={hasTime}
        label="End"
        value={draft.endsAt}
        onDayChange={handleEndDayChange}
        onTimeChange={handleEndTimeChange}
      />
      <div className="flex items-center justify-between text-sm">
        <Label className="font-normal" htmlFor={allDayId}>
          All day
        </Label>
        <Switch checked={draft.isAllDay} id={allDayId} onCheckedChange={handleAllDayChange} />
      </div>
    </div>
  );
};

export default DurationTab;

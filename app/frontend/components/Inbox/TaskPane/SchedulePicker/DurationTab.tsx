import { useId } from "react";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import MomentFields from "./MomentFields";
import type { ScheduleDraft } from "./types";
import { moveStart, setAllDay, withDay, withTime } from "./utils";

type DurationTabProps = {
  draft: ScheduleDraft;
  error: string | null;
  onChange: (draft: ScheduleDraft) => void;
};

// The browser's zone, which every time here is in.
const TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

// A start and an end, as days (all day) or times. Moving the start moves the end with it.
const DurationTab = ({ draft, error, onChange }: DurationTabProps) => {
  const allDayId = useId();
  const hasTime = !draft.isAllDay;

  const handleStartDayChange = (day: Date) => onChange(moveStart(draft, withDay(draft.startsAt, day)));

  const handleStartTimeChange = (time: string) => onChange(moveStart(draft, withTime(draft.startsAt, time)));

  const handleEndDayChange = (day: Date) => onChange({ ...draft, endsAt: withDay(draft.endsAt, day) });

  const handleEndTimeChange = (time: string) => onChange({ ...draft, endsAt: withTime(draft.endsAt, time) });

  const handleAllDayChange = (isAllDay: boolean) => onChange(setAllDay(draft, isAllDay, Date.now()));

  return (
    <div className="flex flex-col gap-3 pt-1">
      <MomentFields
        hasTime={hasTime}
        label="Start"
        value={draft.startsAt}
        onDayChange={handleStartDayChange}
        onTimeChange={handleStartTimeChange}
      />
      <MomentFields
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
      {hasTime && <p className="text-xs text-muted-foreground">Times are in {TIME_ZONE}</p>}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default DurationTab;

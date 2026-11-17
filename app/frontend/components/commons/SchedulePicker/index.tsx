import { type FormEvent, type ReactElement, useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { CLEARED_SCHEDULE, DATE_TAB, DURATION_TAB, UNSCHEDULED } from "./constants";
import DateTab from "./DateTab";
import DurationTab from "./DurationTab";
import type { Schedule, ScheduleDraft, SchedulePayload } from "./types";
import { getDraftError, setIsDuration, toDraft, toPayload } from "./utils";

type SchedulePickerProps = {
  // The schedule the picker opens on; unscheduled by default.
  schedule?: Schedule;
  // The button that opens the popover.
  children: ReactElement;
  align?: "start" | "center" | "end";
  // Where it opens; "left" suits buttons in the middle of a page, where there's no room above or below.
  side?: "top" | "right" | "bottom" | "left";
  // The buttons' labels: Clear saves no schedule, OK saves the picked one.
  clearLabel?: string;
  saveLabel?: string;
  onSave: (schedule: SchedulePayload) => void;
};

// Picks a date (optionally with a time) or a duration. Changes stay in a draft until OK; closing the popover any other
// way drops them. Clear saves no schedule. The caller saves and shows any error, so each place can lay that out its own
// way.
const SchedulePicker = ({
  schedule = UNSCHEDULED,
  children,
  align = "start",
  side = "bottom",
  clearLabel = "Clear",
  saveLabel = "OK",
  onSave,
}: SchedulePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<ScheduleDraft>(() => toDraft(schedule, Date.now()));
  const draftError = getDraftError(draft);

  const handleOpenChange = (isOpening: boolean) => {
    if (isOpening) setDraft(toDraft(schedule, Date.now()));
    setIsOpen(isOpening);
  };

  const handleTabChange = (tab: string) => setDraft(setIsDuration(draft, tab === DURATION_TAB));

  const saveSchedule = (schedule: SchedulePayload) => {
    onSave(schedule);
    setIsOpen(false);
  };

  const handleClear = () => saveSchedule(CLEARED_SCHEDULE);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!draftError) saveSchedule(toPayload(draft));
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align={align}
        aria-label="Schedule"
        side={side}
        // Scrolls when it can't fit above or below its button, so OK stays reachable on short screens.
        className="max-h-(--radix-popover-content-available-height) w-72 overflow-y-auto p-2.5"
      >
        <form noValidate className="flex flex-col gap-2" onSubmit={handleSubmit}>
          <Tabs value={draft.isDuration ? DURATION_TAB : DATE_TAB} onValueChange={handleTabChange}>
            <TabsList className="w-full">
              <TabsTrigger value={DATE_TAB}>Date</TabsTrigger>
              <TabsTrigger value={DURATION_TAB}>Duration</TabsTrigger>
            </TabsList>
            <TabsContent value={DATE_TAB}>
              <DateTab draft={draft} onChange={setDraft} />
            </TabsContent>
            <TabsContent value={DURATION_TAB}>
              <DurationTab draft={draft} error={draftError} onChange={setDraft} />
            </TabsContent>
          </Tabs>
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" type="button" variant="outline" onClick={handleClear}>
              {clearLabel}
            </Button>
            <Button size="sm" type="submit">
              {saveLabel}
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
};

export default SchedulePicker;

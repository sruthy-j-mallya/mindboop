import { type FormEvent, useState } from "react";

import { CalendarDays } from "lucide-react";

import type { Task, UpdateTaskPayload } from "@/apis/types";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUpdateTask } from "@/hooks/reactQuery/useTasksApi";

import ScheduleLabel from "../../ScheduleLabel";
import { CLEARED_SCHEDULE, DATE_TAB, DURATION_TAB } from "./constants";
import DateTab from "./DateTab";
import DurationTab from "./DurationTab";
import type { ScheduleDraft } from "./types";
import { getDraftError, setIsDuration, toDraft, toPayload } from "./utils";

type SchedulePickerProps = { task: Task };

// Sets a task's date (optionally with a time) or its duration. Changes stay in a draft until OK; closing the popover
// any other way drops them. Clear unschedules the task.
const SchedulePicker = ({ task }: SchedulePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<ScheduleDraft>(() => toDraft(task, Date.now()));
  const { mutate: updateTask, error } = useUpdateTask();
  const draftError = getDraftError(draft);

  const handleOpenChange = (isOpening: boolean) => {
    if (isOpening) setDraft(toDraft(task, Date.now()));
    setIsOpen(isOpening);
  };

  const handleTabChange = (tab: string) => setDraft(setIsDuration(draft, tab === DURATION_TAB));

  const saveSchedule = (schedule: Omit<UpdateTaskPayload, "id">) => {
    updateTask({ id: task.id, ...schedule });
    setIsOpen(false);
  };

  const handleClear = () => saveSchedule(CLEARED_SCHEDULE);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!draftError) saveSchedule(toPayload(draft));
  };

  return (
    <div className="flex flex-col gap-1">
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button className="text-muted-foreground" size="sm" type="button" variant="ghost">
            <CalendarDays />
            {task.startsAt ? <ScheduleLabel schedule={task} /> : "Due date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" aria-label="Schedule" className="w-80 p-3">
          <form noValidate className="flex flex-col gap-3" onSubmit={handleSubmit}>
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
              <Button type="button" variant="outline" onClick={handleClear}>
                Clear
              </Button>
              <Button type="submit">OK</Button>
            </div>
          </form>
        </PopoverContent>
      </Popover>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default SchedulePicker;

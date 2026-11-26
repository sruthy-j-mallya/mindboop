import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, X } from "lucide-react";
import type { FormEvent } from "react";
import { useForm, useWatch } from "react-hook-form";

import type { ApiError } from "@/apis/axios";
import type { Task } from "@/apis/types";
import TimePicker from "@/components/commons/SchedulePicker/TimePicker";
import { toTimeInputValue, withTime } from "@/components/commons/SchedulePicker/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateTimeLog } from "@/hooks/reactQuery/useTimeLogsApi";

import AnchoredPopover from "../AnchoredPopover";
import type { AnchorRect, TimeRange } from "../types";
import { INITIAL_FORM_VALUES, TIME_LOG_VALIDATION_SCHEMA, type TimeLogFormValues } from "./constants";
import TaskSuggestions from "./TaskSuggestions";
import { buildLogTimePayload, formatLoggedDays } from "./utils";

type TimeLogPopoverProps = { anchor: AnchorRect; range: TimeRange; onClose: () => void };

// Logs time already spent, in the last 24 hours: a title of its own, or a link to an existing task. The times start as
// the slots dragged over and can be typed to the minute, to fit beside another session. Leaving the popover saves it;
// one left empty is dropped. It closes once the log is saved, and stays open with the reason when it's refused (an
// overlap with another session, say), so the times can be fixed.
const TimeLogPopover = ({ anchor, range, onClose }: TimeLogPopoverProps) => {
  const { mutate: createTimeLog, isPending } = useCreateTimeLog();
  const {
    control,
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    trigger,
    formState: { errors },
  } = useForm<TimeLogFormValues>({
    defaultValues: { ...INITIAL_FORM_VALUES, ...range },
    resolver: zodResolver(TIME_LOG_VALIDATION_SCHEMA),
  });
  const [title, linkedTask, start, end] = useWatch({ control, name: ["title", "task", "start", "end"] });

  const handleSelectTask = ({ id, title: taskTitle }: Task) => setValue("task", { id, title: taskTitle });

  const handleUnlink = () => setValue("task", null);

  // Each time keeps its own day, so a range across midnight stays across it. A shown "end before start" error is
  // checked again, since either time can fix it; a refusal from the server no longer applies to the new times.
  const handleTimeChange = (field: "start" | "end", time: string) => {
    setValue(field, withTime(field === "start" ? start : end, time));
    clearErrors("root.serverError");
    if (errors.end) void trigger("end");
  };

  const handleStartTimeChange = (time: string) => handleTimeChange("start", time);

  const handleEndTimeChange = (time: string) => handleTimeChange("end", time);

  const handleCreateFailed = ({ message }: ApiError) => setError("root.serverError", { message });

  const handleSave = (values: TimeLogFormValues) => {
    const payload = buildLogTimePayload(values);
    if (!payload) return onClose();

    createTimeLog(payload, { onSuccess: onClose, onError: handleCreateFailed });
  };

  // A save already on its way decides whether the popover closes.
  const handleDismiss = () => {
    if (!isPending) void handleSubmit(handleSave)();
  };

  const timeError = errors.end?.message ?? errors.root?.serverError?.message;

  const handleFormSubmit = (event: FormEvent) => {
    event.preventDefault();
    handleDismiss();
  };

  return (
    <AnchoredPopover
      anchor={anchor}
      isTopPinned
      className="flex w-80 flex-col gap-3 p-4"
      label="Log time"
      onDismiss={handleDismiss}
    >
      <form noValidate className="flex min-h-0 flex-col gap-3" onSubmit={handleFormSubmit}>
        <div className="flex flex-col gap-2 text-sm">
          <p className="flex items-center gap-2 text-muted-foreground">
            <Clock className="size-4" />
            {formatLoggedDays({ start, end })}
          </p>
          <div className="flex items-center gap-2">
            <TimePicker label="Start time" value={toTimeInputValue(start)} onChange={handleStartTimeChange} />
            <span className="text-muted-foreground">–</span>
            <TimePicker label="End time" value={toTimeInputValue(end)} onChange={handleEndTimeChange} />
          </div>
          {timeError && (
            <p className="text-destructive" role="alert">
              {timeError}
            </p>
          )}
        </div>
        {linkedTask ? (
          <div className="flex items-center justify-between gap-2 rounded-md bg-accent px-3 py-2 text-sm">
            <span className="truncate">
              <span className="text-muted-foreground">Logged to </span>
              <span className="font-medium">{linkedTask.title}</span>
            </span>
            <Button
              aria-label="Unlink task"
              size="icon-sm"
              type="button"
              variant="ghost"
              onClick={handleUnlink}
            >
              <X />
            </Button>
          </div>
        ) : (
          <>
            <Input
              autoFocus
              aria-describedby={errors.title ? "time-log-title-error" : "time-log-title-hint"}
              aria-invalid={!!errors.title}
              aria-label="What did you work on?"
              autoComplete="off"
              placeholder="Describe it, or search your tasks"
              {...register("title")}
            />
            {errors.title ? (
              <p className="text-sm text-destructive" id="time-log-title-error" role="alert">
                {errors.title.message}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground" id="time-log-title-hint">
                Log it as typed, or pick a matching task to link the time to it.
              </p>
            )}
            <TaskSuggestions searchTerm={title} onSelect={handleSelectTask} />
          </>
        )}
        <Button className="self-end" disabled={isPending || (!title.trim() && !linkedTask)} type="submit">
          Log time
        </Button>
      </form>
    </AnchoredPopover>
  );
};

export default TimeLogPopover;

import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, X } from "lucide-react";
import type { FormEvent } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import type { ApiError } from "@/apis/axios";
import type { Task } from "@/apis/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateTimeLog } from "@/hooks/reactQuery/useTimeLogsApi";
import useDatePreferences from "@/hooks/useDatePreferences";

import AnchoredPopover from "../AnchoredPopover";
import type { AnchorRect, TimeRange } from "../types";
import { INITIAL_FORM_VALUES, TIME_LOG_VALIDATION_SCHEMA, type TimeLogFormValues } from "./constants";
import TaskSuggestions from "./TaskSuggestions";
import { buildLogTimePayload, formatLoggedRange } from "./utils";

type TimeLogPopoverProps = { anchor: AnchorRect; range: TimeRange; onClose: () => void };

// Logs time already spent, in the last 24 hours: a title of its own, or a link to an existing task. Leaving the
// popover saves it; one left empty is dropped.
const TimeLogPopover = ({ anchor, range, onClose }: TimeLogPopoverProps) => {
  const { timeFormat } = useDatePreferences();
  const { mutate: createTimeLog } = useCreateTimeLog();
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TimeLogFormValues>({
    defaultValues: INITIAL_FORM_VALUES,
    resolver: zodResolver(TIME_LOG_VALIDATION_SCHEMA),
  });
  const [title, linkedTask] = useWatch({ control, name: ["title", "task"] });

  const handleSelectTask = ({ id, title: taskTitle }: Task) => setValue("task", { id, title: taskTitle });

  const handleUnlink = () => setValue("task", null);

  const handleCreateFailed = (error: ApiError) => toast.error(error.message);

  const handleSave = (values: TimeLogFormValues) => {
    const payload = buildLogTimePayload(values, range);
    if (payload) createTimeLog(payload, { onError: handleCreateFailed });
    onClose();
  };

  const handleDismiss = handleSubmit(handleSave);

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
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="size-4" />
          {formatLoggedRange(range, timeFormat)}
        </p>
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
      </form>
    </AnchoredPopover>
  );
};

export default TimeLogPopover;

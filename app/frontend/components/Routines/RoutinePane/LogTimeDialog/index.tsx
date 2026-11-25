import { zodResolver } from "@hookform/resolvers/zod";
import { format, isFuture } from "date-fns";
import { useForm } from "react-hook-form";

import type { Routine } from "@/apis/types";
import FormField from "@/components/commons/FormField";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreateTimeLog } from "@/hooks/reactQuery/useTimeLogsApi";

import { LOG_TIME_VALIDATION_SCHEMA, type LogTimeFormValues, MINUTES_PER_DAY } from "./constants";
import { getInitialValues, getLoggedRange } from "./utils";

type LogTimeDialogProps = {
  routine: Pick<Routine, "id" | "title" | "durationMinutes">;
  date: Date;
  onClose: () => void;
};

// Logs time spent on a routine on a day already gone by, or earlier today, without running its timer.
const LogTimeDialog = ({ routine, date, onClose }: LogTimeDialogProps) => {
  const { mutate: createTimeLog, isPending, error } = useCreateTimeLog();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LogTimeFormValues>({
    defaultValues: getInitialValues(date, routine.durationMinutes, new Date()),
    resolver: zodResolver(LOG_TIME_VALIDATION_SCHEMA),
  });

  const handleSave = (values: LogTimeFormValues) => {
    const { start, end } = getLoggedRange(date, values);
    if (isFuture(end)) {
      setError("minutes", { message: "This ends in the future" });
      return;
    }

    createTimeLog(
      {
        mode: "manual",
        routineId: routine.id,
        startedAt: start.toISOString(),
        completedAt: end.toISOString(),
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Log time</DialogTitle>
          <DialogDescription>
            {routine.title} · {format(date, "EEEE d MMMM")}
          </DialogDescription>
        </DialogHeader>
        <form noValidate className="grid gap-5" onSubmit={handleSubmit(handleSave)}>
          <div className="grid grid-cols-2 items-start gap-4">
            <FormField
              error={errors.startTime?.message}
              label="Started at"
              type="time"
              {...register("startTime")}
            />
            <FormField
              error={errors.minutes?.message}
              inputMode="numeric"
              label="Minutes"
              max={MINUTES_PER_DAY}
              min={1}
              type="number"
              {...register("minutes", { valueAsNumber: true })}
            />
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error.message}
            </p>
          )}
          <Button className="justify-self-end" disabled={isPending} type="submit">
            Log time
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LogTimeDialog;

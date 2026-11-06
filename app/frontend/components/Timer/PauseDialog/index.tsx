import { zodResolver } from "@hookform/resolvers/zod";
import type { SyntheticEvent } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStartBreak } from "@/hooks/reactQuery/useBreaksApi";
import { unlockAlarmSound } from "@/utils/alarmSound";
import { requestNotificationPermission } from "@/utils/notifications";

import {
  BREAK_PRESETS,
  BREAK_VALIDATION_SCHEMA,
  type BreakFormValues,
  INITIAL_FORM_VALUES,
  MAX_BREAK_MINUTES,
} from "./constants";

type PauseDialogProps = { timeLogId: string; onClose: () => void };

const PauseDialog = ({ timeLogId, onClose }: PauseDialogProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BreakFormValues>({
    resolver: zodResolver(BREAK_VALIDATION_SCHEMA),
    defaultValues: INITIAL_FORM_VALUES,
  });
  const { mutate: startBreak, isPending, error } = useStartBreak();

  const handleValidSubmit = (values: BreakFormValues) =>
    startBreak({ timeLogId, ...values }, { onSuccess: onClose });

  const handleFormSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    // Both need the click itself, which validation (asynchronous) would no longer count as.
    unlockAlarmSound();
    requestNotificationPermission();

    return handleSubmit(handleValidSubmit)(event);
  };

  const handlePresetClick = ({ intention, durationMinutes }: BreakFormValues) => {
    setValue("intention", intention, { shouldValidate: true });
    setValue("durationMinutes", durationMinutes, { shouldValidate: true });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="gap-6 rounded-2xl p-8 sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl">Pause with a plan</DialogTitle>
        </DialogHeader>
        <form noValidate className="flex flex-col gap-4" onSubmit={handleFormSubmit}>
          <div className="flex flex-wrap gap-2">
            {BREAK_PRESETS.map((preset) => (
              <Button
                key={preset.intention}
                className="bg-muted text-primary"
                type="button"
                variant="ghost"
                onClick={() => handlePresetClick(preset)}
              >
                {preset.intention} · {preset.durationMinutes}m
              </Button>
            ))}
          </div>
          <div className="grid gap-2">
            <Input
              aria-invalid={!!errors.intention}
              aria-label="What are you stepping away for?"
              placeholder="What are you stepping away for?"
              {...register("intention")}
            />
            {errors.intention && <p className="text-sm text-destructive">{errors.intention.message}</p>}
          </div>
          <div className="grid gap-2">
            <div className="flex items-center gap-3">
              <Label className="shrink-0" htmlFor="durationMinutes">
                Back in
              </Label>
              <Input
                aria-invalid={!!errors.durationMinutes}
                id="durationMinutes"
                max={MAX_BREAK_MINUTES}
                min={1}
                type="number"
                {...register("durationMinutes", { valueAsNumber: true })}
              />
              <span aria-hidden="true">min</span>
            </div>
            {errors.durationMinutes && (
              <p className="text-sm text-destructive">{errors.durationMinutes.message}</p>
            )}
            <p className="text-sm text-muted-foreground">An alarm rings if you&apos;re not back in time.</p>
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error.message}
            </p>
          )}
          <Button disabled={isPending} size="lg" type="submit">
            Pause &amp; set reminder
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PauseDialog;

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Hourglass } from "lucide-react";
import { useForm } from "react-hook-form";

import type { Task } from "@/apis/types";
import FormField from "@/components/commons/FormField";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MINUTES_PER_HOUR } from "@/constants";
import { useUpdateTask } from "@/hooks/reactQuery/useTasksApi";
import { formatMinutes } from "@/utils";

import {
  ESTIMATE_MAX_HOURS,
  ESTIMATE_VALIDATION_SCHEMA,
  type EstimateFormValues,
  INITIAL_FORM_VALUES,
} from "./constants";
import { toFormValues, toTotalMinutes } from "./utils";

type EstimatePickerProps = { task: Task };

const ERROR_ID = "estimate-error";

// Sets how long a task should take. Hours and minutes add up to the estimate; nothing is saved until OK. Clear removes the estimate.
const EstimatePicker = ({ task }: EstimatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: updateTask, error } = useUpdateTask();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EstimateFormValues>({
    resolver: zodResolver(ESTIMATE_VALIDATION_SCHEMA),
    defaultValues: INITIAL_FORM_VALUES,
  });
  const fieldError = errors.hours?.message ?? errors.minutes?.message;

  const handleOpenChange = (isOpening: boolean) => {
    if (isOpening) reset(toFormValues(task.estimatedMinutes));
    setIsOpen(isOpening);
  };

  const saveEstimate = (estimatedMinutes: number | null) => {
    updateTask({ id: task.id, estimatedMinutes });
    setIsOpen(false);
  };

  const handleClear = () => saveEstimate(null);

  const handleSave = (formValues: EstimateFormValues) => saveEstimate(toTotalMinutes(formValues));

  return (
    <div className="flex flex-col gap-1">
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button className="text-muted-foreground" size="sm" type="button" variant="ghost">
            <Hourglass />
            {task.estimatedMinutes ? formatMinutes(task.estimatedMinutes) : "Estimate"}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" aria-label="Estimate" className="w-72 p-3">
          <form noValidate className="flex flex-col gap-3" onSubmit={handleSubmit(handleSave)}>
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  {...register("hours")}
                  aria-describedby={errors.hours ? ERROR_ID : undefined}
                  aria-invalid={!!errors.hours}
                  label="Hours"
                  max={ESTIMATE_MAX_HOURS}
                  min={0}
                  placeholder="0"
                  type="number"
                />
                <FormField
                  {...register("minutes")}
                  aria-describedby={errors.minutes ? ERROR_ID : undefined}
                  aria-invalid={!!errors.minutes}
                  label="Minutes"
                  max={MINUTES_PER_HOUR - 1}
                  min={0}
                  placeholder="0"
                  type="number"
                />
              </div>
              {fieldError && (
                <p className="text-sm text-destructive" id={ERROR_ID}>
                  {fieldError}
                </p>
              )}
            </div>
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

export default EstimatePicker;

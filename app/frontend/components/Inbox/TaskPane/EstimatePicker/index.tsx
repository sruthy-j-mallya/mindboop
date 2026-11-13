import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Hourglass } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import type { Task } from "@/apis/types";
import FormField from "@/components/commons/FormField";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TASK_ESTIMATE_MAX_MINUTES } from "@/constants";
import { useUpdateTask } from "@/hooks/reactQuery/useTasksApi";
import { formatMinutes } from "@/utils";

import {
  ESTIMATE_PRESETS,
  ESTIMATE_VALIDATION_SCHEMA,
  type EstimateFormValues,
  INITIAL_FORM_VALUES,
} from "./constants";
import { getMinutesHint, toFormValues } from "./utils";

type EstimatePickerProps = { task: Task };

// Sets how long a task should take. A preset fills in the minutes; nothing is saved until OK. Clear removes the estimate.
const EstimatePicker = ({ task }: EstimatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: updateTask, error } = useUpdateTask();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<EstimateFormValues>({
    resolver: zodResolver(ESTIMATE_VALIDATION_SCHEMA),
    defaultValues: INITIAL_FORM_VALUES,
  });
  const minutes = useWatch({ control, name: "minutes" });

  const handleOpenChange = (isOpening: boolean) => {
    if (isOpening) reset(toFormValues(task.estimatedMinutes));
    setIsOpen(isOpening);
  };

  const saveEstimate = (estimatedMinutes: number | null) => {
    updateTask({ id: task.id, estimatedMinutes });
    setIsOpen(false);
  };

  const handlePresetSelect = (preset: number) =>
    setValue("minutes", String(preset), { shouldValidate: !!errors.minutes });

  const handleClear = () => saveEstimate(null);

  const handleSave = (values: EstimateFormValues) => saveEstimate(Number(values.minutes));

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
            <div aria-label="Presets" className="grid grid-cols-3 gap-2" role="group">
              {ESTIMATE_PRESETS.map((preset) => (
                <Button
                  key={preset}
                  aria-pressed={minutes === String(preset)}
                  size="sm"
                  type="button"
                  variant={minutes === String(preset) ? "default" : "outline"}
                  onClick={() => handlePresetSelect(preset)}
                >
                  {formatMinutes(preset)}
                </Button>
              ))}
            </div>
            <FormField
              {...register("minutes")}
              error={errors.minutes?.message}
              hint={getMinutesHint(minutes)}
              label="Minutes"
              max={TASK_ESTIMATE_MAX_MINUTES}
              min={1}
              type="number"
            />
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

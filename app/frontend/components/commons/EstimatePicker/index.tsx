import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactElement } from "react";
import { useForm } from "react-hook-form";

import FormField from "@/components/commons/FormField";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MINUTES_PER_HOUR } from "@/constants";
import useOpenState, { type OpenStateProps } from "@/hooks/useOpenState";

import {
  ESTIMATE_MAX_HOURS,
  ESTIMATE_VALIDATION_SCHEMA,
  type EstimateFormValues,
  INITIAL_FORM_VALUES,
} from "./constants";
import { toFormValues, toTotalMinutes } from "./utils";

type EstimatePickerProps = OpenStateProps & {
  estimatedMinutes: number | null;
  // The button that opens the popover.
  children: ReactElement;
  onSave: (estimatedMinutes: number | null) => void;
};

const ERROR_ID = "estimate-error";

// Sets how long a task should take. Hours and minutes add up to the estimate; nothing is saved until OK. Clear removes
// the estimate. The caller saves and shows any error, as with SchedulePicker.
const EstimatePicker = ({ estimatedMinutes, children, onSave, ...openState }: EstimatePickerProps) => {
  const [isOpen, setIsOpen] = useOpenState(openState);
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
    if (isOpening) reset(toFormValues(estimatedMinutes));
    setIsOpen(isOpening);
  };

  const saveEstimate = (minutes: number | null) => {
    onSave(minutes);
    setIsOpen(false);
  };

  const handleClear = () => saveEstimate(null);

  const handleSave = (formValues: EstimateFormValues) => saveEstimate(toTotalMinutes(formValues));

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
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
  );
};

export default EstimatePicker;

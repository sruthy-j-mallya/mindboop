import { cn } from "cn";
import type { ChangeEvent } from "react";
import { type Control, useController } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PICKED_CLASS_NAME } from "@/constants";

import { CUSTOM_TIMER_MAX, CUSTOM_TIMER_MIN, type QuickStartFormValues, TIMER_PRESETS } from "./constants";
import { getCustomMinutesHint } from "./utils";

type EstimateProps = { control: Control<QuickStartFormValues> };

const Estimate = ({ control }: EstimateProps) => {
  const {
    field: { value: presetMinutes, onChange: setPresetMinutes },
  } = useController({ control, name: "presetMinutes" });
  const {
    field: customMinutes,
    fieldState: { error },
  } = useController({ control, name: "customMinutes" });

  const hint = getCustomMinutesHint(customMinutes.value);
  const describedBy = [hint && "customMinutes-hint", error && "customMinutes-error"]
    .filter(Boolean)
    .join(" ");
  const isCustomPicked = presetMinutes === null && !!customMinutes.value;

  const handlePresetSelect = (minutes: number) => {
    setPresetMinutes(minutes);
    customMinutes.onChange("");
  };

  const handleCustomChange = (event: ChangeEvent<HTMLInputElement>) => {
    customMinutes.onChange(event.target.value);
    setPresetMinutes(null);
  };

  return (
    <div className="flex flex-col gap-3">
      <p id="estimate-label" className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
        Focus for
      </p>
      <div aria-labelledby="estimate-label" className="flex gap-2" role="group">
        {TIMER_PRESETS.map((minutes) => (
          <Button
            key={minutes}
            aria-pressed={presetMinutes === minutes}
            type="button"
            variant="ghost"
            className={cn(
              "h-11 min-w-0 flex-1 bg-muted px-2",
              presetMinutes === minutes && PICKED_CLASS_NAME,
            )}
            onClick={() => handlePresetSelect(minutes)}
          >
            {minutes} min
          </Button>
        ))}
        {/* In the presets' row; the label is read out, and the placeholder gives the limits. */}
        <Input
          {...customMinutes}
          aria-describedby={describedBy || undefined}
          aria-invalid={!!error}
          aria-label={`Or set your own (${CUSTOM_TIMER_MIN}–${CUSTOM_TIMER_MAX} min)`}
          max={CUSTOM_TIMER_MAX}
          min={CUSTOM_TIMER_MIN}
          placeholder={`${CUSTOM_TIMER_MIN}–${CUSTOM_TIMER_MAX} min`}
          type="number"
          className={cn(
            "h-11 flex-[1.5] [appearance:textfield] px-1 text-center placeholder:text-xs sm:placeholder:text-sm [&::-webkit-inner-spin-button]:appearance-none",
            isCustomPicked && PICKED_CLASS_NAME,
          )}
          onChange={handleCustomChange}
        />
      </div>
      {hint && (
        <p id="customMinutes-hint" className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id="customMinutes-error" className="text-sm text-destructive">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default Estimate;

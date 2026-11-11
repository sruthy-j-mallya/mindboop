import { cn } from "cn";
import type { ChangeEvent } from "react";
import { type Control, useController } from "react-hook-form";

import FormField from "@/components/commons/FormField";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

  const handlePresetSelect = (minutes: number) => {
    setPresetMinutes(minutes);
    customMinutes.onChange("");
  };

  const handleCustomChange = (event: ChangeEvent<HTMLInputElement>) => {
    customMinutes.onChange(event.target.value);
    setPresetMinutes(null);
  };

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <p id="estimate-label" className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          Estimate
        </p>
        <div aria-labelledby="estimate-label" className="flex gap-2" role="group">
          {TIMER_PRESETS.map((minutes) => (
            <Button
              key={minutes}
              aria-pressed={presetMinutes === minutes}
              type="button"
              variant="ghost"
              className={cn(
                "h-11 flex-1 bg-muted",
                presetMinutes === minutes &&
                  "bg-brand-yellow font-semibold text-brand-purple-dark hover:bg-brand-yellow hover:text-brand-purple-dark dark:hover:bg-brand-yellow",
              )}
              onClick={() => handlePresetSelect(minutes)}
            >
              {minutes} min
            </Button>
          ))}
        </div>
        <FormField
          {...customMinutes}
          error={error?.message}
          hint={getCustomMinutesHint(customMinutes.value)}
          label={`Or set your own (${CUSTOM_TIMER_MIN}–${CUSTOM_TIMER_MAX} min)`}
          max={CUSTOM_TIMER_MAX}
          min={CUSTOM_TIMER_MIN}
          type="number"
          onChange={handleCustomChange}
        />
      </CardContent>
    </Card>
  );
};

export default Estimate;

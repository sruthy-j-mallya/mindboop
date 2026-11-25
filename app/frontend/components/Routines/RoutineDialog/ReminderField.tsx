import { type Control, Controller, type FieldErrors, type UseFormRegister, useWatch } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestNotificationPermission } from "@/utils/notifications";

import { REMINDER_FREQUENCIES, type RoutineFormValues } from "./constants";
import WeekdayPicker from "./WeekdayPicker";

type ReminderFieldProps = {
  control: Control<RoutineFormValues>;
  register: UseFormRegister<RoutineFormValues>;
  errors: FieldErrors<RoutineFormValues>;
};

// An optional nudge: off, daily, on one weekday, or on the days picked, at a time of day.
const ReminderField = ({ control, register, errors }: ReminderFieldProps) => {
  const frequency = useWatch({ control, name: "reminderFrequency" });

  // Asked on the click that turns a reminder on, as browsers only prompt after a gesture.
  const handleFrequencyChange = () => requestNotificationPermission();

  return (
    <fieldset className="grid gap-3">
      <legend className="mb-2 text-sm font-medium">Reminder</legend>
      <p className="-mt-1 text-sm text-muted-foreground">
        A gentle nudge while Mindboop is open. Skipping it is fine.
      </p>
      <div className="flex w-fit rounded-full bg-muted p-1">
        {REMINDER_FREQUENCIES.map(({ id, label }) => (
          <label key={id} className="relative">
            <input
              {...register("reminderFrequency", { onChange: handleFrequencyChange })}
              className="peer absolute inset-0 cursor-pointer appearance-none rounded-full opacity-0"
              type="radio"
              value={id}
            />
            <span className="block rounded-full px-3 py-1 text-sm transition-colors peer-checked:bg-background peer-checked:shadow-sm peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50">
              {label}
            </span>
          </label>
        ))}
      </div>
      {frequency !== "off" && (
        <div className="grid gap-3">
          <div className="grid w-fit gap-2">
            <Label htmlFor="reminderTime">At</Label>
            <Input
              aria-invalid={!!errors.reminderTime}
              id="reminderTime"
              type="time"
              {...register("reminderTime")}
            />
            {errors.reminderTime && <p className="text-sm text-destructive">{errors.reminderTime.message}</p>}
          </div>
          {frequency !== "daily" && (
            <div className="grid gap-2">
              <p className="text-sm font-medium">{frequency === "weekly" ? "On" : "On these days"}</p>
              <Controller
                control={control}
                name="reminderDays"
                render={({ field: { value, onChange } }) => (
                  <WeekdayPicker isMultiple={frequency === "custom"} value={value} onChange={onChange} />
                )}
              />
              {errors.reminderDays && (
                <p className="text-sm text-destructive">{errors.reminderDays.message}</p>
              )}
            </div>
          )}
        </div>
      )}
    </fieldset>
  );
};

export default ReminderField;

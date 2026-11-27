import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "cn";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { useController, useForm, useWatch } from "react-hook-form";

import { SOUNDS } from "@/components/commons/Ambience/constants";
import useSoundPreview from "@/components/commons/Ambience/useSoundPreview";
import ChoiceField from "@/components/commons/ChoiceField";
import EmojiField from "@/components/commons/EmojiField";
import FormField from "@/components/commons/FormField";
import { LIFE_AREA_COLORS } from "@/components/commons/LifeArea/constants";
import { Button } from "@/components/ui/button";
import { PICKED_CLASS_NAME } from "@/constants";

import {
  DURATION_PRESETS,
  ROUTINE_MAX_MINUTES,
  ROUTINE_MIN_MINUTES,
  ROUTINE_VALIDATION_SCHEMA,
  type RoutineFormValues,
} from "./constants";
import ReminderField from "./ReminderField";

type RoutineFormProps = {
  initialValues: RoutineFormValues;
  submitLabel: string;
  isSubmitting: boolean;
  error?: string;
  onSubmit: (values: RoutineFormValues) => void;
  children?: ReactNode;
};

const COLOR_OPTIONS = LIFE_AREA_COLORS.map(({ id, label, value }) => ({
  value: id,
  label,
  content: <span className="size-5 rounded-full" style={{ background: value }} />,
}));

const SOUND_OPTIONS = SOUNDS.map(({ id, label, icon: Icon }) => ({
  value: id,
  label,
  content: <Icon className="size-4" />,
}));

// The add and edit dialogs' form: a name, how long, how it looks, what it sounds like, and an optional reminder.
const RoutineForm = ({
  initialValues,
  submitLabel,
  isSubmitting,
  error,
  onSubmit,
  children,
}: RoutineFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<RoutineFormValues>({
    defaultValues: initialValues,
    resolver: zodResolver(ROUTINE_VALIDATION_SCHEMA),
  });
  const handleSoundChange = useSoundPreview();
  const { field: emojiField } = useController({ control, name: "emoji" });
  const color = useWatch({ control, name: "color" });
  const durationMinutes = useWatch({ control, name: "durationMinutes" });

  const handlePreset = (minutes: number) => setValue("durationMinutes", minutes, { shouldValidate: true });

  return (
    <form noValidate className="grid gap-5" onSubmit={handleSubmit(onSubmit)}>
      <FormField
        autoComplete="off"
        error={errors.title?.message}
        label="Name"
        placeholder="Shower, meditation, fold clothes…"
        {...register("title")}
      />
      <div className="grid gap-2">
        <FormField
          className="w-28"
          error={errors.durationMinutes?.message}
          inputMode="numeric"
          label="Minutes"
          max={ROUTINE_MAX_MINUTES}
          min={ROUTINE_MIN_MINUTES}
          type="number"
          {...register("durationMinutes", { valueAsNumber: true })}
        />
        <div aria-label="Common durations" className="flex flex-wrap gap-1.5" role="group">
          {DURATION_PRESETS.map((minutes) => (
            <Button
              key={minutes}
              aria-pressed={durationMinutes === minutes}
              className={cn(durationMinutes === minutes && PICKED_CLASS_NAME)}
              size="sm"
              type="button"
              variant="ghost"
              onClick={() => handlePreset(minutes)}
            >
              {minutes} min
            </Button>
          ))}
        </div>
      </div>
      <ReminderField control={control} errors={errors} register={register} />
      {/* Out of the way: what's picked to start with will do. */}
      <details className="group rounded-xl border px-4 py-3">
        <summary className="flex cursor-pointer list-none items-center justify-between rounded-sm text-sm font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
          Look and sound
          <ChevronDown aria-hidden className="size-4 transition-transform group-open:rotate-180" />
        </summary>
        <div className="grid gap-5 pt-4">
          <ChoiceField legend="Colour" options={COLOR_OPTIONS} registration={register("color")} />
          <EmojiField color={color} error={errors.emoji?.message} field={emojiField} />
          <ChoiceField
            hasLabels
            hint="Plays when you start the routine. Pick one to hear a few seconds."
            legend="Background sound"
            options={SOUND_OPTIONS}
            registration={register("sound", { onChange: handleSoundChange })}
          />
        </div>
      </details>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {/* Stays in view while the dialog scrolls; the negative margins cover its padding. */}
      <div className="sticky -bottom-6 -mx-6 -mb-6 flex flex-wrap items-center justify-end gap-2 border-t bg-background px-6 py-4">
        {children}
        <Button disabled={isSubmitting} type="submit">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default RoutineForm;

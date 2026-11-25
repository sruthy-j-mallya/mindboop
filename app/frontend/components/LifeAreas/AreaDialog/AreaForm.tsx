import { type ChangeEvent, type ReactNode, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { NO_SOUND, SOUNDS } from "@/components/commons/Ambience/constants";
import type { SoundId } from "@/components/commons/Ambience/types";
import useAmbience from "@/components/commons/Ambience/useAmbience";
import FormField from "@/components/commons/FormField";
import { LIFE_AREA_COLORS } from "@/components/commons/LifeArea/constants";
import { Button } from "@/components/ui/button";
import useAmbienceStore from "@/stores/useAmbienceStore";

import ChoiceField from "./ChoiceField";
import { LIFE_AREA_VALIDATION_SCHEMA, type LifeAreaFormValues } from "./constants";
import EmojiField from "./EmojiField";

type AreaFormProps = {
  initialValues: LifeAreaFormValues;
  submitLabel: string;
  isSubmitting: boolean;
  error?: string;
  onSubmit: (values: LifeAreaFormValues) => void;
  // Extra actions beside the submit button (Edit's delete).
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

// The add and edit dialogs' form: a name, a colour, an emoji (shown on the colour picked) and the background sound.
// Picking a sound previews it at the app's volume until another is picked or the dialog closes.
const AreaForm = ({ initialValues, submitLabel, isSubmitting, error, onSubmit, children }: AreaFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LifeAreaFormValues>({
    defaultValues: initialValues,
    resolver: zodResolver(LIFE_AREA_VALIDATION_SCHEMA),
  });
  const [previewSoundId, setPreviewSoundId] = useState<SoundId>(NO_SOUND);
  const volume = useAmbienceStore((state) => state.volume);
  useAmbience({ soundId: previewSoundId, volume, isPlaying: true });

  const handleSoundChange = (event: ChangeEvent<HTMLInputElement>) =>
    setPreviewSoundId(event.target.value as SoundId);

  const color = useWatch({ control, name: "color" });

  return (
    <form noValidate className="grid gap-5" onSubmit={handleSubmit(onSubmit)}>
      <FormField autoComplete="off" error={errors.name?.message} label="Name" {...register("name")} />
      <ChoiceField legend="Colour" options={COLOR_OPTIONS} registration={register("color")} />
      <EmojiField color={color} control={control} />
      <ChoiceField
        hint="Plays when you start a session on one of the area’s tasks."
        legend="Background sound"
        options={SOUND_OPTIONS}
        registration={register("defaultSound", { onChange: handleSoundChange })}
      />
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-end gap-2">
        {children}
        <Button disabled={isSubmitting} type="submit">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default AreaForm;

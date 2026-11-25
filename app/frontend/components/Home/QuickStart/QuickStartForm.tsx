import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { NotebookPen, Timer } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";

import RichTextEditor from "@/components/commons/RichText/LazyEditor";
import AddStepButton from "@/components/commons/Steps/AddStepButton";
import { NEW_STEP_DRAFT } from "@/components/commons/Steps/constants";
import type { Draft } from "@/components/commons/Steps/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { QUICK_START_VALIDATION_SCHEMA, type QuickStartFormValues } from "./constants";
import Estimate from "./Estimate";
import Steps from "./Steps";
import { getInitialFormValues, saveDraft } from "./utils";

type QuickStartFormProps = {
  isBeginning: boolean;
  error?: string;
  onBegin: (values: QuickStartFormValues) => void;
};

const QuickStartForm = ({ isBeginning, error, onBegin }: QuickStartFormProps) => {
  const [defaultValues] = useState(getInitialFormValues);
  const {
    control,
    register,
    handleSubmit,
    setValue,
    subscribe,
    formState: { errors },
  } = useForm<QuickStartFormValues>({
    defaultValues,
    resolver: zodResolver(QUICK_START_VALIDATION_SCHEMA),
  });
  const steps = useWatch({ control, name: "steps" });
  const [stepDraft, setStepDraft] = useState<Draft | null>(null);
  // Out of the way until asked for, unless the draft has some.
  const [showNotes, setShowNotes] = useState(!!defaultValues.description);

  // Saved on every change so a reload or a trip to another page doesn't lose what was written.
  useEffect(
    () =>
      subscribe({
        formState: { values: true },
        callback: ({ values: { title, description, steps } }) => saveDraft({ title, description, steps }),
      }),
    [subscribe],
  );

  const handleAddStep = () => setStepDraft(NEW_STEP_DRAFT);
  const handleAddNotes = () => setShowNotes(true);

  return (
    <form noValidate className="flex flex-1 flex-col gap-4" onSubmit={handleSubmit(onBegin)}>
      <div className="grid gap-2">
        <Input
          aria-describedby={errors.title ? "title-error" : undefined}
          aria-invalid={!!errors.title}
          aria-label="Task"
          autoComplete="off"
          className="h-auto rounded-none border-0 bg-transparent px-0 text-lg font-semibold text-ellipsis shadow-none focus-visible:ring-0 md:text-xl dark:bg-transparent"
          placeholder="What do you want to get done?"
          {...register("title")}
        />
        {errors.title && (
          <p id="title-error" className="text-sm text-destructive">
            {errors.title.message}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 empty:hidden">
        {steps.length === 0 && !stepDraft && <AddStepButton onClick={handleAddStep} />}
        {!showNotes && (
          <Button
            className="text-muted-foreground"
            size="sm"
            type="button"
            variant="ghost"
            onClick={handleAddNotes}
          >
            <NotebookPen />
            Add notes
          </Button>
        )}
      </div>
      <Steps control={control} draft={stepDraft} setValue={setValue} onDraftChange={setStepDraft} />
      {showNotes && (
        <div className="flex flex-1 flex-col gap-2">
          <Controller
            control={control}
            name="description"
            render={({ field: { value, onChange } }) => (
              <RichTextEditor
                defaultValue={value}
                describedBy={errors.description ? "description-error" : undefined}
                isAutoFocused={!defaultValues.description}
                isInvalid={!!errors.description}
                label="Description"
                placeholder="Add notes, links or context. Markdown works too."
                onChange={onChange}
              />
            )}
          />
          {errors.description && (
            <p id="description-error" className="text-sm text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>
      )}
      {/* Keeps to the bottom of the card, when a taller one beside it stretches it. */}
      <div className="mt-auto flex flex-col gap-4">
        <Estimate control={control} />
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <Button className="h-12 w-full text-base" disabled={isBeginning} type="submit">
          <Timer />
          Begin
        </Button>
      </div>
    </form>
  );
};

export default QuickStartForm;

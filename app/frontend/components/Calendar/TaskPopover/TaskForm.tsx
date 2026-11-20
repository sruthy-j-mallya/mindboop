import type { FormEvent, ReactNode } from "react";
import { type Control, Controller, type FieldErrors, type UseFormRegister } from "react-hook-form";

import RichTextEditor from "@/components/commons/RichText/LazyEditor";
import AddStepButton from "@/components/commons/Steps/AddStepButton";
import { Input } from "@/components/ui/input";

import type { TaskFormValues } from "./constants";
import EstimateField from "./EstimateField";
import LifeAreaField from "./LifeAreaField";
import ScheduleField from "./ScheduleField";

type TaskFormProps = {
  control: Control<TaskFormValues>;
  register: UseFormRegister<TaskFormValues>;
  errors: FieldErrors<TaskFormValues>;
  // The steps list, kept in the form until the task is created.
  steps: ReactNode;
  showAddStep: boolean;
  onAddStep: () => void;
  // Enter in the title saves, the same as leaving the popover.
  onSubmit: () => void;
};

// A new task's form, laid out like the Inbox pane: the schedule, estimate and area of life above the title, then the steps and the
// description. Saved only once the popover is left, since there's no task to save to until then.
const TaskForm = ({ control, register, errors, steps, showAddStep, onAddStep, onSubmit }: TaskFormProps) => {
  // The schedule and estimate pickers have forms of their own, whose submits bubble up here through their portals.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (event.target === event.currentTarget) onSubmit();
  };

  return (
    <form noValidate className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <header className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="-ml-2 flex flex-wrap items-start gap-1">
            <ScheduleField control={control} />
            <EstimateField control={control} />
            <LifeAreaField control={control} />
          </div>
          {showAddStep && <AddStepButton onClick={onAddStep} />}
        </div>
        <Input
          autoFocus
          aria-describedby={errors.title ? "calendar-task-title-error" : undefined}
          aria-invalid={!!errors.title}
          aria-label="Title"
          autoComplete="off"
          className="h-auto rounded-none border-0 bg-transparent px-0 text-lg font-semibold shadow-none focus-visible:ring-0 dark:bg-transparent"
          placeholder="What do you want to get done?"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-sm text-destructive" id="calendar-task-title-error" role="alert">
            {errors.title.message}
          </p>
        )}
      </header>
      {steps}
      <div className="flex min-h-32 flex-col gap-2">
        <Controller
          control={control}
          name="description"
          render={({ field: { value, onChange } }) => (
            <RichTextEditor
              defaultValue={value}
              describedBy={errors.description ? "calendar-task-description-error" : undefined}
              isInvalid={!!errors.description}
              label="Description"
              placeholder="Add a description: notes, links or context. Markdown works too."
              onChange={onChange}
            />
          )}
        />
        {errors.description && (
          <p className="text-sm text-destructive" id="calendar-task-description-error" role="alert">
            {errors.description.message}
          </p>
        )}
      </div>
    </form>
  );
};

export default TaskForm;

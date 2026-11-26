import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { type FieldErrors, useForm, useWatch } from "react-hook-form";

import type { ApiError } from "@/apis/axios";
import type { Schedule } from "@/components/commons/ScheduleLabel/types";
import { NEW_STEP_DRAFT } from "@/components/commons/Steps/constants";
import type { Draft } from "@/components/commons/Steps/types";
import { useCreateTask } from "@/hooks/reactQuery/useTasksApi";

import AnchoredPopover from "../AnchoredPopover";
import type { AnchorRect } from "../types";
import { POPOVER_CLASS_NAME, TASK_VALIDATION_SCHEMA, type TaskFormValues } from "./constants";
import DraftSteps from "./DraftSteps";
import TaskForm from "./TaskForm";
import { buildCreatePayload, getNewTaskFormValues } from "./utils";

type NewProps = { anchor: AnchorRect; schedule: Schedule; onClose: () => void };

// A new task at the slot clicked. Leaving the popover saves it too; one left without a title is dropped, while Add task
// asks for one.
const New = ({ anchor, schedule, onClose }: NewProps) => {
  const [stepDraft, setStepDraft] = useState<Draft | null>(null);
  const { mutate: createTask, isPending } = useCreateTask();
  const {
    control,
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<TaskFormValues>({
    defaultValues: getNewTaskFormValues(schedule),
    resolver: zodResolver(TASK_VALIDATION_SCHEMA),
  });
  const steps = useWatch({ control, name: "steps" });

  const handleAddStep = () => setStepDraft((draft) => draft ?? NEW_STEP_DRAFT);

  // The popover stays open on a refused save, with the reason in the form, so it can be fixed and tried again.
  const handleCreateFailed = ({ message }: ApiError) => setError("root.serverError", { message });

  const handleSave = (values: TaskFormValues) =>
    createTask(buildCreatePayload(values), { onSuccess: onClose, onError: handleCreateFailed });

  // Without a title there's nothing worth keeping. Any other problem stays on screen to fix.
  const handleInvalid = (formErrors: FieldErrors<TaskFormValues>) => {
    if (formErrors.title) onClose();
  };

  // A save already on its way decides whether the popover closes.
  const handleDismiss = () => {
    if (!isPending) void handleSubmit(handleSave, handleInvalid)();
  };

  return (
    <AnchoredPopover
      anchor={anchor}
      className={POPOVER_CLASS_NAME}
      label="New task"
      onDismiss={handleDismiss}
    >
      <TaskForm
        control={control}
        errors={errors}
        isPending={isPending}
        register={register}
        showAddStep={steps.length === 0 && !stepDraft}
        steps={
          <DraftSteps control={control} draft={stepDraft} setValue={setValue} onDraftChange={setStepDraft} />
        }
        onAddStep={handleAddStep}
        onSubmit={handleSubmit(handleSave)}
      />
    </AnchoredPopover>
  );
};

export default New;

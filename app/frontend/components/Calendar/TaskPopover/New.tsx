import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { type FieldErrors, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

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
  const { mutate: createTask } = useCreateTask();
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TaskFormValues>({
    defaultValues: getNewTaskFormValues(schedule),
    resolver: zodResolver(TASK_VALIDATION_SCHEMA),
  });
  const steps = useWatch({ control, name: "steps" });

  const handleAddStep = () => setStepDraft((draft) => draft ?? NEW_STEP_DRAFT);

  // The popover is gone by the time a save fails, so the error shows as a toast.
  const handleCreateFailed = (error: ApiError) => toast.error(error.message);

  const handleSave = (values: TaskFormValues) => {
    createTask(buildCreatePayload(values), { onError: handleCreateFailed });
    onClose();
  };

  // Without a title there's nothing worth keeping. Any other problem stays on screen to fix.
  const handleInvalid = (formErrors: FieldErrors<TaskFormValues>) => {
    if (formErrors.title) onClose();
  };

  const handleDismiss = handleSubmit(handleSave, handleInvalid);

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

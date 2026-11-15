import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { ApiError } from "@/apis/axios";
import type { Task } from "@/apis/types";
import { NEW_STEP_DRAFT } from "@/components/commons/Steps/constants";
import type { Draft } from "@/components/commons/Steps/types";
import TaskSteps from "@/components/commons/TaskSteps";
import { useTask, useUpdateTask } from "@/hooks/reactQuery/useTasksApi";

import AnchoredPopover from "../AnchoredPopover";
import type { AnchorRect } from "../types";
import { POPOVER_CLASS_NAME, TASK_VALIDATION_SCHEMA, type TaskFormValues } from "./constants";
import TaskForm from "./TaskForm";
import { buildUpdatePayload, toFormValues } from "./utils";

type EditProps = { anchor: AnchorRect; task: Task; onClose: () => void };

// A scheduled task, opened from the grid. Steps save as they change, like everywhere else; the title, schedule,
// estimate and description save when the popover is left.
const Edit = ({ anchor, task: calendarTask, onClose }: EditProps) => {
  const [stepDraft, setStepDraft] = useState<Draft | null>(null);
  // Read through the task's own query, so step changes (saved one at a time) show at once.
  const { data: task = calendarTask } = useTask(calendarTask.id, { initialData: calendarTask });
  const { mutate: updateTask } = useUpdateTask();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormValues>({
    defaultValues: toFormValues(calendarTask),
    resolver: zodResolver(TASK_VALIDATION_SCHEMA),
  });

  const handleAddStep = () => setStepDraft((draft) => draft ?? NEW_STEP_DRAFT);

  const handleUpdateFailed = (error: ApiError) => toast.error(error.message);

  const handleSave = (values: TaskFormValues) => {
    const payload = buildUpdatePayload(task, values);
    if (payload) updateTask(payload, { onError: handleUpdateFailed });
    onClose();
  };

  // An invalid edit (an emptied title) keeps the popover open, with the error under the field.
  const handleDismiss = handleSubmit(handleSave);

  return (
    <AnchoredPopover
      anchor={anchor}
      className={POPOVER_CLASS_NAME}
      label="Edit task"
      onDismiss={handleDismiss}
    >
      <TaskForm
        control={control}
        errors={errors}
        register={register}
        showAddStep={task.checklistItems.length === 0 && !stepDraft}
        steps={<TaskSteps draft={stepDraft} task={task} onDraftChange={setStepDraft} />}
        onAddStep={handleAddStep}
        onSubmit={handleDismiss}
      />
    </AnchoredPopover>
  );
};

export default Edit;

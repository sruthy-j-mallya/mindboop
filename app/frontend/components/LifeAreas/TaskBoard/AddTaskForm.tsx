import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";

import type { LifeArea } from "@/apis/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { INITIAL_FORM_VALUES, TASK_VALIDATION_SCHEMA, type TaskFormValues } from "@/constants/taskForm";
import { useCreateTask } from "@/hooks/reactQuery/useTasksApi";

import { INBOX_NAME } from "../constants";
import { NEW_TASK_INPUT_ID } from "./constants";

type AddTaskFormProps = { lifeArea?: LifeArea };

// Adds a task by its title, to the area shown (or the Inbox). The input clears as soon as it's sent, so the next one can be typed straight away (and
// sent while the last is still saving). A failed one comes back into the input if it's still empty.
const AddTaskForm = ({ lifeArea }: AddTaskFormProps) => {
  const { mutate: createTask, error } = useCreateTask();
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<TaskFormValues>({
    defaultValues: INITIAL_FORM_VALUES,
    resolver: zodResolver(TASK_VALIDATION_SCHEMA),
  });
  const errorMessage = errors.title?.message ?? error?.message;
  const listName = lifeArea?.name ?? `your ${INBOX_NAME}`;

  const handleBlur = () => clearErrors("title");

  const handleAddTask = ({ title }: TaskFormValues) => {
    reset(INITIAL_FORM_VALUES);
    const handleError = () => {
      if (!getValues("title")) setValue("title", title);
    };
    createTask({ title, lifeAreaId: lifeArea?.id ?? null }, { onError: handleError });
  };

  return (
    <form noValidate className="grid gap-2" onSubmit={handleSubmit(handleAddTask)}>
      <div className="flex items-center gap-2">
        <Input
          aria-describedby={errorMessage ? "new-task-error" : undefined}
          aria-invalid={!!errors.title}
          aria-label="New task"
          id={NEW_TASK_INPUT_ID}
          autoComplete="off"
          placeholder={`Add a task to ${listName}`}
          {...register("title", { onBlur: handleBlur })}
        />
        <Button aria-label="Add task" size="icon" type="submit">
          <Plus />
        </Button>
      </div>
      {errorMessage && (
        <p className="text-sm text-destructive" id="new-task-error" role="alert">
          {errorMessage}
        </p>
      )}
    </form>
  );
};

export default AddTaskForm;

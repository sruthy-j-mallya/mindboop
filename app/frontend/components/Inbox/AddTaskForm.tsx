import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateTask } from "@/hooks/reactQuery/useTasksApi";

import { INITIAL_FORM_VALUES, TASK_VALIDATION_SCHEMA, type TaskFormValues } from "./constants";

// Adds a task by its title. The input clears as soon as it's sent, so the next one can be typed straight away (and
// sent while the last is still saving). A failed one comes back into the input if it's still empty.
const AddTaskForm = () => {
  const { mutate: createTask, error } = useCreateTask();
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<TaskFormValues>({
    defaultValues: INITIAL_FORM_VALUES,
    resolver: zodResolver(TASK_VALIDATION_SCHEMA),
  });
  const errorMessage = errors.title?.message ?? error?.message;

  const handleAddTask = ({ title }: TaskFormValues) => {
    reset(INITIAL_FORM_VALUES);
    const handleError = () => {
      if (!getValues("title")) setValue("title", title);
    };
    createTask({ title }, { onError: handleError });
  };

  return (
    <form noValidate className="grid gap-2" onSubmit={handleSubmit(handleAddTask)}>
      <div className="flex items-center gap-2">
        <Input
          aria-describedby={errorMessage ? "new-task-error" : undefined}
          aria-invalid={!!errors.title}
          aria-label="New task"
          autoComplete="off"
          placeholder="Add a task to your Inbox"
          {...register("title")}
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

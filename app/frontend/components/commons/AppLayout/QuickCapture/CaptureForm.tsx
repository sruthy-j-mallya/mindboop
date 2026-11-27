import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { INITIAL_FORM_VALUES, TASK_VALIDATION_SCHEMA, type TaskFormValues } from "@/constants/taskForm";
import { useCreateTask } from "@/hooks/reactQuery/useTasksApi";

type CaptureFormProps = { onClose: () => void };

const ERROR_ID = "capture-error";

const CaptureForm = ({ onClose }: CaptureFormProps) => {
  const { mutate: createTask, isPending, error } = useCreateTask();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormValues>({
    defaultValues: INITIAL_FORM_VALUES,
    resolver: zodResolver(TASK_VALIDATION_SCHEMA),
  });
  const errorMessage = errors.title?.message ?? error?.message;

  const handleAdded = () => {
    onClose();
    toast("Added to your Inbox");
  };

  const handleCapture = ({ title }: TaskFormValues) =>
    createTask({ title, lifeAreaId: null }, { onSuccess: handleAdded });

  return (
    <form noValidate className="grid gap-2" onSubmit={handleSubmit(handleCapture)}>
      <div className="flex gap-2">
        <Input
          aria-describedby={errorMessage ? ERROR_ID : undefined}
          aria-invalid={!!errorMessage}
          aria-label="Title"
          autoComplete="off"
          placeholder="What do you want to get done?"
          {...register("title")}
        />
        <Button disabled={isPending} type="submit">
          Add
        </Button>
      </div>
      {errorMessage && (
        <p className="text-sm text-destructive" id={ERROR_ID} role="alert">
          {errorMessage}
        </p>
      )}
    </form>
  );
};

export default CaptureForm;

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import type { Task } from "@/apis/types";
import RichTextEditor from "@/components/commons/RichText/LazyEditor";
import { Button } from "@/components/ui/button";
import { useUpdateTask } from "@/hooks/reactQuery/useTasksApi";

import { DESCRIPTION_VALIDATION_SCHEMA, type DescriptionFormValues } from "./constants";

type DescriptionFormProps = {
  task: Task;
  onClose: () => void;
};

const DescriptionForm = ({ task, onClose }: DescriptionFormProps) => {
  const { mutate: updateTask, isPending, error } = useUpdateTask();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DescriptionFormValues>({
    defaultValues: { description: task.description ?? "" },
    resolver: zodResolver(DESCRIPTION_VALIDATION_SCHEMA),
  });

  const handleSave = ({ description }: DescriptionFormValues) =>
    updateTask({ id: task.id, description }, { onSuccess: onClose });

  return (
    <form noValidate className="flex flex-col gap-3" onSubmit={handleSubmit(handleSave)}>
      <Controller
        control={control}
        name="description"
        render={({ field: { value, onChange } }) => (
          <RichTextEditor
            isAutoFocused
            defaultValue={value}
            describedBy={errors.description ? "description-error" : undefined}
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
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error.message}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button disabled={isPending} type="submit">
          Save
        </Button>
      </div>
    </form>
  );
};

export default DescriptionForm;

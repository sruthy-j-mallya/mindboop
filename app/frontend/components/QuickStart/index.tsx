import { zodResolver } from "@hookform/resolvers/zod";
import { Timer } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCreateTask, useDeleteTask } from "@/hooks/reactQuery/useTasksApi";
import { useCreateTimeLog } from "@/hooks/reactQuery/useTimeLogsApi";
import routes from "@/routes";

import { INITIAL_FORM_VALUES, QUICK_START_VALIDATION_SCHEMA, type QuickStartFormValues } from "./constants";
import Estimate from "./Estimate";
import Steps from "./Steps";
import { buildTaskPayload, buildTimeLogPayload } from "./utils";

const QuickStart = () => {
  const navigate = useNavigate();
  const { mutate: createTask, isPending: isCreatingTask, error: taskError } = useCreateTask();
  const { mutate: createTimeLog, isPending: isCreatingTimeLog, error: timeLogError } = useCreateTimeLog();
  const { mutate: deleteTask } = useDeleteTask();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QuickStartFormValues>({
    defaultValues: INITIAL_FORM_VALUES,
    resolver: zodResolver(QUICK_START_VALIDATION_SCHEMA),
  });

  const handleBeginSession = (values: QuickStartFormValues) =>
    createTask(buildTaskPayload(values), {
      onSuccess: ({ task }) =>
        createTimeLog(buildTimeLogPayload(task), {
          onSuccess: () => navigate(routes.timer),
          // Trying again creates a new task, so this one mustn't stay behind as a duplicate.
          onError: () => deleteTask(task.id),
        }),
    });

  const errorMessage = (taskError ?? timeLogError)?.message;

  return (
    <form
      noValidate
      className="mx-auto grid w-full max-w-5xl gap-6 p-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start"
      onSubmit={handleSubmit(handleBeginSession)}
    >
      <header className="grid gap-2 lg:col-span-2">
        <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          Start with intention
        </p>
        <h1 className="sr-only">What do you want to get done?</h1>
      </header>
      <Card>
        <CardContent className="flex flex-col gap-4">
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
          <Steps control={control} />
        </CardContent>
      </Card>
      <div className="flex flex-col gap-4">
        <Estimate control={control} />
        {errorMessage && (
          <p className="text-sm text-destructive" role="alert">
            {errorMessage}
          </p>
        )}
        <Button
          className="h-12 w-full text-base"
          disabled={isCreatingTask || isCreatingTimeLog}
          type="submit"
        >
          <Timer />
          Begin
        </Button>
      </div>
    </form>
  );
};

export default QuickStart;

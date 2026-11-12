import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Timer } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router";

import RichTextEditor from "@/components/commons/RichText/LazyEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCreateQuickStart } from "@/hooks/reactQuery/useQuickStartsApi";
import routes from "@/routes";

import { QUICK_START_VALIDATION_SCHEMA, type QuickStartFormValues } from "./constants";
import Estimate from "./Estimate";
import Steps from "./Steps";
import { buildQuickStartPayload, clearDraft, getInitialFormValues, saveDraft } from "./utils";

const QuickStart = () => {
  const navigate = useNavigate();
  const { mutate: createQuickStart, isPending, error } = useCreateQuickStart();
  const [defaultValues] = useState(getInitialFormValues);
  const {
    control,
    register,
    handleSubmit,
    subscribe,
    formState: { errors },
  } = useForm<QuickStartFormValues>({
    defaultValues,
    resolver: zodResolver(QUICK_START_VALIDATION_SCHEMA),
  });

  // Saved on every change so a reload or a trip to another page doesn't lose what was written.
  useEffect(
    () =>
      subscribe({
        formState: { values: true },
        callback: ({ values: { title, description, steps } }) => saveDraft({ title, description, steps }),
      }),
    [subscribe],
  );

  const handleSessionStarted = () => {
    clearDraft();
    navigate(routes.timer);
  };

  const handleBeginSession = (values: QuickStartFormValues) =>
    createQuickStart(buildQuickStartPayload(values), { onSuccess: handleSessionStarted });

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
          <div className="grid gap-2">
            <Controller
              control={control}
              name="description"
              render={({ field: { value, onChange } }) => (
                <RichTextEditor
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
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-col gap-4">
        <Estimate control={control} />
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error.message}
          </p>
        )}
        <Button className="h-12 w-full text-base" disabled={isPending} type="submit">
          <Timer />
          Begin
        </Button>
      </div>
    </form>
  );
};

export default QuickStart;

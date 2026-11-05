import { zodResolver } from "@hookform/resolvers/zod";
import { Timer } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { INITIAL_FORM_VALUES, QUICK_START_VALIDATION_SCHEMA, type QuickStartFormValues } from "./constants";
import Estimate from "./Estimate";
import Steps from "./Steps";

const QuickStart = () => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QuickStartFormValues>({
    defaultValues: INITIAL_FORM_VALUES,
    resolver: zodResolver(QUICK_START_VALIDATION_SCHEMA),
  });

  // Sessions don't exist yet, so a valid submit has nothing to start.
  const handleBeginSession = () => undefined;

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
        <Button className="h-12 w-full text-base" type="submit">
          <Timer />
          Begin
        </Button>
      </div>
    </form>
  );
};

export default QuickStart;

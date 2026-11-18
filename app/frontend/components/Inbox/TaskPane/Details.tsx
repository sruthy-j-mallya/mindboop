import { useState } from "react";

import type { Task } from "@/apis/types";
import Breadcrumbs from "@/components/commons/Breadcrumbs";
import DueDatePicker from "@/components/commons/DueDatePicker";
import AddStepButton from "@/components/commons/Steps/AddStepButton";
import { NEW_STEP_DRAFT } from "@/components/commons/Steps/constants";
import type { Draft } from "@/components/commons/Steps/types";
import TaskDescription from "@/components/commons/TaskDescription";
import TaskEstimatePicker from "@/components/commons/TaskEstimatePicker";
import TaskSteps from "@/components/commons/TaskSteps";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

import TitleInput from "../TitleInput";
import useCompleteTask from "../useCompleteTask";
import useRenameTask from "../useRenameTask";
import DeleteTaskButton from "./DeleteTaskButton";
import StartTaskButton from "./StartTaskButton";

type DetailsProps = { task: Task };

// Rendered with `key={task.id}`, so an open step row doesn't carry over to the next task picked.
const Details = ({ task }: DetailsProps) => {
  const [stepDraft, setStepDraft] = useState<Draft | null>(null);
  const { completeTask, isCompleting, error: completeError } = useCompleteTask(task.id);
  const { title, renameTask, error: renameError } = useRenameTask(task);
  const error = completeError ?? renameError;

  // A row that's already open keeps its place rather than being replaced.
  const handleAddStep = () => setStepDraft((draft) => draft ?? NEW_STEP_DRAFT);

  return (
    <article className="flex flex-1 flex-col gap-8">
      {/* Grouped, so the gap below the title doesn't double up while the task has no steps. */}
      <div className="flex flex-col gap-2">
        {/* The complete checkbox, the due date and the estimate sit in the top-left corner, above the title; the add-step,
            delete and start buttons in the top right. */}
        <header className="flex flex-col gap-3">
          <div className="flex min-h-8 items-start justify-between gap-4">
            <div className="flex min-h-8 items-start gap-3">
              <Checkbox
                aria-label="Mark as complete"
                checked={isCompleting}
                className="mt-1.5 size-5 border-muted-foreground/50"
                disabled={isCompleting}
                onCheckedChange={completeTask}
              />
              <Separator className="mt-2 data-[orientation=vertical]:h-4" orientation="vertical" />
              <div className="flex flex-wrap items-start gap-1">
                <DueDatePicker task={task} />
                <TaskEstimatePicker task={task} />
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {task.checklistItems.length === 0 && <AddStepButton onClick={handleAddStep} />}
              <DeleteTaskButton task={task} />
              <StartTaskButton task={task} />
            </div>
          </div>
          {/* The heading keeps the title as its name; the field inside it edits the title in place. */}
          <h2 aria-label={title} className="flex text-xl font-semibold">
            <TitleInput
              className="-mx-2 w-full rounded-md px-2 py-0.5 transition-colors hover:bg-muted focus:bg-muted"
              label="Task title"
              title={title}
              onSave={renameTask}
            />
          </h2>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error.message}
            </p>
          )}
        </header>
        <TaskSteps draft={stepDraft} task={task} onDraftChange={setStepDraft} />
      </div>
      {/* Where to pick the task back up, above the description so it's the first thing seen when returning to it. */}
      <Breadcrumbs breadcrumbs={task.breadcrumbs} />
      <TaskDescription task={task} />
    </article>
  );
};

export default Details;

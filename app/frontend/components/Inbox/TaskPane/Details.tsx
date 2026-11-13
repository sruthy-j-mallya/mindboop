import { useState } from "react";

import type { Task } from "@/apis/types";
import AddStepButton from "@/components/commons/Steps/AddStepButton";
import { NEW_STEP_DRAFT } from "@/components/commons/Steps/constants";
import type { Draft } from "@/components/commons/Steps/types";
import TaskDescription from "@/components/commons/TaskDescription";
import TaskSteps from "@/components/commons/TaskSteps";
import { Checkbox } from "@/components/ui/checkbox";

import useCompleteTask from "../useCompleteTask";

type DetailsProps = { task: Task };

// Rendered with `key={task.id}`, so an open step row doesn't carry over to the next task picked.
const Details = ({ task }: DetailsProps) => {
  const [stepDraft, setStepDraft] = useState<Draft | null>(null);
  const { completeTask, isCompleting, error } = useCompleteTask(task.id);

  // A row that's already open keeps its place rather than being replaced.
  const handleAddStep = () => setStepDraft((draft) => draft ?? NEW_STEP_DRAFT);

  return (
    <article className="flex flex-1 flex-col gap-8">
      {/* Grouped, so the gap below the title doesn't double up while the task has no steps. */}
      <div className="flex flex-col gap-2">
        {/* The complete checkbox sits in the top-left corner, above the title; the add-step button in the top right. */}
        <header className="flex flex-col gap-3">
          <div className="flex min-h-8 items-center justify-between gap-4">
            <Checkbox
              aria-label="Mark as complete"
              checked={isCompleting}
              className="size-5 border-muted-foreground/50"
              disabled={isCompleting}
              onCheckedChange={completeTask}
            />
            {task.checklistItems.length === 0 && <AddStepButton onClick={handleAddStep} />}
          </div>
          <h2 className="text-xl font-semibold wrap-anywhere">{task.title}</h2>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error.message}
            </p>
          )}
        </header>
        <TaskSteps draft={stepDraft} task={task} onDraftChange={setStepDraft} />
      </div>
      <TaskDescription task={task} />
    </article>
  );
};

export default Details;

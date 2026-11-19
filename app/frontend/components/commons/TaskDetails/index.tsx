import { useState } from "react";

import { cn } from "cn";

import type { Task } from "@/apis/types";
import Breadcrumbs from "@/components/commons/Breadcrumbs";
import DueDatePicker from "@/components/commons/DueDatePicker";
import AddStepButton from "@/components/commons/Steps/AddStepButton";
import { NEW_STEP_DRAFT } from "@/components/commons/Steps/constants";
import type { Draft } from "@/components/commons/Steps/types";
import TaskDescription from "@/components/commons/TaskDescription";
import TaskEstimatePicker from "@/components/commons/TaskEstimatePicker";
import TaskSteps from "@/components/commons/TaskSteps";
import TitleInput from "@/components/commons/TitleInput";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import useCompleteTask from "@/hooks/useCompleteTask";
import useRenameTask from "@/hooks/useRenameTask";

import DeleteTaskButton from "./DeleteTaskButton";
import StartTaskButton from "./StartTaskButton";

type TaskDetailsProps = {
  task: Task;
  // Tighter spacing and a smaller title, for a popover rather than a full pane.
  isCompact?: boolean;
  // The task left this view, completed or deleted. The Inbox pane closes itself; a popover passes its close here.
  onRemoved?: () => void;
};

// A task's full view, as the Inbox pane and the Calendar's popover show it. Everything saves as it changes. Rendered with
// `key={task.id}`, so an open step row doesn't carry over to the next task picked.
const TaskDetails = ({ task, isCompact = false, onRemoved }: TaskDetailsProps) => {
  const [stepDraft, setStepDraft] = useState<Draft | null>(null);
  const { completeTask, isCompleting, error: completeError } = useCompleteTask(task.id, onRemoved);
  const { title, renameTask, error: renameError } = useRenameTask(task);
  const error = completeError ?? renameError;

  // A row that's already open keeps its place rather than being replaced.
  const handleAddStep = () => setStepDraft((draft) => draft ?? NEW_STEP_DRAFT);

  return (
    <article className={cn("flex flex-1 flex-col", isCompact ? "gap-5" : "gap-8")}>
      {/* Grouped, so the gap below the title doesn't double up while the task has no steps. */}
      <div className={cn("flex flex-col", isCompact ? "gap-1" : "gap-2")}>
        {/* The complete checkbox, the due date and the estimate sit in the top-left corner, above the title; the add-step,
            delete and start buttons in the top right. */}
        <header className={cn("flex flex-col", isCompact ? "gap-1.5" : "gap-3")}>
          <div className={cn("flex min-h-8 items-start justify-between", isCompact ? "gap-2" : "gap-4")}>
            <div className={cn("flex min-h-8 items-start", isCompact ? "gap-2" : "gap-3")}>
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
                <TaskEstimatePicker isCompact={isCompact} task={task} />
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {task.checklistItems.length === 0 && <AddStepButton onClick={handleAddStep} />}
              <DeleteTaskButton task={task} onDeleted={onRemoved} />
              <StartTaskButton isIconOnly={isCompact} task={task} />
            </div>
          </div>
          {/* The heading keeps the title as its name; the field inside it edits the title in place. */}
          <h2 aria-label={title} className={cn("flex font-semibold", isCompact ? "text-lg" : "text-xl")}>
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

export default TaskDetails;

import { useState } from "react";

import { cn } from "cn";

import type { Task } from "@/apis/types";
import Breadcrumbs from "@/components/commons/Breadcrumbs";
import { NEW_STEP_DRAFT } from "@/components/commons/Steps/constants";
import type { Draft } from "@/components/commons/Steps/types";
import TaskDescription from "@/components/commons/TaskDescription";
import TaskSteps from "@/components/commons/TaskSteps";
import TitleInput from "@/components/commons/TitleInput";
import { Checkbox } from "@/components/ui/checkbox";
import useCompleteTask from "@/hooks/useCompleteTask";
import useRenameTask from "@/hooks/useRenameTask";

import DueDatePicker from "./DueDatePicker";
import StartTaskButton from "./StartTaskButton";
import TaskActionsMenu from "./TaskActionsMenu";
import TaskEstimatePicker from "./TaskEstimatePicker";
import TaskLifeAreaPicker from "./TaskLifeAreaPicker";
import type { Detail, DetailPickerProps } from "./types";

type TaskDetailsProps = {
  task: Task;
  // Tighter spacing and a smaller title, for a popover rather than a full pane.
  isCompact?: boolean;
  // Without completing, starting or deleting: the Timer has its own ways to start and end a session.
  isOnTimer?: boolean;
  // The title is already shown (and edited) elsewhere, as beside a session's clock.
  isTitleHidden?: boolean;
  // The task left this view, completed or deleted. The Inbox pane closes itself; a popover passes its close here.
  onRemoved?: () => void;
};

// A task's full view, as the task pane, the Calendar's popover and the Timer show it. Everything saves as it changes. Rendered with
// `key={task.id}`, so an open step row doesn't carry over to the next task picked.
const TaskDetails = ({
  task,
  isCompact = false,
  isOnTimer = false,
  isTitleHidden = false,
  onRemoved,
}: TaskDetailsProps) => {
  const [stepDraft, setStepDraft] = useState<Draft | null>(null);
  const [openDetail, setOpenDetail] = useState<Detail | null>(null);
  const { completeTask, isCompleting, error: completeError } = useCompleteTask(task.id, onRemoved);
  const { title, renameTask, error: renameError } = useRenameTask(task);
  const error = completeError ?? renameError;

  // A row that's already open keeps its place rather than being replaced.
  const handleAddStep = () => setStepDraft((draft) => draft ?? NEW_STEP_DRAFT);

  const getDetailProps = (detail: Detail): DetailPickerProps => ({
    task,
    isOpen: openDetail === detail,
    // Closing one leaves another that has opened since alone.
    onOpenChange: (isOpen) =>
      setOpenDetail((current) => {
        if (isOpen) return detail;

        return current === detail ? null : current;
      }),
  });

  // Lined up with the title's text.
  const meta = (
    <div className={cn("-ml-1.5 flex flex-wrap items-start gap-1 empty:hidden", !isOnTimer && "pl-8")}>
      <DueDatePicker {...getDetailProps("schedule")} />
      <TaskLifeAreaPicker {...getDetailProps("lifeArea")} />
      <TaskEstimatePicker {...getDetailProps("estimate")} />
    </div>
  );

  return (
    <article className={cn("flex flex-1 flex-col", isCompact ? "gap-5" : "gap-8")}>
      {/* Grouped, so the gap below the title doesn't double up while the task has no steps. */}
      <div className={cn("flex flex-col", isCompact ? "gap-1" : "gap-2")}>
        {/* The title comes first; what's set of the date, area and estimate sits in a quiet line below it. The rest is
            added from the menu. */}
        <header className="flex flex-col gap-1">
          <div className={cn("flex items-start", isCompact ? "gap-2" : "gap-4")}>
            {/* Without the title, what's set takes its place beside the menu. */}
            {isTitleHidden ? (
              <div className="min-w-0 flex-1">{meta}</div>
            ) : (
              <div className="flex min-w-0 flex-1 items-start gap-3">
                {!isOnTimer && (
                  <Checkbox
                    aria-label="Mark as complete"
                    checked={isCompleting}
                    className="mt-1.5 size-5 border-muted-foreground/50"
                    disabled={isCompleting}
                    onCheckedChange={completeTask}
                  />
                )}
                {/* The heading keeps the title as its name; the field inside it edits the title in place. */}
                <h2
                  aria-label={title}
                  className={cn("flex min-w-0 flex-1 font-semibold", isCompact ? "text-lg" : "text-xl")}
                >
                  <TitleInput
                    className="-mx-2 w-full rounded-md px-2 py-0.5 transition-colors hover:bg-muted focus:bg-muted"
                    label="Task title"
                    title={title}
                    onSave={renameTask}
                  />
                </h2>
              </div>
            )}
            <div className="flex shrink-0 items-center gap-1">
              <TaskActionsMenu
                canDelete={!isOnTimer}
                task={task}
                onAddDetail={setOpenDetail}
                onAddStep={handleAddStep}
                onDeleted={onRemoved}
              />
              {!isOnTimer && <StartTaskButton task={task} />}
            </div>
          </div>
          {!isTitleHidden && meta}
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

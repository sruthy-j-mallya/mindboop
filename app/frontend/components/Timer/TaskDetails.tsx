import { useState } from "react";

import type { Task } from "@/apis/types";
import Breadcrumbs from "@/components/commons/Breadcrumbs";
import DueDatePicker from "@/components/commons/DueDatePicker";
import EstimatePicker from "@/components/commons/EstimatePicker";
import AddStepButton from "@/components/commons/Steps/AddStepButton";
import { NEW_STEP_DRAFT } from "@/components/commons/Steps/constants";
import type { Draft } from "@/components/commons/Steps/types";
import TaskDescription from "@/components/commons/TaskDescription";
import TaskSteps from "@/components/commons/TaskSteps";

type TaskDetailsProps = { task: Task };

// The due date, estimate, steps and description can be changed from the Timer page; each change saves on its own. The
// breadcrumbs are read-only.
const TaskDetails = ({ task }: TaskDetailsProps) => {
  const [stepDraft, setStepDraft] = useState<Draft | null>(null);

  // A row that's already open keeps its place rather than being replaced.
  const handleAddStep = () => setStepDraft((draft) => draft ?? NEW_STEP_DRAFT);

  return (
    <>
      {/* The due date and estimate sit top left, the add-step button top right. The add button only starts the
          first step, which opens right below it; after that, Enter in a step adds the next one. It stays while that
          first row is open, so the row doesn't jump up under the cursor. */}
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-start gap-1">
            <DueDatePicker task={task} />
            <EstimatePicker task={task} />
          </div>
          {task.checklistItems.length === 0 && <AddStepButton onClick={handleAddStep} />}
        </div>
        <TaskSteps draft={stepDraft} task={task} onDraftChange={setStepDraft} />
      </div>
      {/* Where the last session left off, above the description, as in the Inbox task pane. */}
      <Breadcrumbs breadcrumbs={task.breadcrumbs} />
      <TaskDescription key={task.id} task={task} />
    </>
  );
};

export default TaskDetails;

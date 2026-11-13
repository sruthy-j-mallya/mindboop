import { useState } from "react";

import type { Task } from "@/apis/types";
import AddStepButton from "@/components/commons/Steps/AddStepButton";
import { NEW_STEP_DRAFT } from "@/components/commons/Steps/constants";
import type { Draft } from "@/components/commons/Steps/types";
import TaskDescription from "@/components/commons/TaskDescription";
import TaskSteps from "@/components/commons/TaskSteps";

type DetailsProps = { task: Task };

// Rendered with `key={task.id}`, so an open step row doesn't carry over to the next task picked.
const Details = ({ task }: DetailsProps) => {
  const [stepDraft, setStepDraft] = useState<Draft | null>(null);

  // A row that's already open keeps its place rather than being replaced.
  const handleAddStep = () => setStepDraft((draft) => draft ?? NEW_STEP_DRAFT);

  return (
    <article className="flex flex-1 flex-col gap-8">
      {/* Grouped, so the gap below the title doesn't double up while the task has no steps. */}
      <div className="flex flex-col gap-2">
        <header className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-semibold wrap-anywhere">{task.title}</h2>
          {task.checklistItems.length === 0 && <AddStepButton onClick={handleAddStep} />}
        </header>
        <TaskSteps draft={stepDraft} task={task} onDraftChange={setStepDraft} />
      </div>
      <TaskDescription task={task} />
    </article>
  );
};

export default Details;

import { useState } from "react";

import type { Routine } from "@/apis/types";
import RoutineSteps from "@/components/commons/RoutineSteps";
import AddStepButton from "@/components/commons/Steps/AddStepButton";
import { NEW_STEP_DRAFT } from "@/components/commons/Steps/constants";
import type { Draft } from "@/components/commons/Steps/types";

type StepsProps = { routine: Routine };

// The routine's checklist, edited in place. The steps are ticked off on the Timer, fresh for each session. Rendered
// with `key={routine.id}`, so an open step row doesn't carry over to the next routine picked.
const Steps = ({ routine }: StepsProps) => {
  const [draft, setDraft] = useState<Draft | null>(null);
  const hasSteps = routine.steps.length > 0;

  const handleAddStep = () => setDraft((current) => current ?? NEW_STEP_DRAFT);

  return (
    <section aria-labelledby="routine-steps-heading" className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium" id="routine-steps-heading">
          Steps
        </h3>
        {!hasSteps && <AddStepButton onClick={handleAddStep} />}
      </div>
      {!hasSteps && !draft && (
        <p className="text-sm text-muted-foreground">
          Add the steps you go through, and tick them off as you go each time.
        </p>
      )}
      <RoutineSteps draft={draft} routine={routine} onDraftChange={setDraft} />
    </section>
  );
};

export default Steps;

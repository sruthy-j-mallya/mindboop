import { useState } from "react";

import type { TimeLog } from "@/apis/types";
import RoutineBadge from "@/components/commons/Routine/Badge";
import RoutineSteps from "@/components/commons/RoutineSteps";
import type { Draft } from "@/components/commons/Steps/types";
import { useRoutines } from "@/hooks/reactQuery/useRoutinesApi";

type RoutineDetailsProps = { timeLog: TimeLog };

const ANY_TIME_COUNTS =
  "Any time you give this counts. Press Done whenever you’re done, even if the clock isn’t.";

// Beside a routine's clock: its checklist, ticked off for this session, or without one its emoji and a reminder that
// any time counts. Steps are added on the routine's pane, not here. A routine deleted mid-session just shows the words.
const RoutineDetails = ({ timeLog }: RoutineDetailsProps) => {
  const { data: routines } = useRoutines();
  const [stepDraft, setStepDraft] = useState<Draft | null>(null);
  const routine = routines?.find(({ id }) => id === timeLog.routineId);
  const steps = routine?.steps ?? [];
  const doneCount = steps.filter(({ id }) => timeLog.checkedRoutineStepIds.includes(id)).length;

  if (routine && steps.length > 0) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <RoutineBadge className="size-10 text-xl" color={routine.color} emoji={routine.emoji} />
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {doneCount} of {steps.length} done
          </p>
        </div>
        <RoutineSteps draft={stepDraft} routine={routine} timeLog={timeLog} onDraftChange={setStepDraft} />
        <p className="text-sm text-muted-foreground">{ANY_TIME_COUNTS}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center lg:my-auto">
      {routine && <RoutineBadge className="size-20 text-4xl" color={routine.color} emoji={routine.emoji} />}
      <p className="max-w-xs text-muted-foreground">{ANY_TIME_COUNTS}</p>
    </div>
  );
};

export default RoutineDetails;

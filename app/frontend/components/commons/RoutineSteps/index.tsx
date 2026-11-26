import type { Routine, TimeLog } from "@/apis/types";
import CommonSteps from "@/components/commons/Steps";
import type { StepsProps as CommonStepsProps } from "@/components/commons/Steps/types";
import {
  useCreateRoutineStep,
  useDeleteRoutineStep,
  useUpdateRoutineStep,
} from "@/hooks/reactQuery/useRoutineStepsApi";
import { useCheckRoutineStep, useUncheckRoutineStep } from "@/hooks/reactQuery/useTimeLogStepChecksApi";

type RoutineStepsProps = {
  routine: Routine;
  // The session running on the routine. With one, each step has a tick that belongs to that session; without one (on
  // the routine's pane), the steps are only a list to edit.
  timeLog?: TimeLog;
} & Pick<CommonStepsProps, "draft" | "onDraftChange">;

// A routine's checklist. Every change is saved at once, and editing it during a session changes the routine itself.
const RoutineSteps = ({
  routine: { id: routineId, steps },
  timeLog,
  draft,
  onDraftChange,
}: RoutineStepsProps) => {
  const { mutate: createStep, error: createError } = useCreateRoutineStep();
  const { mutate: updateStep, error: updateError } = useUpdateRoutineStep();
  const { mutate: deleteStep, error: deleteError } = useDeleteRoutineStep();
  const { mutate: checkStep, error: checkError } = useCheckRoutineStep();
  const { mutate: uncheckStep, error: uncheckError } = useUncheckRoutineStep();
  const error = createError ?? updateError ?? deleteError ?? checkError ?? uncheckError;
  const checkedIds = timeLog?.checkedRoutineStepIds ?? [];
  const items = steps.map(({ id, title }) => ({ id, text: title, isDone: checkedIds.includes(id) }));

  const handleAdd = (title: string, position?: number) => createStep({ routineId, title, position });
  const handleRename = (id: string, title: string) => updateStep({ routineId, id, title });
  const handleMove = (id: string, position: number) => updateStep({ routineId, id, position });
  const handleRemove = (id: string) => deleteStep({ routineId, id });
  const handleToggle = (routineStepId: string, isDone: boolean) => {
    if (!timeLog) return;

    const payload = { timeLogId: timeLog.id, routineStepId };
    if (isDone) checkStep(payload);
    else uncheckStep(payload);
  };

  return (
    <div className="flex flex-col gap-2">
      <CommonSteps
        draft={draft}
        showCheckboxes={!!timeLog}
        steps={items}
        onAdd={handleAdd}
        onDraftChange={onDraftChange}
        onMove={handleMove}
        onRemove={handleRemove}
        onRename={handleRename}
        onToggle={handleToggle}
      />
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default RoutineSteps;

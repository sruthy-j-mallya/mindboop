import type { Task } from "@/apis/types";
import CommonSteps from "@/components/commons/Steps";
import type { StepsProps as CommonStepsProps } from "@/components/commons/Steps/types";
import {
  useCreateChecklistItem,
  useDeleteChecklistItem,
  useUpdateChecklistItem,
} from "@/hooks/reactQuery/useChecklistItemsApi";

type TaskStepsProps = { task: Task } & Pick<CommonStepsProps, "draft" | "onDraftChange">;

// A saved task's steps. Every change is saved at once, so ticking a step off needs no extra click.
const TaskSteps = ({ task: { id: taskId, checklistItems }, draft, onDraftChange }: TaskStepsProps) => {
  const { mutate: createChecklistItem, error: createError } = useCreateChecklistItem();
  const { mutate: updateChecklistItem, error: updateError } = useUpdateChecklistItem();
  const { mutate: deleteChecklistItem, error: deleteError } = useDeleteChecklistItem();
  const error = createError ?? updateError ?? deleteError;
  const steps = checklistItems.map(({ id, title, isCompleted }) => ({
    id,
    text: title,
    isDone: isCompleted,
  }));

  const handleAdd = (title: string, position?: number) => createChecklistItem({ taskId, title, position });
  const handleRename = (id: string, title: string) => updateChecklistItem({ taskId, id, title });
  const handleToggle = (id: string, isCompleted: boolean) => updateChecklistItem({ taskId, id, isCompleted });
  const handleRemove = (id: string) => deleteChecklistItem({ taskId, id });
  const handleMove = (id: string, position: number) => updateChecklistItem({ taskId, id, position });

  return (
    <div className="flex flex-col gap-2">
      <CommonSteps
        draft={draft}
        steps={steps}
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

export default TaskSteps;

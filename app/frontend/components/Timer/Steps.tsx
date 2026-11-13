import type { Task } from "@/apis/types";
import CommonSteps from "@/components/commons/Steps";
import {
  useCreateChecklistItem,
  useDeleteChecklistItem,
  useUpdateChecklistItem,
} from "@/hooks/reactQuery/useChecklistItemsApi";

type StepsProps = { task: Task };

// Every change is saved at once, so ticking a step off mid-session needs no extra click.
const Steps = ({ task: { id: taskId, checklistItems } }: StepsProps) => {
  const { mutate: createChecklistItem, error: createError } = useCreateChecklistItem();
  const { mutate: updateChecklistItem, error: updateError } = useUpdateChecklistItem();
  const { mutate: deleteChecklistItem, error: deleteError } = useDeleteChecklistItem();
  const error = createError ?? updateError ?? deleteError;
  const steps = checklistItems.map(({ id, title, isCompleted }) => ({
    id,
    text: title,
    isDone: isCompleted,
  }));

  const handleAdd = (title: string) => createChecklistItem({ taskId, title });
  const handleRename = (id: string, title: string) => updateChecklistItem({ taskId, id, title });
  const handleToggle = (id: string, isCompleted: boolean) => updateChecklistItem({ taskId, id, isCompleted });
  const handleRemove = (id: string) => deleteChecklistItem({ taskId, id });
  const handleMove = (id: string, position: number) => updateChecklistItem({ taskId, id, position });

  return (
    <div className="flex flex-col gap-2">
      <CommonSteps
        steps={steps}
        onAdd={handleAdd}
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

export default Steps;

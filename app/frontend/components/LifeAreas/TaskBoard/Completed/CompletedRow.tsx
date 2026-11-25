import type { Task } from "@/apis/types";
import { Checkbox } from "@/components/ui/checkbox";
import { useUpdateTask } from "@/hooks/reactQuery/useTasksApi";

type CompletedRowProps = { task: Task };

// Unticking it puts the task back in its list.
const CompletedRow = ({ task: { id, title } }: CompletedRowProps) => {
  const { mutate: updateTask, isPending, isSuccess, error } = useUpdateTask();
  const isReopening = isPending || isSuccess;

  const handleReopen = () => updateTask({ id, isCompleted: false });

  return (
    <li className="grid gap-1">
      {/* Lined up with the rows of the list above, past their drag handle. */}
      <div className="flex items-start gap-3 rounded-md pr-3 pl-6">
        <Checkbox
          aria-label={`Reopen ${title}`}
          checked={!isReopening}
          className="mt-2.5"
          disabled={isReopening}
          onCheckedChange={handleReopen}
        />
        <span className="min-w-0 flex-1 py-2 text-sm wrap-anywhere text-muted-foreground line-through">
          {title}
        </span>
      </div>
      {error && (
        <p className="px-3 text-sm text-destructive" role="alert">
          {error.message}
        </p>
      )}
    </li>
  );
};

export default CompletedRow;

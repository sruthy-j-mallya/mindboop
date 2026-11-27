import type { Task } from "@/apis/types";
import TitleInput from "@/components/commons/TitleInput";
import useRenameTask from "@/hooks/useRenameTask";

type SessionTitleProps = { task: Task };

// The heading keeps the title as its name; the field inside it edits the title in place.
const SessionTitle = ({ task }: SessionTitleProps) => {
  const { title, renameTask, error } = useRenameTask(task);

  return (
    <>
      <h1 aria-label={title} className="flex text-2xl font-semibold">
        <TitleInput
          className="-mx-2 w-full rounded-md px-2 py-0.5 transition-colors hover:bg-muted focus:bg-muted"
          label="Task title"
          title={title}
          onSave={renameTask}
        />
      </h1>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error.message}
        </p>
      )}
    </>
  );
};

export default SessionTitle;

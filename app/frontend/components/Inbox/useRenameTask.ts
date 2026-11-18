import type { Task } from "@/apis/types";
import { useUpdateTask } from "@/hooks/reactQuery/useTasksApi";

// Renaming a task from its row or its pane. Its own `useUpdateTask` instance, so other updates don't share its state.
const useRenameTask = (task: Task) => {
  const { mutate: updateTask, variables, isPending: isRenaming, error } = useUpdateTask();
  // Shows the new title while it saves, so the old one doesn't flash back until the task refreshes.
  const title = (isRenaming && variables.title) || task.title;

  // A task can't go untitled, so an emptied title leaves the old one in place. An unchanged one isn't saved again.
  const renameTask = (newTitle: string) => {
    if (newTitle && newTitle !== title) updateTask({ id: task.id, title: newTitle });
  };

  return { title, renameTask, error };
};

export default useRenameTask;

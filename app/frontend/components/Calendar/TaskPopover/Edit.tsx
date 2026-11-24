import type { Task } from "@/apis/types";
import TaskDetails from "@/components/commons/TaskDetails";
import { useTask } from "@/hooks/reactQuery/useTasksApi";

import AnchoredPopover from "../AnchoredPopover";
import type { AnchorRect } from "../types";
import { EDIT_POPOVER_CLASS_NAME } from "./constants";

type EditProps = { anchor: AnchorRect; task: Task; onClose: () => void };

// A scheduled task, opened from the grid: the Inbox pane in a popover, with the same controls. Everything saves as it
// changes; completing or deleting the task closes the popover.
const Edit = ({ anchor, task: calendarTask, onClose }: EditProps) => {
  // Read through the task's own query, so each change (saved one at a time) shows at once.
  const { data: task = calendarTask } = useTask(calendarTask.id, { initialData: calendarTask });

  // The title saves when its field loses focus, so a title still being typed is blurred into saving before closing.
  const handleDismiss = () => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    onClose();
  };

  return (
    <AnchoredPopover
      anchor={anchor}
      className={EDIT_POPOVER_CLASS_NAME}
      label="Edit task"
      onDismiss={handleDismiss}
    >
      <TaskDetails isCompact task={task} onRemoved={onClose} />
    </AnchoredPopover>
  );
};

export default Edit;

import { useTask } from "@/hooks/reactQuery/useTasksApi";

import AnchoredPopover from "../AnchoredPopover";
import type { AnchorRect } from "../types";
import { SHOW_POPOVER_CLASS_NAME } from "./constants";
import ReadOnlyDetails from "./ReadOnlyDetails";

type ShowProps = { anchor: AnchorRect; taskId: string; onClose: () => void };

// The task a time log was spent on, opened from the log: the same popover as a scheduled task's, with nothing to
// change. The task may be done or deleted since, so it's fetched on its own.
const Show = ({ anchor, taskId, onClose }: ShowProps) => {
  const { data: task, error } = useTask(taskId);

  return (
    <AnchoredPopover
      anchor={anchor}
      className={SHOW_POPOVER_CLASS_NAME}
      label="Task details"
      onDismiss={onClose}
    >
      {task && <ReadOnlyDetails task={task} />}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error.message}
        </p>
      )}
    </AnchoredPopover>
  );
};

export default Show;

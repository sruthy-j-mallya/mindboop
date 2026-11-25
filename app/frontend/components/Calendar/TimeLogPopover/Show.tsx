import { Clock, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTask } from "@/hooks/reactQuery/useTasksApi";
import useDatePreferences from "@/hooks/useDatePreferences";

import AnchoredPopover from "../AnchoredPopover";
import ReadOnlyDetails from "../TaskPopover/ReadOnlyDetails";
import type { AnchorRect, TimeLogEvent } from "../types";
import { SHOW_POPOVER_CLASS_NAME } from "./constants";
import useDeleteTimeLogWithUndo from "./useDeleteTimeLogWithUndo";
import { formatLoggedRange } from "./utils";

type ShowProps = { anchor: AnchorRect; event: TimeLogEvent; onClose: () => void };

// A logged session: when it ran, and what it was spent on. Its task is shown read only, fetched on its own since it may
// be done since; a deleted task, or a log with only a title, shows the title. A finished session can be deleted, as when
// it was logged by mistake; a running one is ended from the Timer.
const Show = ({ anchor, event, onClose }: ShowProps) => {
  const { id, title, start, end, timeLog } = event;
  const { taskId, isTaskDeleted, completedAt } = timeLog;
  const hasTask = !!taskId && !isTaskDeleted;
  const { data: task, error } = useTask(taskId ?? "", { enabled: hasTask });
  const { timeFormat } = useDatePreferences();
  const deleteTimeLog = useDeleteTimeLogWithUndo();

  const handleDelete = () => {
    deleteTimeLog({ id, title });
    onClose();
  };

  return (
    <AnchoredPopover
      anchor={anchor}
      className={SHOW_POPOVER_CLASS_NAME}
      label="Logged time"
      onDismiss={onClose}
    >
      <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="size-4 shrink-0" />
        <span className="flex-1">{formatLoggedRange({ start, end }, timeFormat)}</span>
        {completedAt && (
          <Button
            aria-label="Delete time log"
            className="shrink-0 text-muted-foreground hover:text-destructive"
            size="icon-sm"
            type="button"
            variant="ghost"
            onClick={handleDelete}
          >
            <Trash2 />
          </Button>
        )}
      </div>
      {hasTask ? (
        task && <ReadOnlyDetails task={task} />
      ) : (
        <h2 className="py-0.5 text-lg font-semibold wrap-anywhere">{title}</h2>
      )}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error.message}
        </p>
      )}
    </AnchoredPopover>
  );
};

export default Show;

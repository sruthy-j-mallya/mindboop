import { useState } from "react";

import type { Task } from "@/apis/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DISCARD_BELOW_MINUTES } from "@/constants";
import { useCurrentTimeLog } from "@/hooks/reactQuery/useCurrentTimeLogsApi";
import { useDeleteTimeLog } from "@/hooks/reactQuery/useTimeLogsApi";
import useDeleteTaskWithUndo from "@/hooks/useDeleteTaskWithUndo";
import { isTooShortToKeep } from "@/utils/timeLogs";

import RunningSession from "./SwitchSessionDialog/RunningSession";

type DeleteTaskDialogProps = { task: Task; onClose: () => void; onDeleted?: () => void };

// Deleting closes the pane, and the dialog with it; a toast then offers to undo. For the task on the clock, it asks what
// to do with the time so far; a session too short to log can only be discarded.
const DeleteTaskDialog = ({ task, onClose, onDeleted }: DeleteTaskDialogProps) => {
  const { data: currentTimeLog } = useCurrentTimeLog();
  // Both decided on opening, so the choices don't change as the session ticks on or ends.
  const [timeLog] = useState(() => (currentTimeLog?.taskId === task.id ? currentTimeLog : null));
  const [isTooShort] = useState(() => !!timeLog && isTooShortToKeep(timeLog, Date.now()));
  const { deleteTask, isDeleting, error: deleteError } = useDeleteTaskWithUndo(task, onDeleted);
  const {
    mutateAsync: discardTimeLog,
    isPending: isDiscarding,
    isSuccess: isDiscarded,
    error: discardError,
  } = useDeleteTimeLog();
  const isBusy = isDeleting || isDiscarding;
  const error = deleteError ?? discardError;
  const canRecord = !isTooShort && !isDiscarded;

  // Once the session is discarded, trying again after a failed delete only deletes the task. A failed discard shows
  // through `discardError`, so the rejection needs no handling here.
  const handleDiscard = () => {
    if (!timeLog || isDiscarded) return deleteTask();

    return discardTimeLog(timeLog.id).then(deleteTask, () => undefined);
  };

  const sessionNote = isTooShort
    ? `This task is on the clock. You've focused for under ${DISCARD_BELOW_MINUTES} minutes, too short to log, so deleting the task discards the session.`
    : "This task is on the clock, and deleting it ends the session. What should happen to the time so far?";

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="gap-6 rounded-2xl p-8 sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl">Delete this task?</DialogTitle>
          <DialogDescription className="text-base">
            {timeLog ? sessionNote : "The task, its steps and its description will be removed."}
          </DialogDescription>
        </DialogHeader>
        {timeLog && <RunningSession timeLog={timeLog} />}
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error.message}
          </p>
        )}
        {timeLog ? (
          <div className="grid gap-2">
            {canRecord && (
              <Button disabled={isBusy} size="lg" type="button" onClick={deleteTask}>
                Record time and delete
              </Button>
            )}
            <Button disabled={isBusy} size="lg" type="button" variant="destructive" onClick={handleDiscard}>
              Discard time and delete
            </Button>
            <Button disabled={isBusy} size="lg" type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Button disabled={isBusy} size="lg" type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={isBusy} size="lg" type="button" variant="destructive" onClick={deleteTask}>
              Delete task
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DeleteTaskDialog;

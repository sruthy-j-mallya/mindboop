import type { Task } from "@/apis/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import useDeleteTaskWithUndo from "../useDeleteTaskWithUndo";

type DeleteTaskDialogProps = { task: Task; onClose: () => void };

// Deleting closes the pane, and the dialog with it; a toast then offers to undo.
const DeleteTaskDialog = ({ task, onClose }: DeleteTaskDialogProps) => {
  const { deleteTask, isDeleting, error } = useDeleteTaskWithUndo(task);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="gap-6 rounded-2xl p-8 sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl">Delete this task?</DialogTitle>
          <DialogDescription className="text-base">
            The task, its steps and its description will be removed from your Inbox.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error.message}
          </p>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Button disabled={isDeleting} size="lg" type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={isDeleting} size="lg" type="button" variant="destructive" onClick={deleteTask}>
            Delete task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteTaskDialog;

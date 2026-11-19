import { useMatch, useNavigate } from "react-router";

import type { Routine } from "@/apis/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDeleteRoutine } from "@/hooks/reactQuery/useRoutinesApi";
import routes from "@/routes";

type DeleteRoutineDialogProps = { routine: Routine; onClose: () => void };

// Asks before deleting a routine. When it's the one open, goes back to the list.
const DeleteRoutineDialog = ({ routine, onClose }: DeleteRoutineDialogProps) => {
  const navigate = useNavigate();
  const isOpen = useMatch(routes.routines.show)?.params.routineId === routine.id;
  const { mutate: deleteRoutine, isPending, error } = useDeleteRoutine();

  const handleDeleted = () => {
    onClose();
    if (isOpen) navigate(routes.routines.index);
  };

  const handleDelete = () => deleteRoutine(routine.id, { onSuccess: handleDeleted });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="gap-6 rounded-2xl p-8 sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl">Delete {routine.title}?</DialogTitle>
          <DialogDescription className="text-base">
            The time you’ve already spent on it stays on your Calendar.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error.message}
          </p>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Button disabled={isPending} size="lg" type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={isPending} size="lg" type="button" variant="destructive" onClick={handleDelete}>
            Delete routine
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteRoutineDialog;

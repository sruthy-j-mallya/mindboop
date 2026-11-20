import type { LifeArea } from "@/apis/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import useDeleteArea from "../useDeleteArea";

type DeleteAreaDialogProps = { lifeArea: LifeArea; onClose: () => void };

// Asks before deleting an area from its menu in the sidebar.
const DeleteAreaDialog = ({ lifeArea, onClose }: DeleteAreaDialogProps) => {
  const { deleteArea, isDeleting, error } = useDeleteArea(lifeArea, onClose);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="gap-6 rounded-2xl p-8 sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl">Delete {lifeArea.name}?</DialogTitle>
          <DialogDescription className="text-base">
            Its tasks move back to the Inbox. Nothing else is deleted.
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
          <Button disabled={isDeleting} size="lg" type="button" variant="destructive" onClick={deleteArea}>
            Delete area
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAreaDialog;

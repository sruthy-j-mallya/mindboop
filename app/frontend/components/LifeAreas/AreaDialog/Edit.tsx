import { useState } from "react";

import type { LifeArea } from "@/apis/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUpdateLifeArea } from "@/hooks/reactQuery/useLifeAreasApi";

import useDeleteArea from "../useDeleteArea";
import AreaForm from "./AreaForm";
import type { LifeAreaFormValues } from "./constants";

type EditAreaDialogProps = { lifeArea: LifeArea; onClose: () => void };

// Changes an area, or deletes it after a second click. Its tasks then go back to the Inbox.
const EditAreaDialog = ({ lifeArea, onClose }: EditAreaDialogProps) => {
  const { id, name, color, icon, defaultSound } = lifeArea;
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const { mutate: updateLifeArea, isPending: isUpdating, error: updateError } = useUpdateLifeArea();
  const { deleteArea, isDeleting, error: deleteError } = useDeleteArea(lifeArea, onClose);
  const error = updateError ?? deleteError;

  const handleSubmit = (values: LifeAreaFormValues) =>
    updateLifeArea({ id, ...values }, { onSuccess: onClose });

  const handleDelete = () => {
    if (isConfirmingDelete) deleteArea();
    else setIsConfirmingDelete(true);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit {name}</DialogTitle>
          <DialogDescription>
            {isConfirmingDelete
              ? "Deleting the area moves its tasks back to the Inbox."
              : "Change the area’s name, colour, icon or background sound."}
          </DialogDescription>
        </DialogHeader>
        <AreaForm
          error={error?.message}
          initialValues={{ name, color, icon, defaultSound }}
          isSubmitting={isUpdating || isDeleting}
          submitLabel="Save"
          onSubmit={handleSubmit}
        >
          <Button
            className="mr-auto"
            disabled={isUpdating || isDeleting}
            type="button"
            variant={isConfirmingDelete ? "destructive" : "ghost"}
            onClick={handleDelete}
          >
            {isConfirmingDelete ? "Delete area and move tasks" : "Delete area"}
          </Button>
        </AreaForm>
      </DialogContent>
    </Dialog>
  );
};

export default EditAreaDialog;

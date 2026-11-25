import type { LifeArea } from "@/apis/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUpdateLifeArea } from "@/hooks/reactQuery/useLifeAreasApi";

import AreaForm from "./AreaForm";
import type { LifeAreaFormValues } from "./constants";

type EditAreaDialogProps = { lifeArea: LifeArea; onClose: () => void; onDelete: () => void };

// Changes an area, or leads to the dialog that deletes it.
const EditAreaDialog = ({ lifeArea, onClose, onDelete }: EditAreaDialogProps) => {
  const { id, name, color, emoji, defaultSound } = lifeArea;
  const { mutate: updateLifeArea, isPending, error } = useUpdateLifeArea();

  const handleSubmit = (values: LifeAreaFormValues) =>
    updateLifeArea({ id, ...values }, { onSuccess: onClose });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit {name}</DialogTitle>
          <DialogDescription>Change the area’s name, colour, emoji or background sound.</DialogDescription>
        </DialogHeader>
        <AreaForm
          error={error?.message}
          initialValues={{ name, color, emoji, defaultSound }}
          isSubmitting={isPending}
          submitLabel="Save"
          onSubmit={handleSubmit}
        >
          <Button className="mr-auto" disabled={isPending} type="button" variant="ghost" onClick={onDelete}>
            Delete area
          </Button>
        </AreaForm>
      </DialogContent>
    </Dialog>
  );
};

export default EditAreaDialog;

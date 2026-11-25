import { useNavigate } from "react-router";

import type { LifeAreaResponse } from "@/apis/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreateLifeArea } from "@/hooks/reactQuery/useLifeAreasApi";
import { getTaskListPath } from "@/utils";

import AreaForm from "./AreaForm";
import { INITIAL_FORM_VALUES, type LifeAreaFormValues } from "./constants";

type NewAreaDialogProps = { onClose: () => void };

// Adds an area, then opens it.
const NewAreaDialog = ({ onClose }: NewAreaDialogProps) => {
  const navigate = useNavigate();
  const { mutate: createLifeArea, isPending, error } = useCreateLifeArea();

  const handleCreated = ({ lifeArea }: LifeAreaResponse) => {
    onClose();
    navigate(getTaskListPath(lifeArea.id));
  };

  const handleSubmit = (values: LifeAreaFormValues) => createLifeArea(values, { onSuccess: handleCreated });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New area of life</DialogTitle>
          <DialogDescription>A part of your life to group tasks by.</DialogDescription>
        </DialogHeader>
        <AreaForm
          error={error?.message}
          initialValues={INITIAL_FORM_VALUES}
          isSubmitting={isPending}
          submitLabel="Add area"
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
};

export default NewAreaDialog;

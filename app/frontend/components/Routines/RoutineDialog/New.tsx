import { useNavigate } from "react-router";

import type { RoutineResponse } from "@/apis/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreateRoutine } from "@/hooks/reactQuery/useRoutinesApi";

import { getRoutinePath } from "../utils";
import { INITIAL_FORM_VALUES, type RoutineFormValues } from "./constants";
import RoutineForm from "./RoutineForm";
import { toRoutinePayload } from "./utils";

type NewRoutineDialogProps = { onClose: () => void };

// Adds a routine, then opens it.
const NewRoutineDialog = ({ onClose }: NewRoutineDialogProps) => {
  const navigate = useNavigate();
  const { mutate: createRoutine, isPending, error } = useCreateRoutine();

  const handleCreated = ({ routine }: RoutineResponse) => {
    onClose();
    navigate(getRoutinePath(routine.id));
  };

  const handleSubmit = (values: RoutineFormValues) =>
    createRoutine(toRoutinePayload(values), { onSuccess: handleCreated });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New routine</DialogTitle>
          <DialogDescription>Something you come back to, ready to start in one click.</DialogDescription>
        </DialogHeader>
        <RoutineForm
          error={error?.message}
          initialValues={INITIAL_FORM_VALUES}
          isSubmitting={isPending}
          submitLabel="Add routine"
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
};

export default NewRoutineDialog;

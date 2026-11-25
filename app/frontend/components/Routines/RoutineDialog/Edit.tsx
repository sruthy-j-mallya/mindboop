import type { Routine } from "@/apis/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUpdateRoutine } from "@/hooks/reactQuery/useRoutinesApi";

import type { RoutineFormValues } from "./constants";
import RoutineForm from "./RoutineForm";
import { toRoutineFormValues, toRoutinePayload } from "./utils";

type EditRoutineDialogProps = { routine: Routine; onClose: () => void };

const EditRoutineDialog = ({ routine, onClose }: EditRoutineDialogProps) => {
  const { mutate: updateRoutine, isPending, error } = useUpdateRoutine();

  const handleSubmit = (values: RoutineFormValues) =>
    updateRoutine({ id: routine.id, ...toRoutinePayload(values) }, { onSuccess: onClose });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit {routine.title}</DialogTitle>
          <DialogDescription>
            Change how long it runs, how it looks and sounds, or its reminder.
          </DialogDescription>
        </DialogHeader>
        <RoutineForm
          error={error?.message}
          initialValues={toRoutineFormValues(routine)}
          isSubmitting={isPending}
          submitLabel="Save"
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditRoutineDialog;

import { toast } from "sonner";

import type { ApiError } from "@/apis/axios";
import type { Task } from "@/apis/types";
import type { SchedulePayload } from "@/components/commons/SchedulePicker/types";
import UndoLabel from "@/components/commons/UndoLabel";
import { UNDO_TOAST_DURATION } from "@/constants";
import { useUpdateTask } from "@/hooks/reactQuery/useTasksApi";

// Gives an overdue task another date, then offers to undo it in a toast. The row goes once the task isn't overdue, so
// promises (mutateAsync) are used: they settle even after it has unmounted, which mutate's callbacks wouldn't.
const useRescheduleTask = ({ id, title, isDuration, isAllDay, startsAt, endsAt }: Task) => {
  const { mutateAsync: updateTask, isPending, error } = useUpdateTask();
  // Apart from the rescheduling, so a failed undo shows only in its toast.
  const { mutateAsync: restoreSchedule } = useUpdateTask();

  const handleUndoFailed = (undoError: ApiError) => toast.error(undoError.message);

  const handleUndo = () =>
    restoreSchedule({ id, isDuration, isAllDay, startsAt, endsAt }).catch(handleUndoFailed);

  // A failed save shows through `error`, so the rejection needs no handling here.
  const rescheduleTask = (schedule: SchedulePayload) => {
    const handleRescheduled = () =>
      toast(`Rescheduled “${title}”`, {
        action: { label: <UndoLabel />, onClick: handleUndo },
        duration: UNDO_TOAST_DURATION,
      });

    void updateTask({ id, ...schedule }).then(handleRescheduled, () => undefined);
  };

  return { rescheduleTask, isRescheduling: isPending, error };
};

export default useRescheduleTask;

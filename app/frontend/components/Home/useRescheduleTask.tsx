import { toast } from "sonner";

import type { Task } from "@/apis/types";
import type { SchedulePayload } from "@/components/commons/SchedulePicker/types";
import { useUpdateTask } from "@/hooks/reactQuery/useTasksApi";

// Gives an overdue task another date, then confirms it in a toast. There is no undo: the old schedule is in the past,
// which the server no longer accepts. The row goes once the task isn't overdue, so a promise (mutateAsync) is used: it
// settles even after the row has unmounted, which mutate's callbacks wouldn't.
const useRescheduleTask = ({ id, title }: Task) => {
  const { mutateAsync: updateTask, isPending, error } = useUpdateTask();

  const handleRescheduled = () => toast(`Rescheduled “${title}”`);

  // A failed save shows through `error`, so the rejection needs no handling here.
  const rescheduleTask = (schedule: SchedulePayload) =>
    void updateTask({ id, ...schedule }).then(handleRescheduled, () => undefined);

  return { rescheduleTask, isRescheduling: isPending, error };
};

export default useRescheduleTask;

import { toast } from "sonner";

import type { ApiError } from "@/apis/axios";
import UndoLabel from "@/components/commons/UndoLabel";
import { UNDO_TOAST_DURATION } from "@/constants";
import { useRestoreTimeLog } from "@/hooks/reactQuery/useTimeLogRestorationsApi";
import { useDeleteTimeLog } from "@/hooks/reactQuery/useTimeLogsApi";

import type { TimeLogEvent } from "../types";

// Deletes a session logged by mistake, then offers to undo it in a toast. The popover closes at once, so the promises
// (mutateAsync) carry the follow-up: they settle after it unmounts, which mutate's callbacks wouldn't.
const useDeleteTimeLogWithUndo = () => {
  const { mutateAsync: deleteTimeLog } = useDeleteTimeLog();
  const { mutateAsync: restoreTimeLog } = useRestoreTimeLog();

  const handleFailed = (error: ApiError) => toast.error(error.message);

  return ({ id, title }: Pick<TimeLogEvent, "id" | "title">) => {
    const handleUndo = () => restoreTimeLog(id).catch(handleFailed);

    const handleDeleted = () =>
      toast(`Deleted “${title}”`, {
        action: { label: <UndoLabel />, onClick: handleUndo },
        duration: UNDO_TOAST_DURATION,
      });

    return deleteTimeLog(id).then(handleDeleted, handleFailed);
  };
};

export default useDeleteTimeLogWithUndo;

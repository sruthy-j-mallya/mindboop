import { generatePath, useNavigate } from "react-router";
import { toast } from "sonner";

import type { ApiError } from "@/apis/axios";
import type { SchedulePayload } from "@/components/commons/SchedulePicker/types";
import UndoLabel from "@/components/commons/UndoLabel";
import { UNDO_TOAST_DURATION } from "@/constants";
import { useStartCuriosityTime } from "@/hooks/reactQuery/useCuriosityTimesApi";
import { useConvertParkingLotItem } from "@/hooks/reactQuery/useParkingLotItemConversionsApi";
import { useRestoreParkingLotItem } from "@/hooks/reactQuery/useParkingLotItemRestorationsApi";
import { useDeleteParkingLotItem, useUpdateParkingLotItem } from "@/hooks/reactQuery/useParkingLotItemsApi";
import routes from "@/routes";
import { requestNotificationPermission } from "@/utils/notifications";

// The actions on one parked thought. All but Look into it move the item off its tab, so `isBusy` stays true after
// their success until the refreshed list drops it. Let it go and Mark addressed toast with Undo; Add as task links to
// the new task. The promises (mutateAsync) settle even once the row has unmounted, which mutate's callbacks wouldn't.
const useItemActions = (id: string) => {
  const navigate = useNavigate();
  const convert = useConvertParkingLotItem();
  const update = useUpdateParkingLotItem();
  const destroy = useDeleteParkingLotItem();
  const startCuriosity = useStartCuriosityTime();
  const { mutateAsync: restoreItem } = useRestoreParkingLotItem();
  const leavingMutations = [convert, update, destroy];
  const isBusy =
    startCuriosity.isPending || leavingMutations.some(({ isPending, isSuccess }) => isPending || isSuccess);
  const error = [...leavingMutations, startCuriosity].find(({ error }) => error)?.error ?? null;

  const handleUndoFailed = (undoError: ApiError) => toast.error(undoError.message);

  const handleConverted = ({ parkingLotItem: { taskId } }: { parkingLotItem: { taskId: string | null } }) => {
    if (!taskId) return;

    const handleOpen = () => navigate(generatePath(routes.inbox.show, { taskId }));
    toast("Added to your Inbox", { action: { label: "Open", onClick: handleOpen } });
  };

  const handleAddressed = () => {
    const handleUndo = () => update.mutateAsync({ id, status: "parked" }).catch(handleUndoFailed);
    toast("Marked as addressed", {
      action: { label: <UndoLabel />, onClick: handleUndo },
      duration: UNDO_TOAST_DURATION,
    });
  };

  const handleLetGo = () => {
    const handleUndo = () => restoreItem(id).catch(handleUndoFailed);
    toast("Let go", {
      action: { label: <UndoLabel />, onClick: handleUndo },
      duration: UNDO_TOAST_DURATION,
    });
  };

  // A failed action shows through `error`, so the rejections need no handling here.
  const ignore = () => undefined;

  // Asked on the click, since browsers only show the permission prompt after a user gesture.
  const lookIntoIt = () => {
    requestNotificationPermission();

    return startCuriosity.mutateAsync(id).then(ignore, ignore);
  };

  const addAsTask = (schedule: SchedulePayload) =>
    convert.mutateAsync({ parkingLotItemId: id, ...schedule }).then(handleConverted, ignore);
  const markAddressed = () => update.mutateAsync({ id, status: "addressed" }).then(handleAddressed, ignore);
  const parkAgain = () => update.mutateAsync({ id, status: "parked" }).then(ignore, ignore);
  const letGo = () => destroy.mutateAsync(id).then(handleLetGo, ignore);

  return { lookIntoIt, addAsTask, markAddressed, parkAgain, letGo, isBusy, error };
};

export default useItemActions;

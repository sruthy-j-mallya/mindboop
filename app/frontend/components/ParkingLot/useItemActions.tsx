import { generatePath, useNavigate } from "react-router";
import { toast } from "sonner";

import type { ApiError } from "@/apis/axios";
import UndoLabel from "@/components/commons/UndoLabel";
import { UNDO_TOAST_DURATION } from "@/constants";
import { useConvertParkingLotItem } from "@/hooks/reactQuery/useParkingLotItemConversionsApi";
import { useRestoreParkingLotItem } from "@/hooks/reactQuery/useParkingLotItemRestorationsApi";
import { useDeleteParkingLotItem, useUpdateParkingLotItem } from "@/hooks/reactQuery/useParkingLotItemsApi";
import routes from "@/routes";

// The actions on one parked thought. Each one moves the item off its tab, so `isBusy` stays true after a success
// until the refreshed list drops it. Discard and Mark addressed toast with Undo; Add as task links to the new task.
// The promises (mutateAsync) settle even once the row has unmounted, which mutate's callbacks wouldn't.
const useItemActions = (id: string) => {
  const navigate = useNavigate();
  const convert = useConvertParkingLotItem();
  const update = useUpdateParkingLotItem();
  const destroy = useDeleteParkingLotItem();
  const { mutateAsync: restoreItem } = useRestoreParkingLotItem();
  const mutations = [convert, update, destroy];
  const isBusy = mutations.some(({ isPending, isSuccess }) => isPending || isSuccess);
  const error = mutations.find(({ error }) => error)?.error ?? null;

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

  const handleDiscarded = () => {
    const handleUndo = () => restoreItem(id).catch(handleUndoFailed);
    toast("Thought discarded", {
      action: { label: <UndoLabel />, onClick: handleUndo },
      duration: UNDO_TOAST_DURATION,
    });
  };

  // A failed action shows through `error`, so the rejections need no handling here.
  const ignore = () => undefined;

  const addAsTask = () => convert.mutateAsync(id).then(handleConverted, ignore);
  const markAddressed = () => update.mutateAsync({ id, status: "addressed" }).then(handleAddressed, ignore);
  const parkAgain = () => update.mutateAsync({ id, status: "parked" }).then(ignore, ignore);
  const discard = () => destroy.mutateAsync(id).then(handleDiscarded, ignore);

  return { addAsTask, markAddressed, parkAgain, discard, isBusy, error };
};

export default useItemActions;

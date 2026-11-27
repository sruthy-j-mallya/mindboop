import { toast } from "sonner";

import type { ApiError } from "@/apis/axios";
import UndoLabel from "@/components/commons/UndoLabel";
import { UNDO_TOAST_DURATION } from "@/constants";
import {
  useDeleteParkingLotItemBatch,
  useUpdateParkingLotItemBatch,
} from "@/hooks/reactQuery/useParkingLotItemBatchesApi";
import { useRestoreParkingLotItemBatch } from "@/hooks/reactQuery/useParkingLotItemBatchRestorationsApi";

import { countThoughts } from "./utils";

// Mark addressed and Let it go on several thoughts at once, each with an Undo toast like the row actions. The promises
// resolve once the lists have refreshed, so `isPending` covers the whole move. A failed action shows through `error`.
const useBulkActions = () => {
  const {
    mutateAsync: updateItems,
    isPending: isUpdating,
    error: updateError,
    reset: resetUpdate,
  } = useUpdateParkingLotItemBatch();
  const {
    mutateAsync: deleteItems,
    isPending: isDeleting,
    error: deleteError,
    reset: resetDelete,
  } = useDeleteParkingLotItemBatch();
  const { mutateAsync: restoreItems } = useRestoreParkingLotItemBatch();

  const handleUndoFailed = (undoError: ApiError) => toast.error(undoError.message);

  const toastWithUndo = (message: string, handleUndo: () => void) =>
    toast(message, { action: { label: <UndoLabel />, onClick: handleUndo }, duration: UNDO_TOAST_DURATION });

  // Each action clears the other's error, so only the latest failure shows.
  const markAddressed = (ids: string[]) => {
    resetDelete();
    const handleUndo = () => updateItems({ ids, status: "parked" }).catch(handleUndoFailed);
    const handleAddressed = () =>
      toastWithUndo(`${countThoughts(ids.length)} marked as addressed`, handleUndo);

    return updateItems({ ids, status: "addressed" }).then(handleAddressed);
  };

  const letGo = (ids: string[]) => {
    resetUpdate();
    const handleUndo = () => restoreItems(ids).catch(handleUndoFailed);
    const handleLetGo = () => toastWithUndo(`Let go of ${countThoughts(ids.length)}`, handleUndo);

    return deleteItems(ids).then(handleLetGo);
  };

  return { markAddressed, letGo, isPending: isUpdating || isDeleting, error: updateError ?? deleteError };
};

export default useBulkActions;

import { useState } from "react";

import type { LifeArea } from "@/apis/types";
import ConfirmDeleteButton from "@/components/commons/ConfirmDeleteButton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLifeAreas } from "@/hooks/reactQuery/useLifeAreasApi";
import { useTasks } from "@/hooks/reactQuery/useTasksApi";
import useInitialFocus from "@/hooks/useInitialFocus";

import { INBOX_TARGET } from "../constants";
import type { DropTarget } from "../types";
import useDeleteArea from "../useDeleteArea";
import TargetField from "./TargetField";
import { getDeleteDescription } from "./utils";

type DeleteAreaDialogProps = { lifeArea: LifeArea; onClose: () => void };

// Asks before deleting an area and, if it has uncompleted tasks, which list to move them to: the Inbox or another area.
// Completed tasks stay with the deleted area.
const DeleteAreaDialog = ({ lifeArea, onClose }: DeleteAreaDialogProps) => {
  const { id, name } = lifeArea;
  const [target, setTarget] = useState<DropTarget>(INBOX_TARGET);
  const { deleteArea, isDeleting, error } = useDeleteArea(lifeArea, onClose);
  const { data: lifeAreas = [] } = useLifeAreas();
  // Off while deleting, so the question doesn't change as the area empties.
  const { data: taskList, isFetching } = useTasks(
    { isCompleted: false, lifeAreaId: id },
    { enabled: !isDeleting },
  );
  // When the tasks can't be loaded, there may be some, so it still asks.
  const hasTasks = !isFetching && taskList?.tasksCount !== 0;
  const targets = [
    INBOX_TARGET,
    ...lifeAreas.filter((area) => area.id !== id).map((area) => ({ lifeAreaId: area.id, name: area.name })),
  ];
  const hasChoice = hasTasks && targets.length > 1;
  const { ref: deleteButtonRef, handleOpenAutoFocus } = useInitialFocus<HTMLButtonElement>();

  const handleDelete = () => deleteArea(hasTasks ? target : null);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="gap-6 rounded-2xl p-8 sm:max-w-md" onOpenAutoFocus={handleOpenAutoFocus}>
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl">Delete {name}?</DialogTitle>
          <DialogDescription className="text-base">
            {getDeleteDescription({ isChecking: isFetching, hasTasks, hasChoice })}
          </DialogDescription>
        </DialogHeader>
        {hasChoice && (
          <TargetField isDisabled={isDeleting} target={target} targets={targets} onChange={setTarget} />
        )}
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error.message}
          </p>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Button disabled={isDeleting} size="lg" type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <ConfirmDeleteButton
            ref={deleteButtonRef}
            isDisabled={isDeleting || isFetching}
            label="Delete area"
            onClick={handleDelete}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAreaDialog;

import { useState } from "react";

import { Trash2 } from "lucide-react";

import type { Task } from "@/apis/types";
import { Button } from "@/components/ui/button";

import DeleteTaskDialog from "./DeleteTaskDialog";

type DeleteTaskButtonProps = { task: Task };

// Asks before deleting from the pane, where the button sits among the task's own controls.
const DeleteTaskButton = ({ task }: DeleteTaskButtonProps) => {
  const [showDialog, setShowDialog] = useState(false);

  const handleOpen = () => setShowDialog(true);

  const handleClose = () => setShowDialog(false);

  return (
    <>
      <Button
        aria-label="Delete task"
        className="shrink-0 text-muted-foreground hover:text-destructive"
        size="icon-sm"
        type="button"
        variant="ghost"
        onClick={handleOpen}
      >
        <Trash2 />
      </Button>
      {showDialog && <DeleteTaskDialog task={task} onClose={handleClose} />}
    </>
  );
};

export default DeleteTaskButton;

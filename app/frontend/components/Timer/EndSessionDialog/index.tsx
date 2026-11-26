import { useState } from "react";

import { Footprints, PartyPopper } from "lucide-react";

import type { EndTimeLogOptions } from "@/apis/types";
import BailDialog from "@/components/commons/BailDialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const CHOICE_CLASS_NAME = "h-auto justify-start gap-3 rounded-xl px-4 py-3 text-left whitespace-normal";

type EndSessionDialogProps = EndTimeLogOptions & {
  timeLogId: string;
  onFinish: () => void;
  onClose: () => void;
};

// Ending a session and finishing its task are separate questions: the session has ended by now, so this asks the
// second one. Not yet leaves breadcrumbs (the bail-out); Yes completes the session and its task.
const EndSessionDialog = ({ timeLogId, discardOverrun, onFinish, onClose }: EndSessionDialogProps) => {
  const [showBailDialog, setShowBailDialog] = useState(false);

  const handleNotYet = () => setShowBailDialog(true);

  if (showBailDialog)
    return <BailDialog discardOverrun={discardOverrun} timeLogId={timeLogId} onClose={onClose} />;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="gap-6 rounded-2xl p-8 sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl">Is the task finished?</DialogTitle>
          <DialogDescription className="text-base">
            Nice session. The time is logged either way.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Button
            className={CHOICE_CLASS_NAME}
            size="lg"
            type="button"
            variant="outline"
            onClick={handleNotYet}
          >
            <Footprints className="size-5" />
            <span className="grid">
              <span className="font-semibold">Not yet</span>
              <span className="text-sm font-normal text-muted-foreground">
                Leave breadcrumbs for next time
              </span>
            </span>
          </Button>
          <Button className={CHOICE_CLASS_NAME} size="lg" type="button" variant="outline" onClick={onFinish}>
            <PartyPopper className="size-5" />
            <span className="grid">
              <span className="font-semibold">Yes, it’s finished</span>
              <span className="text-sm font-normal text-muted-foreground">Mark the task done</span>
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EndSessionDialog;

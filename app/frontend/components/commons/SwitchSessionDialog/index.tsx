import { useState } from "react";

import { LogOut, PartyPopper, X } from "lucide-react";

import type { TimeLog } from "@/apis/types";
import BailDialog from "@/components/commons/BailDialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DISCARD_BELOW_MINUTES } from "@/constants";
import { useCompleteTimeLog } from "@/hooks/reactQuery/useTimeLogCompletionsApi";
import { useDeleteTimeLog } from "@/hooks/reactQuery/useTimeLogsApi";
import { isTooShortToKeep } from "@/utils/timeLogs";

import RunningSession from "./RunningSession";

type SwitchSessionDialogProps = { timeLog: TimeLog; onClose: () => void; onSwitch: () => void };

// Only one session runs at a time, so starting another task first ends the one on the clock: bailed out of (with
// breadcrumbs) or marked as done. One too short to log can only be discarded. `onSwitch` runs once it has ended.
const SwitchSessionDialog = ({ timeLog, onClose, onSwitch }: SwitchSessionDialogProps) => {
  // Decided on opening, so the buttons don't change when the elapsed time crosses the limit.
  const [isTooShort] = useState(() => isTooShortToKeep(timeLog, Date.now()));
  const [showBailDialog, setShowBailDialog] = useState(false);
  const { mutate: completeTimeLog, isPending: isCompleting, error: completionError } = useCompleteTimeLog();
  const { mutate: deleteTimeLog, isPending: isDiscarding, error: discardError } = useDeleteTimeLog();
  const isEnding = isCompleting || isDiscarding;
  // A routine's session has no task to leave breadcrumbs on, so it's marked as done or discarded instead.
  const canBail = !timeLog.routineId;
  const onTheClock = timeLog.routineId ? "A routine" : "Another task";
  const error = completionError ?? discardError;

  const handleBail = () => setShowBailDialog(true);
  const handleDone = () => completeTimeLog({ timeLogId: timeLog.id }, { onSuccess: onSwitch });
  const handleDiscard = () => deleteTimeLog(timeLog.id, { onSuccess: onSwitch });

  if (showBailDialog) return <BailDialog timeLogId={timeLog.id} onBailedOut={onSwitch} onClose={onClose} />;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="gap-6 rounded-2xl p-8 sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl">Switch tasks?</DialogTitle>
          <DialogDescription className="text-base">
            {isTooShort
              ? `You've focused for under ${DISCARD_BELOW_MINUTES} minutes, too short to log. Switching discards this session.`
              : `${onTheClock} is on the clock. Wrap it up to start this one.`}
          </DialogDescription>
        </DialogHeader>
        <RunningSession timeLog={timeLog} />
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error.message}
          </p>
        )}
        {isTooShort ? (
          <Button disabled={isEnding} size="lg" type="button" variant="destructive" onClick={handleDiscard}>
            Discard and switch
          </Button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {canBail ? (
              <Button disabled={isEnding} size="lg" type="button" variant="outline" onClick={handleBail}>
                <LogOut />
                Bail out
              </Button>
            ) : (
              <Button disabled={isEnding} size="lg" type="button" variant="outline" onClick={handleDiscard}>
                <X />
                Discard
              </Button>
            )}
            <Button disabled={isEnding} size="lg" type="button" onClick={handleDone}>
              <PartyPopper />
              Mark as done
            </Button>
          </div>
        )}
        <Button disabled={isEnding} size="lg" type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SwitchSessionDialog;

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DISCARD_BELOW_MINUTES } from "@/constants";
import { useDeleteTimeLog } from "@/hooks/reactQuery/useTimeLogsApi";

type DiscardDialogProps = {
  timeLogId: string;
  // Chosen by the user (a routine's session can go at any time), rather than forced by a session too short to log.
  isChosen?: boolean;
  onClose: () => void;
};

const DiscardDialog = ({ timeLogId, isChosen = false, onClose }: DiscardDialogProps) => {
  const { mutate: deleteTimeLog, isPending, error } = useDeleteTimeLog();

  const handleDiscard = () => deleteTimeLog(timeLogId, { onSuccess: onClose });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="gap-6 rounded-2xl p-8 sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl">Discard this timer?</DialogTitle>
          <DialogDescription className="text-base">
            {isChosen
              ? "This session won’t be saved or counted. No harm done: the routine is here whenever you want it."
              : `You've focused for under ${DISCARD_BELOW_MINUTES} minutes, which is too short to log. Ending now discards the timer and it won't be saved.`}
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error.message}
          </p>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Button disabled={isPending} size="lg" type="button" variant="outline" onClick={onClose}>
            Keep going
          </Button>
          <Button disabled={isPending} size="lg" type="button" variant="destructive" onClick={handleDiscard}>
            Discard timer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DiscardDialog;

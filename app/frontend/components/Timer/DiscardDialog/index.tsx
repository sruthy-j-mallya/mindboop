import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDeleteTimeLog } from "@/hooks/reactQuery/useTimeLogsApi";

import { DISCARD_BELOW_MINUTES } from "../constants";

type DiscardDialogProps = { timeLogId: string; onClose: () => void };

const DiscardDialog = ({ timeLogId, onClose }: DiscardDialogProps) => {
  const { mutate: deleteTimeLog, isPending, error } = useDeleteTimeLog();

  const handleDiscard = () => deleteTimeLog(timeLogId, { onSuccess: onClose });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="gap-6 rounded-2xl p-8 sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl">Discard this timer?</DialogTitle>
          <DialogDescription className="text-base">
            You&apos;ve been at this for under {DISCARD_BELOW_MINUTES} minutes, so bailing now discards the
            timer and it won&apos;t be saved.
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

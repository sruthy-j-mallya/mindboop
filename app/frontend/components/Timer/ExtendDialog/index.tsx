import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useExtendTimeLog } from "@/hooks/reactQuery/useTimeLogExtensionsApi";

import { EXTENSION_OPTIONS } from "./constants";

type ExtendDialogProps = { timeLogId: string; minutesLeft: number; onClose: () => void };

const ExtendDialog = ({ timeLogId, minutesLeft, onClose }: ExtendDialogProps) => {
  const { mutate: extendTimeLog, isPending, error } = useExtendTimeLog();

  const handleExtend = (minutes: number) => extendTimeLog({ timeLogId, minutes }, { onSuccess: onClose });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="gap-6 rounded-2xl p-8 sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl">Extend carefully</DialogTitle>
          <DialogDescription className="text-base">
            Riding a wave of energy? You have <strong className="text-foreground">{minutesLeft} min</strong>{" "}
            of extension left this session.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error.message}
          </p>
        )}
        <div className="grid grid-cols-3 gap-2">
          {EXTENSION_OPTIONS.map((minutes) => {
            const isOverLimit = minutes > minutesLeft;

            return (
              <Button
                key={minutes}
                className={isOverLimit ? "line-through" : undefined}
                disabled={isPending || isOverLimit}
                size="lg"
                type="button"
                variant={isOverLimit ? "outline" : "default"}
                onClick={() => handleExtend(minutes)}
              >
                +{minutes}
              </Button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExtendDialog;

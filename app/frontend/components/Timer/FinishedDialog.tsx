import { useEffect, useState } from "react";

import { cn } from "cn";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useParkingLotItems } from "@/hooks/reactQuery/useParkingLotItemsApi";
import routes from "@/routes";

import { FINISHED_DIALOG_FADE_DELAY } from "./constants";

type FinishedDialogProps = { isFinishedEarly: boolean; timeLogId: string; onClose: () => void };

// Points to the Parking lot while thoughts parked during this session are still waiting there. Otherwise there's
// nothing to move on to, so the dialog fades away by itself, waiting while the pointer is over it.
const FinishedDialog = ({ isFinishedEarly, timeLogId, onClose }: FinishedDialogProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const { data, isPending } = useParkingLotItems({ status: "parked", timeLogId });
  const parkedCount = data?.parkingLotItemsCount ?? 0;
  const isFadingAway = !isPending && parkedCount === 0;
  const isFadeDue = isFadingAway && !isHovered;

  useEffect(() => {
    if (!isFadeDue) return undefined;

    const timeout = setTimeout(() => setIsOpen(false), FINISHED_DIALOG_FADE_DELAY);

    return () => clearTimeout(timeout);
  }, [isFadeDue]);

  const handlePointerEnter = () => setIsHovered(true);
  const handlePointerLeave = () => setIsHovered(false);

  const description = <DialogDescription>You did the thing you said you&apos;d do.</DialogDescription>;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Closing only starts the fade-out; the parent drops the dialog once it has finished. */}
      <DialogContent
        className={cn(
          "gap-6 rounded-2xl p-8 sm:max-w-md",
          isFadingAway && "data-[state=closed]:duration-700",
        )}
        onCloseAutoFocus={onClose}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <DialogHeader className="text-left">
          <DialogTitle className="text-2xl">
            {isFinishedEarly ? "Finished early!" : "Finished!"} <span aria-hidden="true">🎉</span>
          </DialogTitle>
          {!isFinishedEarly && description}
        </DialogHeader>
        {isFinishedEarly && (
          <div className="flex flex-col items-center gap-1 rounded-2xl bg-brand-yellow/25 p-6 text-center">
            <span aria-hidden="true" className="text-4xl">
              ✨
            </span>
            <p className="mt-2 text-lg font-semibold">+1 early-finish boost</p>
            {description}
          </div>
        )}
        {parkedCount > 0 && (
          <Button asChild size="lg">
            <Link to={routes.parkingLot}>Review parking lot · {parkedCount}</Link>
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FinishedDialog;

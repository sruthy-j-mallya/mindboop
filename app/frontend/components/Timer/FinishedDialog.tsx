import { Upload } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import routes from "@/routes";

type FinishedDialogProps = { isFinishedEarly: boolean; onClose: () => void };

const FinishedDialog = ({ isFinishedEarly, onClose }: FinishedDialogProps) => {
  const description = <DialogDescription>You did the thing you said you&apos;d do.</DialogDescription>;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="gap-6 rounded-2xl p-8 sm:max-w-md">
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
        <Button size="lg" type="button" variant="outline">
          <Upload />
          Add a progress screenshot (optional)
        </Button>
        <Button asChild size="lg">
          <Link to={routes.root}>Move on to next</Link>
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default FinishedDialog;

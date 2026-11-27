import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import CaptureForm from "./CaptureForm";

type QuickCaptureProps = { isOpen: boolean; onOpenChange: (isOpen: boolean) => void };

// Adds a task to the Inbox from any page, to sort out later. Opened from the sidebar or its shortcut.
const QuickCapture = ({ isOpen, onOpenChange }: QuickCaptureProps) => {
  const handleClose = () => onOpenChange(false);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="top-[12%] translate-y-0 sm:max-w-xl">
        <DialogHeader className="text-left">
          <DialogTitle>New task</DialogTitle>
          <DialogDescription>It goes to your Inbox, so you can sort it out later.</DialogDescription>
        </DialogHeader>
        <CaptureForm onClose={handleClose} />
      </DialogContent>
    </Dialog>
  );
};

export default QuickCapture;

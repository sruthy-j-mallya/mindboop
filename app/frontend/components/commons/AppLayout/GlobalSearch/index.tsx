import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

import SearchPanel from "./SearchPanel";

type GlobalSearchProps = { isOpen: boolean; onOpenChange: (isOpen: boolean) => void };

// Opened from the sidebar, on any page. It stays near the top of the screen, so it grows downwards as matches come in.
const GlobalSearch = ({ isOpen, onOpenChange }: GlobalSearchProps) => {
  const handleClose = () => onOpenChange(false);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="top-[12%] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-xl"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Search tasks</DialogTitle>
        <DialogDescription className="sr-only">
          Finds open tasks in every list by title, description or step.
        </DialogDescription>
        <SearchPanel onClose={handleClose} />
      </DialogContent>
    </Dialog>
  );
};

export default GlobalSearch;

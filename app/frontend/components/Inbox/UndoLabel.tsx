import { Undo2 } from "lucide-react";

// The undo toast's action shows only the icon; the hidden text keeps "Undo" as the button's name. The icon passes
// presses to the button, since Sonner starts a swipe-to-dismiss on any press that doesn't land on a button.
const UndoLabel = () => (
  <>
    <Undo2 aria-hidden className="pointer-events-none size-4" />
    <span className="sr-only">Undo</span>
  </>
);

export default UndoLabel;

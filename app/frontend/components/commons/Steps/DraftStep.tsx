import { type FocusEvent, type KeyboardEvent, type MouseEvent, useRef, useState } from "react";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

type DraftStepProps = {
  onSave: (text: string) => void;
  onSaveAndContinue: (text: string) => void;
  onDiscard: () => void;
};

// A new step row, looking like the saved ones. It saves when focus leaves it with some text in it, and goes away when
// it's left empty.
const DraftStep = ({ onSave, onSaveAndContinue, onDiscard }: DraftStepProps) => {
  const [draft, setDraft] = useState("");
  // The row can blur as it unmounts, after Enter or Escape has already dealt with it.
  const isClosedRef = useRef(false);

  const close = (callback: () => void) => {
    isClosedRef.current = true;
    callback();
  };

  // Moving between the input and the discard button stays inside the row, so it isn't leaving it.
  const handleBlur = (event: FocusEvent<HTMLLIElement>) => {
    if (isClosedRef.current || event.currentTarget.contains(event.relatedTarget)) return;

    const text = draft.trim();
    close(() => (text ? onSave(text) : onDiscard()));
  };

  // Enter starts another step below instead of submitting the surrounding form.
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") close(onDiscard);
    if (event.key !== "Enter") return;

    event.preventDefault();
    const text = draft.trim();
    if (text) close(() => onSaveAndContinue(text));
  };

  // Keeps focus in the input while pressing, since Safari doesn't focus buttons on click and the row would blur and
  // save the text it's about to discard.
  const handleDiscardMouseDown = (event: MouseEvent<HTMLButtonElement>) => event.preventDefault();

  return (
    <li className="flex items-center gap-2 rounded-md bg-card py-1" onBlur={handleBlur}>
      {/* Holds the drag handle's place, so the new row lines up with the saved ones. */}
      <span aria-hidden className="-mr-1 w-4 shrink-0" />
      <Checkbox disabled aria-hidden className="border-muted-foreground/50" tabIndex={-1} />
      <Input
        autoFocus
        aria-label="New step"
        autoComplete="off"
        className="h-8 flex-1"
        placeholder="Add a step"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      <Button
        aria-label="Discard new step"
        className="text-muted-foreground"
        size="icon-sm"
        type="button"
        variant="ghost"
        onClick={() => close(onDiscard)}
        onMouseDown={handleDiscardMouseDown}
      >
        <Trash2 />
      </Button>
    </li>
  );
};

export default DraftStep;

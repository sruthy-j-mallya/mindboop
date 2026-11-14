import { type KeyboardEvent, useRef, useState } from "react";

import { Input } from "@/components/ui/input";

type EditStepProps = {
  text: string;
  onSave: (text: string) => void;
  onDismiss: () => void;
  onContinue: () => void;
};

const EditStep = ({ text, onSave, onDismiss, onContinue }: EditStepProps) => {
  const [draft, setDraft] = useState(text);
  // The input can blur as it unmounts, after Enter has already saved it.
  const isSavedRef = useRef(false);

  const handleSave = () => {
    if (isSavedRef.current) return;

    isSavedRef.current = true;
    onSave(draft.trim());
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") onDismiss();
    if (event.key !== "Enter") return;

    // Enter saves the step and starts a new one below it, instead of submitting the surrounding form.
    event.preventDefault();
    handleSave();
    onContinue();
  };

  return (
    <Input
      autoFocus
      aria-label="Step text"
      autoComplete="off"
      className="h-8 flex-1"
      value={draft}
      onBlur={handleSave}
      onChange={(event) => setDraft(event.target.value)}
      onFocus={(event) => event.target.select()}
      onKeyDown={handleKeyDown}
    />
  );
};

export default EditStep;

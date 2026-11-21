import { type KeyboardEvent, useRef, useState } from "react";

import StepTextarea from "./StepTextarea";

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

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Escape") onDismiss();
    if (event.key !== "Enter") return;

    // Enter saves the step and starts a new one below it, instead of submitting the surrounding form.
    event.preventDefault();
    handleSave();
    onContinue();
  };

  return (
    <StepTextarea
      autoFocus
      aria-label="Step text"
      value={draft}
      onBlur={handleSave}
      onValueChange={setDraft}
      onFocus={({ target }) => target.setSelectionRange(target.value.length, target.value.length)}
      onKeyDown={handleKeyDown}
    />
  );
};

export default EditStep;

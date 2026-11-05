import { type KeyboardEvent, useState } from "react";

import { Input } from "@/components/ui/input";

type EditStepProps = {
  text: string;
  onSave: (text: string) => void;
  onDismiss: () => void;
};

const EditStep = ({ text, onSave, onDismiss }: EditStepProps) => {
  const [draft, setDraft] = useState(text);

  const handleSave = () => onSave(draft.trim());

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") onDismiss();
    if (event.key !== "Enter") return;

    // Enter saves the step here instead of submitting the surrounding form.
    event.preventDefault();
    handleSave();
    onDismiss();
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

import { type KeyboardEvent, type Ref, useState } from "react";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AddStepProps = {
  buttonRef: Ref<HTMLButtonElement>;
  onAdd: (text: string) => void;
};

const AddStep = ({ buttonRef, onAdd }: AddStepProps) => {
  const [draft, setDraft] = useState("");

  const handleAdd = () => {
    const text = draft.trim();
    if (!text) return;

    onAdd(text);
    setDraft("");
  };

  // Enter adds the step here instead of submitting the surrounding form.
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;

    event.preventDefault();
    handleAdd();
  };

  return (
    <div className="flex gap-2">
      <Input
        aria-label="New step"
        autoComplete="off"
        placeholder="Add a step and press Enter"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      <Button
        ref={buttonRef}
        aria-label="Add step"
        className="bg-muted"
        size="icon"
        type="button"
        variant="ghost"
        onClick={handleAdd}
      >
        <Plus />
      </Button>
    </div>
  );
};

export default AddStep;

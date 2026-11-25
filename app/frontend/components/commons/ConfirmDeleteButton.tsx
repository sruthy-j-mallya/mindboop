import type { KeyboardEvent, Ref } from "react";

import { Button } from "@/components/ui/button";

type ConfirmDeleteButtonProps = {
  ref: Ref<HTMLButtonElement>;
  isDisabled: boolean;
  label: string;
  onClick: () => void;
};

// The button that confirms a deletion. It's focused as its dialog opens, so it shows its focus even after a click, and
// it's disabled through `aria-disabled`, which lets it keep the focus.
const ConfirmDeleteButton = ({ ref, isDisabled, label, onClick }: ConfirmDeleteButtonProps) => {
  const handleClick = () => {
    if (!isDisabled) onClick();
  };

  // Keeps an Enter still held from opening the dialog from confirming it too.
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.repeat && event.key === "Enter") event.preventDefault();
  };

  return (
    <Button
      ref={ref}
      aria-disabled={isDisabled}
      className="focus:ring-[3px] focus:ring-destructive/20 aria-disabled:cursor-default aria-disabled:opacity-50 dark:focus:ring-destructive/40"
      size="lg"
      type="button"
      variant="destructive"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {label}
    </Button>
  );
};

export default ConfirmDeleteButton;

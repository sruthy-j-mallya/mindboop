import { type ChangeEvent, type KeyboardEvent, useState } from "react";

import { cn } from "cn";

type TitleInputProps = {
  title: string;
  label: string;
  className?: string;
  isSelected?: boolean;
  onFocus?: () => void;
  onSave: (title: string) => void;
};

// A task's title as a field that reads as plain text, growing to wrap long titles. Enter or leaving it saves; Escape puts
// the title back.
const TitleInput = ({ title, label, className, isSelected = false, onFocus, onSave }: TitleInputProps) => {
  // Null while nothing has been typed, so the input follows the saved title until an edit starts.
  const [draft, setDraft] = useState<string | null>(null);

  const handleSave = () => {
    if (draft === null) return;

    onSave(draft.trim());
    setDraft(null);
  };

  // A title is one line, even when pasted text has line breaks; it only wraps to fit.
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) =>
    setDraft(event.target.value.replace(/[\r\n]+/g, " "));

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Escape") setDraft(null);
    if (event.key !== "Enter") return;

    event.preventDefault();
    handleSave();
  };

  return (
    <textarea
      aria-current={isSelected ? "page" : undefined}
      aria-label={label}
      autoComplete="off"
      className={cn("field-sizing-content resize-none bg-transparent wrap-anywhere outline-none", className)}
      rows={1}
      value={draft ?? title}
      onBlur={handleSave}
      onChange={handleChange}
      onFocus={onFocus}
      onKeyDown={handleKeyDown}
    />
  );
};

export default TitleInput;

import {
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { cn } from "cn";

import LinkifiedText from "@/components/commons/LinkifiedText";
import { hasLinks } from "@/components/commons/LinkifiedText/utils";

type TitleInputProps = {
  title: string;
  label: string;
  className?: string;
  isSelected?: boolean;
  onFocus?: () => void;
  onSave: (title: string) => void;
};

// A task's title as a field that reads as plain text, growing to wrap long titles. Enter or leaving it saves; Escape puts
// the title back. A title with a web address in it shows the address as a link until the field is entered: clicking the
// link opens it in a new tab, clicking anywhere else edits.
const TitleInput = ({ title, label, className, isSelected = false, onFocus, onSave }: TitleInputProps) => {
  // Null while nothing has been typed, so the input follows the saved title until an edit starts.
  const [draft, setDraft] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const showLinks = !isEditing && draft === null && hasLinks(title);

  // Coming from the links view, the field takes focus with the caret at the end, as if it had been clicked.
  useEffect(() => {
    const input = inputRef.current;
    if (!isEditing || !input || document.activeElement === input) return;

    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
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

  const handleInputFocus = () => {
    setIsEditing(true);
    onFocus?.();
  };

  // Only focus on the title itself edits; a link inside it keeps its own focus.
  const handleLinksFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) setIsEditing(true);
  };

  // Browsers that don't focus links on click (Safari) would otherwise focus the title, swapping in the field before
  // the link's click lands.
  const handleLinksMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target instanceof Element && event.target.closest("a")) event.preventDefault();
  };

  if (showLinks) {
    return (
      <div
        aria-current={isSelected ? "page" : undefined}
        aria-label={label}
        className={cn("cursor-text wrap-anywhere outline-none", className)}
        role="textbox"
        tabIndex={0}
        onFocus={handleLinksFocus}
        onMouseDown={handleLinksMouseDown}
      >
        <LinkifiedText text={title} />
      </div>
    );
  }

  return (
    <textarea
      ref={inputRef}
      aria-current={isSelected ? "page" : undefined}
      aria-label={label}
      autoComplete="off"
      className={cn("field-sizing-content resize-none bg-transparent wrap-anywhere outline-none", className)}
      rows={1}
      value={draft ?? title}
      onBlur={handleSave}
      onChange={handleChange}
      onFocus={handleInputFocus}
      onKeyDown={handleKeyDown}
    />
  );
};

export default TitleInput;

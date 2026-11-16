import {
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  useRef,
  useState,
} from "react";

import { TIMER_MINUTES_MAX, TIMER_MINUTES_MIN } from "./constants";
import { parseMinutes, sanitizeMinutes } from "./utils";

type MinutesInputProps = { minutes: number; onChange: (minutes: number) => void };

// The timer's minutes, edited in place on the clock face. Whole minutes only: the seconds always read ":00". Typing
// is kept as a draft and applied on blur or Enter; a blank or zero draft puts the last value back, Escape too.
const MinutesInput = ({ minutes, onChange }: MinutesInputProps) => {
  const [draft, setDraft] = useState<string | null>(null);
  const isCancellingRef = useRef(false);
  const isJustFocusedRef = useRef(false);
  // "05" rather than "5" until something is typed, to match the running clock.
  const value = draft ?? String(minutes).padStart(2, "0");

  // Everything is selected, so typing replaces the minutes instead of adding to them.
  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    isJustFocusedRef.current = true;
    event.currentTarget.select();
  };

  // Some browsers collapse the selection on the mouseup of the click that focused the field.
  const handleMouseUp = (event: MouseEvent<HTMLInputElement>) => {
    if (isJustFocusedRef.current) event.preventDefault();
    isJustFocusedRef.current = false;
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) =>
    setDraft(sanitizeMinutes(event.target.value));

  const handleBlur = () => {
    isJustFocusedRef.current = false;
    const parsed = draft === null || isCancellingRef.current ? null : parseMinutes(draft);
    if (parsed !== null) onChange(parsed);
    isCancellingRef.current = false;
    setDraft(null);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") isCancellingRef.current = true;
    if (event.key === "Enter" || event.key === "Escape") event.currentTarget.blur();
  };

  return (
    <p className="flex items-baseline text-6xl font-medium tabular-nums">
      <input
        aria-label={`Timer minutes (${TIMER_MINUTES_MIN}–${TIMER_MINUTES_MAX})`}
        autoComplete="off"
        className="rounded-md bg-transparent text-right underline decoration-dotted decoration-2 underline-offset-8 outline-none hover:decoration-primary focus-visible:bg-muted focus-visible:no-underline"
        inputMode="numeric"
        // `ch` is the width of a digit, so the field grows with what's typed and the colon stays beside it.
        style={{ width: `${Math.max(value.length, 2)}ch` }}
        type="text"
        value={value}
        onBlur={handleBlur}
        onChange={handleChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        onMouseUp={handleMouseUp}
      />
      <span aria-hidden="true">:00</span>
    </p>
  );
};

export default MinutesInput;

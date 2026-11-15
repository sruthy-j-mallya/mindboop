import {
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  useId,
  useRef,
  useState,
} from "react";

import { cn } from "cn";
import { Check } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";

import { DEFAULT_TIME_SLOT_INDEX, TIME_SLOTS } from "./constants";
import {
  centerSelectedOption,
  parseTimeText,
  scrollIntoViewIfNeeded,
  toTimeLabel,
  toTimeSlotIndex,
} from "./utils";

type TimePickerProps = {
  label: string;
  // "HH:mm", or "" for no time.
  value: string;
  placeholder?: string;
  // Lets an emptied field set "" (no time); otherwise emptying it keeps the old time.
  isClearable?: boolean;
  className?: string;
  onChange: (time: string) => void;
};

const LAST_SLOT_INDEX = TIME_SLOTS.length - 1;

// A time field edited in place: type any time ("5:30pm", "17:30") or pick a half-hour slot from the list. The typed
// text is applied on Enter or blur; text that isn't a time is dropped. The field keeps one width, so the layout around
// it doesn't move as the time changes.
const TimePicker = ({
  label,
  value,
  placeholder,
  isClearable = false,
  className,
  onChange,
}: TimePickerProps) => {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  // What's being typed; null while the field shows the value.
  const [text, setText] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(DEFAULT_TIME_SLOT_INDEX);

  const openList = () => {
    if (isOpen) return;

    setActiveIndex(value ? toTimeSlotIndex(value) : DEFAULT_TIME_SLOT_INDEX);
    setIsOpen(true);
  };

  const applyTime = (time: string) => {
    if (time !== value) onChange(time);
    setText(null);
  };

  // Applies the typed text if it's a time (or an allowed blank), and goes back to showing the value either way.
  const commitText = () => {
    if (text === null) return;

    const time = parseTimeText(text);
    if (time) applyTime(time);
    else if (isClearable && !text.trim()) applyTime("");
    else setText(null);
  };

  const selectSlot = (slot: string) => {
    applyTime(slot);
    setIsOpen(false);
  };

  const moveActive = (step: number) =>
    setActiveIndex((index) => Math.min(Math.max(index + step, 0), LAST_SLOT_INDEX));

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    event.target.select();
    openList();
  };

  const handleBlur = () => {
    commitText();
    setIsOpen(false);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const time = parseTimeText(event.target.value);
    setText(event.target.value);
    setIsOpen(true);
    if (time) setActiveIndex(toTimeSlotIndex(time));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (isOpen) moveActive(event.key === "ArrowDown" ? 1 : -1);
      else openList();
    } else if (event.key === "Enter" && (isOpen || text !== null)) {
      // Picks the time instead of submitting the surrounding form.
      event.preventDefault();
      if (text === null) selectSlot(TIME_SLOTS.at(activeIndex) ?? value);
      else {
        commitText();
        setIsOpen(false);
      }
    }
  };

  // Escape or a click away closes the list and drops what was typed. A click on the field itself keeps it open.
  const handleOpenChange = (isOpening: boolean) => {
    if (isOpening) return;

    setText(null);
    setIsOpen(false);
  };

  const handleInteractOutside = (event: Event) => {
    if (inputRef.current?.contains(event.target as Node)) event.preventDefault();
  };

  // Keeps focus in the field, so clicking an option doesn't blur it first.
  const handleListMouseDown = (event: MouseEvent) => event.preventDefault();

  const preventAutoFocus = (event: Event) => event.preventDefault();

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverAnchor asChild>
        <Input
          aria-activedescendant={isOpen ? `${listId}-${activeIndex}` : undefined}
          aria-autocomplete="none"
          aria-controls={listId}
          aria-expanded={isOpen}
          aria-label={label}
          autoComplete="off"
          className={cn("w-28 tabular-nums", className)}
          placeholder={placeholder}
          ref={inputRef}
          role="combobox"
          value={text ?? (value && toTimeLabel(value))}
          onBlur={handleBlur}
          onChange={handleChange}
          onClick={openList}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
        />
      </PopoverAnchor>
      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) p-1"
        onCloseAutoFocus={preventAutoFocus}
        onInteractOutside={handleInteractOutside}
        onMouseDown={handleListMouseDown}
        onOpenAutoFocus={preventAutoFocus}
      >
        <ul
          aria-label={label}
          className="relative max-h-56 overflow-y-auto"
          id={listId}
          ref={centerSelectedOption}
          role="listbox"
        >
          {TIME_SLOTS.map((slot, index) => {
            const isSelected = slot === value;
            const isActive = index === activeIndex;

            return (
              <li
                aria-selected={isSelected}
                className={cn(
                  "flex cursor-default items-center justify-between rounded-sm px-2 py-1.5 text-sm tabular-nums select-none",
                  isActive && "bg-accent text-accent-foreground",
                  isSelected && "text-primary",
                )}
                data-active={isActive}
                id={`${listId}-${index}`}
                key={slot}
                ref={isActive ? scrollIntoViewIfNeeded : undefined}
                role="option"
                onClick={() => selectSlot(slot)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                {toTimeLabel(slot)}
                {isSelected && <Check className="size-4" />}
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
};

export default TimePicker;

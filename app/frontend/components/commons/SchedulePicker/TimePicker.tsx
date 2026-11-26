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
import { Check, ChevronRight, Clock, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import useDatePreferences from "@/hooks/useDatePreferences";

import { DEFAULT_TIME_SLOT_INDEX, TIME_SLOTS } from "./constants";
import {
  centerSelectedOption,
  getFirstSlotIndex,
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
  // Lets an emptied field set "" (no time); otherwise emptying it keeps the old time. A row shows its own clear button.
  isClearable?: boolean;
  // Slots before this "HH:mm" time can't be picked from the list.
  minTime?: string;
  // "field" is a plain input; "row" is a full-width row with a clock icon, and a chevron or a clear button at the end.
  variant?: "field" | "row";
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
  minTime,
  variant = "field",
  className,
  onChange,
}: TimePickerProps) => {
  const { timeFormat } = useDatePreferences();
  const listId = useId();
  const anchorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isRow = variant === "row";
  const [isOpen, setIsOpen] = useState(false);
  // What's being typed; null while the field shows the value.
  const [text, setText] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(DEFAULT_TIME_SLOT_INDEX);
  const firstSlotIndex = getFirstSlotIndex(minTime);
  const isSlotDisabled = (index: number) => index < firstSlotIndex;
  const clampIndex = (index: number) => Math.min(Math.max(index, firstSlotIndex), LAST_SLOT_INDEX);

  const openList = () => {
    if (isOpen) return;

    setActiveIndex(clampIndex(value ? toTimeSlotIndex(value) : DEFAULT_TIME_SLOT_INDEX));
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

  const moveActive = (step: number) => setActiveIndex((index) => clampIndex(index + step));

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
      if (text === null) {
        if (!isSlotDisabled(activeIndex)) selectSlot(TIME_SLOTS.at(activeIndex) ?? value);
      } else {
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
    if (anchorRef.current?.contains(event.target as Node)) event.preventDefault();
  };

  // A click anywhere on the row edits the time.
  const handleRowClick = () => inputRef.current?.focus();

  // Keeps the list shut: clearing is done, not a reason to pick again.
  const handleClear = (event: MouseEvent) => {
    event.stopPropagation();
    applyTime("");
    setIsOpen(false);
  };

  // Keeps focus in the field, so clicking an option doesn't blur it first.
  const handleListMouseDown = (event: MouseEvent) => event.preventDefault();

  const preventAutoFocus = (event: Event) => event.preventDefault();

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverAnchor asChild>
        {/* The row's own clicks only move focus into the input, which has the keyboard handling. */}
        <div
          className={cn(
            "flex items-center",
            isRow &&
              "h-9 w-full cursor-text gap-2 rounded-md bg-muted/60 px-3 text-sm transition-colors hover:bg-muted has-focus:bg-muted has-focus:ring-1 has-focus:ring-ring/40",
            className,
          )}
          ref={anchorRef}
          onClick={isRow ? handleRowClick : undefined}
        >
          {isRow && (
            <Clock className={cn("size-4 shrink-0", value ? "text-primary" : "text-muted-foreground")} />
          )}
          <Input
            aria-activedescendant={isOpen ? `${listId}-${activeIndex}` : undefined}
            aria-autocomplete="none"
            aria-controls={listId}
            aria-expanded={isOpen}
            aria-label={label}
            autoComplete="off"
            className={cn(
              "tabular-nums",
              isRow
                ? "h-auto min-w-0 flex-1 border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
                : "w-28",
              isRow && value && "text-primary",
            )}
            placeholder={placeholder}
            ref={inputRef}
            role="combobox"
            value={text ?? (value && toTimeLabel(value, timeFormat))}
            onBlur={handleBlur}
            onChange={handleChange}
            onClick={openList}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
          />
          {isRow && isClearable && value && (
            <button
              aria-label={`Remove ${label.toLowerCase()}`}
              className="-mr-1 rounded-sm p-1 text-muted-foreground hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
              type="button"
              onClick={handleClear}
            >
              <X className="size-3.5" />
            </button>
          )}
          {isRow && !(isClearable && value) && (
            <ChevronRight aria-hidden className="size-4 shrink-0 text-muted-foreground" />
          )}
        </div>
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
            const isDisabled = isSlotDisabled(index);

            return (
              <li
                aria-disabled={isDisabled || undefined}
                aria-selected={isSelected}
                className={cn(
                  "flex cursor-default items-center justify-between rounded-sm px-2 py-1.5 text-sm tabular-nums select-none",
                  isActive && "bg-accent text-accent-foreground",
                  isSelected && "text-primary",
                  isDisabled && "pointer-events-none text-muted-foreground/50",
                )}
                data-active={isActive}
                id={`${listId}-${index}`}
                key={slot}
                ref={isActive ? scrollIntoViewIfNeeded : undefined}
                role="option"
                onClick={isDisabled ? undefined : () => selectSlot(slot)}
                onMouseEnter={isDisabled ? undefined : () => setActiveIndex(index)}
              >
                {toTimeLabel(slot, timeFormat)}
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

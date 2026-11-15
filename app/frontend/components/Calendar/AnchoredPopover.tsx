import { type ReactNode, useMemo } from "react";

import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";

import type { AnchorRect } from "./types";

type AnchoredPopoverProps = {
  anchor: AnchorRect;
  label: string;
  className?: string;
  children: ReactNode;
  // Asked to close: an outside click, Escape or a focus move. The caller saves, then unmounts the popover.
  onDismiss: () => void;
};

// A popover that opens beside a spot on the grid rather than a trigger button. Modal, so the click that closes it
// doesn't also select a slot behind it.
const AnchoredPopover = ({ anchor, label, className, children, onDismiss }: AnchoredPopoverProps) => {
  const virtualRef = useMemo(() => {
    const { left, top, width, height } = anchor;
    const rect = { left, top, width, height, x: left, y: top, right: left + width, bottom: top + height };

    return { current: { getBoundingClientRect: () => ({ ...rect, toJSON: () => rect }) } };
  }, [anchor]);

  // The form focuses its own first field (the title) instead of the first button.
  const handleOpenAutoFocus = (event: Event) => event.preventDefault();

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) onDismiss();
  };

  return (
    <Popover modal open onOpenChange={handleOpenChange}>
      <PopoverAnchor virtualRef={virtualRef} />
      <PopoverContent
        aria-label={label}
        className={className}
        collisionPadding={16}
        role="dialog"
        side="right"
        onOpenAutoFocus={handleOpenAutoFocus}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
};

export default AnchoredPopover;

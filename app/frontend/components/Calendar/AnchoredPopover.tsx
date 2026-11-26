import { type ReactNode, useMemo } from "react";

import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { PHONE_LAYOUT_QUERY } from "@/constants";
import useMediaQuery from "@/hooks/useMediaQuery";

import type { AnchorRect } from "./types";

const COLLISION_PADDING = 16;

// The least room below the anchor a top-pinned popover needs: its form, with a few suggestions under it. With less
// (an anchor low on screen), it isn't pinned, so it moves up to fit instead of spilling off the bottom.
const MIN_PINNED_HEIGHT_PX = 384; // 24rem

type AnchoredPopoverProps = {
  anchor: AnchorRect;
  label: string;
  className?: string;
  // Keep the top edge level with the anchor's, so content that grows only pushes the bottom edge down. The popover is
  // capped to the space below the anchor; the caller lets its growing part scroll. An anchor too low for that isn't
  // pinned: the popover moves up to fit on screen instead.
  isTopPinned?: boolean;
  children: ReactNode;
  // Asked to close: an outside click, Escape or a focus move. The caller saves, then unmounts the popover.
  onDismiss: () => void;
};

// A popover that opens beside a spot on the grid rather than a trigger button. Modal, so the click that closes it
// doesn't also select a slot behind it.
const AnchoredPopover = ({
  anchor,
  label,
  className,
  isTopPinned = false,
  children,
  onDismiss,
}: AnchoredPopoverProps) => {
  // No room beside the spot there: below (or above) it, the popover can shift sideways to fit.
  const isPhone = useMediaQuery(PHONE_LAYOUT_QUERY);
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

  // Never taller than the room below the anchor, or the collision shift would move it up as it grows.
  const roomBelow = window.innerHeight - anchor.top - COLLISION_PADDING;
  const isPinned = isTopPinned && roomBelow >= MIN_PINNED_HEIGHT_PX;
  const pinnedStyle = isPinned
    ? { maxHeight: `calc(100dvh - ${anchor.top + COLLISION_PADDING}px)` }
    : undefined;

  return (
    <Popover modal open onOpenChange={handleOpenChange}>
      <PopoverAnchor virtualRef={virtualRef} />
      <PopoverContent
        aria-label={label}
        align={isPinned ? "start" : "center"}
        className={className}
        collisionPadding={COLLISION_PADDING}
        role="dialog"
        side={isPhone ? "bottom" : "right"}
        style={pinnedStyle}
        onOpenAutoFocus={handleOpenAutoFocus}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
};

export default AnchoredPopover;

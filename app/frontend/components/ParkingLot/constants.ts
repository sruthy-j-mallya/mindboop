import type { ParkingLotItemStatus } from "@/apis/types";

export const TABS: { status: ParkingLotItemStatus; label: string; emptyMessage: string }[] = [
  { status: "parked", label: "Parked", emptyMessage: "Nothing parked. Your head is clear." },
  { status: "addressed", label: "Addressed", emptyMessage: "Thoughts you mark as addressed land here." },
  { status: "converted", label: "Added as tasks", emptyMessage: "Thoughts you add to your Inbox land here." },
];

export const DEFAULT_STATUS: ParkingLotItemStatus = "parked";

// The shadcn checkbox always draws a tick; a partly selected list shows a filled box with a dash instead.
export const INDETERMINATE_CHECKBOX_CLASS_NAME =
  "relative data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:[&_svg]:hidden data-[state=indeterminate]:after:absolute data-[state=indeterminate]:after:inset-x-0.5 data-[state=indeterminate]:after:top-1/2 data-[state=indeterminate]:after:h-0.5 data-[state=indeterminate]:after:-translate-y-1/2 data-[state=indeterminate]:after:rounded-full data-[state=indeterminate]:after:bg-primary-foreground";

import type { ParkingLotItemStatus } from "@/apis/types";

export const TABS: { status: ParkingLotItemStatus; label: string; emptyMessage: string }[] = [
  { status: "parked", label: "Parked", emptyMessage: "Nothing parked. Your head is clear." },
  { status: "addressed", label: "Addressed", emptyMessage: "Thoughts you mark as addressed land here." },
  { status: "converted", label: "Added as tasks", emptyMessage: "Thoughts you add to your Inbox land here." },
];

export const DEFAULT_STATUS: ParkingLotItemStatus = "parked";

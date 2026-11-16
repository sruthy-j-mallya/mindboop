import type { ParkingLotItemFilters } from "@/apis/types";

export const DISCARD_BELOW_MINUTES = 2;

// With nothing parked to review, the finished dialog fades away on its own after this long.
export const FINISHED_DIALOG_FADE_DELAY = 4000; // 4 seconds

export const PARKED_FILTERS: ParkingLotItemFilters = { status: "parked" };

export const SIDEBAR_STORAGE_KEY = "sidebar_open";

export const ALARM_RING_DURATION = 60_000; // 1 minute

export const ALARM_PHASES = { WAITING: "waiting", RINGING: "ringing", QUIET: "quiet" } as const;

// The sidebar's parking lot badge shows "99+" above this.
export const MAX_PARKED_COUNT = 99;

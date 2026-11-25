export const SIDEBAR_STORAGE_KEY = "sidebar_open";

export const ALARM_RING_DURATION = 60_000; // 1 minute

export const ALARM_PHASES = { WAITING: "waiting", RINGING: "ringing", QUIET: "quiet" } as const;

// How often reminders are checked, and how late one may still show (say, when the tab opens just after its time).
export const REMINDER_CHECK_INTERVAL = 30_000; // 30 seconds
export const REMINDER_GRACE_PERIOD = 30 * 60_000; // 30 minutes
// A reminder stays up this long, then goes quietly.
export const REMINDER_TOAST_DURATION = 5 * 60_000; // 5 minutes

// The day each routine was last reminded on, so a reminder shows once a day, across tabs and reloads.
export const REMINDED_ON_STORAGE_KEY = "routines.remindedOn";

// The sidebar's parking lot badge shows "99+" above this.
export const MAX_PARKED_COUNT = 99;

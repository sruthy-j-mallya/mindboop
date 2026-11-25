import routes from "@/routes";

// What the browser's tab calls each page. The paths match their nested pages too.
export const PAGE_TITLES = [
  { path: routes.inbox.index, title: "Inbox" },
  { path: routes.lifeAreas.index, title: "Tasks" },
  { path: routes.calendar, title: "Calendar" },
  { path: routes.routines.index, title: "Routines" },
  { path: routes.timer, title: "Timer" },
  { path: routes.parkingLot, title: "Parking lot" },
  { path: routes.settings, title: "Settings" },
];

// Keeps toasts above the bottom bar and the mini timer on phones.
export const TOAST_MOBILE_OFFSET = "calc(var(--bottom-bar-height) + 4.5rem)";

const IS_MAC = navigator.platform.startsWith("Mac");

// How the shortcuts (useShortcuts) are shown beside what they open.
export const SEARCH_SHORTCUT_LABEL = IS_MAC ? "⌘K" : "Ctrl K";
export const CAPTURE_SHORTCUT_LABEL = IS_MAC ? "⌥N" : "Alt N";

export const HOME_TITLE = "Home";
export const UNKNOWN_PAGE_TITLE = "Page not found";

// Tailwind's `xl`: room for the open sidebar beside a page of its own columns.
export const WIDE_LAYOUT_QUERY = "(width >= 80rem)";

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

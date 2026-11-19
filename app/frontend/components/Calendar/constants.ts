import { format, getDay, parse, startOfWeek } from "date-fns";
import { enUS } from "date-fns/locale";
import { dateFnsLocalizer } from "react-big-calendar";

// Weeks start on Monday, as in the date picker and the Inbox.
export const WEEK_OPTIONS = { weekStartsOn: 1 } as const;

export const LOCALIZER = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, WEEK_OPTIONS),
  getDay,
  locales: { "en-US": enUS },
});

export const CALENDAR_VIEWS = {
  DAY: "day",
  MULTI_DAY: "multiDay",
  WEEK: "week",
  MONTH: "month",
  YEAR: "year",
} as const;

export const DEFAULT_VIEW = CALENDAR_VIEWS.WEEK;

// The toolbar's view picker options, in order.
export const VIEW_OPTIONS = [
  { value: CALENDAR_VIEWS.DAY, label: "Day" },
  { value: CALENDAR_VIEWS.MULTI_DAY, label: "Multi-day" },
  { value: CALENDAR_VIEWS.WEEK, label: "Week" },
  { value: CALENDAR_VIEWS.MONTH, label: "Month" },
  { value: CALENDAR_VIEWS.YEAR, label: "Year" },
] as const;

// How many days the multi-day view shows, and the counts its day picker offers. One day is the day view, and seven
// the week view.
export const DEFAULT_MULTI_DAY_COUNT = 3;
export const MULTI_DAY_COUNT_OPTIONS = [2, 3, 4, 5, 6] as const;

// The time grid snaps to quarter hours, with a line every hour.
export const SLOT_MINUTES = 15;
export const SLOTS_PER_HOUR = 4;

// A task with only a date (no end) is drawn as long as its estimate, or this long without one.
export const DEFAULT_TASK_MINUTES = 30;

// How far back time can be logged or moved to. Keep in sync with TimeLog::LOGGING_WINDOW.
export const TIME_LOG_WINDOW_HOURS = 24;

// Keeps the past/future split (and running sessions) current while the page stays open.
export const NOW_REFRESH_INTERVAL = 60_000; // 1 minute

// The grid opens scrolled to an hour before now, so the next few hours are in view.
export const SCROLL_BACK_HOURS = 1;

// Scrolling sideways over the calendar (or with Shift held) pages it like Previous/Next; in the month view, scrolling
// up and down does too. A swipe turns one page once it has gone this far.
export const WHEEL_PAGE_DISTANCE = 40; // pixels
// A pause this long between wheel events ends a swipe.
export const WHEEL_GESTURE_GAP = 200; // milliseconds
// After a page turns, the swipe's momentum is ignored. Wheel events that pick up speed again once it has started to
// fade (to this many times its slowest, and at least this fast) are a new swipe.
export const WHEEL_NEW_SWIPE_RATIO = 2;
export const WHEEL_NEW_SWIPE_MIN_SPEED = 10; // pixels per event

export const INITIAL_WHEEL_GESTURE = {
  distance: 0,
  lastWheelAt: Number.NEGATIVE_INFINITY,
  hasTurned: false,
  peak: 0,
  slowest: Number.POSITIVE_INFINITY,
};

// Pixels per wheel delta unit, indexed by `WheelEvent.deltaMode` (pixel, line, page).
export const WHEEL_DELTA_MODE_PIXELS = [1, 16, 800] as const;

// The "+N more" popup scrolls on its own.
export const OVERLAY_SELECTOR = ".rbc-overlay";

// The year view scrolls on without end: it shows this many years either side of the one in view, and moves along as
// it's scrolled.
export const YEAR_VIEW_BUFFER_YEARS = 1;
// The month today falls in, which the year view scrolls to when it opens or goes to Today.
export const CURRENT_MONTH_SELECTOR = "[data-current-month]";

export const EVENT_KINDS = { TASK: "task", TIME_LOG: "timeLog" } as const;

export const EVENT_CLASS_NAMES = {
  TASK: "calendar-event-task",
  TIME_LOG: "calendar-event-time-log",
} as const;

export const SLOT_CLASS_NAMES = { PAST: "calendar-slot-past", LOCKED: "calendar-slot-locked" } as const;

export const MOVE_ERRORS = {
  TASK_IN_PAST: "Tasks can only move to now or later.",
  TIME_LOG_OUTSIDE_WINDOW: `Time logs can only sit within the last ${TIME_LOG_WINDOW_HOURS} hours.`,
  TIME_LOG_ALL_DAY: "A time log needs a start and an end time.",
} as const;

export const SELECTION_ERRORS = {
  TOO_FAR_BACK: `Time can only be logged for the last ${TIME_LOG_WINDOW_HOURS} hours.`,
} as const;

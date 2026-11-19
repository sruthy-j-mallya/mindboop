import type { CreateRoutinePayload } from "@/apis/types";

const NO_REMINDER = { reminderTime: null, reminderDays: [] };

// Offered until the user has a routine of their own, each added as is with a click. Everyday care is here on purpose:
// a shower or brushing your teeth can take real effort, and deserves a timer as much as anything else.
export const ROUTINE_SUGGESTIONS: CreateRoutinePayload[] = [
  {
    title: "Brush & floss",
    icon: "toothbrush",
    color: "sky",
    sound: "none",
    durationMinutes: 5,
    ...NO_REMINDER,
  },
  { title: "Shower", icon: "shower-head", color: "teal", sound: "rain", durationMinutes: 15, ...NO_REMINDER },
  {
    title: "Meditation",
    icon: "flower-2",
    color: "violet",
    sound: "bells",
    durationMinutes: 10,
    ...NO_REMINDER,
  },
  {
    title: "Wash the dishes",
    icon: "utensils",
    color: "rose",
    sound: "none",
    durationMinutes: 15,
    ...NO_REMINDER,
  },
  {
    title: "Fold clothes",
    icon: "shirt",
    color: "indigo",
    sound: "piano",
    durationMinutes: 15,
    ...NO_REMINDER,
  },
  {
    title: "Quick stretch",
    icon: "person-standing",
    color: "lime",
    sound: "morning",
    durationMinutes: 5,
    ...NO_REMINDER,
  },
  {
    title: "Short walk",
    icon: "footprints",
    color: "emerald",
    sound: "none",
    durationMinutes: 15,
    ...NO_REMINDER,
  },
  {
    title: "Reading",
    icon: "book-open",
    color: "amber",
    sound: "campfire",
    durationMinutes: 20,
    ...NO_REMINDER,
  },
  { title: "Tidy up", icon: "broom", color: "orange", sound: "none", durationMinutes: 10, ...NO_REMINDER },
  { title: "Exercise", icon: "dumbbell", color: "slate", sound: "none", durationMinutes: 30, ...NO_REMINDER },
];

// Monday first, as the month grid lays weeks out. `value` is the server's weekday (0 = Sunday).
export const WEEKDAYS = [
  { value: 1, short: "M", label: "Monday" },
  { value: 2, short: "T", label: "Tuesday" },
  { value: 3, short: "W", label: "Wednesday" },
  { value: 4, short: "T", label: "Thursday" },
  { value: 5, short: "F", label: "Friday" },
  { value: 6, short: "S", label: "Saturday" },
  { value: 0, short: "S", label: "Sunday" },
];

export const ALL_WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];

// The day key sessions are grouped by, in the browser's time zone.
export const DAY_KEY_FORMAT = "yyyy-MM-dd";

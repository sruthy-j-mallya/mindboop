// With nothing parked to review, the finished dialog fades away on its own after this long.
export const FINISHED_DIALOG_FADE_DELAY = 4000; // 4 seconds

// The grid for the session's action buttons (Extend, Pause, Discard for a routine, End session, as each applies), by how many show: one to four.
export const ACTION_GRID_CLASSES = [
  "grid-cols-1",
  "grid-cols-2",
  "grid-cols-3",
  "grid-cols-2 sm:grid-cols-4 lg:grid-cols-2",
];

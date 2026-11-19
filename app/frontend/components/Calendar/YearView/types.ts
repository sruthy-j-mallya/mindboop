// How many tasks and time logs touch a day, for the year view's dots.
export type DayCounts = { tasks: number; timeLogs: number };

// The month at the top of the year view, and how far below the top it sat, to hold it in place as the view moves
// along to another year.
export type ScrollAnchor = { monthKey: string; offset: number };

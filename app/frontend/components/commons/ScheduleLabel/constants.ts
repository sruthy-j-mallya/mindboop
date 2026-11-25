// Keeps "Today, 5:30pm" turning overdue (and "Tomorrow" becoming "Today") while the page stays open.
export const SCHEDULE_REFRESH_INTERVAL = 60_000; // 1 minute

export const SCHEDULE_TONE_CLASS_NAMES = {
  overdue: "text-destructive",
  today: "text-primary",
  upcoming: "text-muted-foreground",
} as const;

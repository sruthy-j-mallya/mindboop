// The picker's working copy of a task's schedule. `endsAt` is kept on the Date tab too, so switching to Duration and
// back doesn't lose it. All-day dates sit at the start of their day.
export type ScheduleDraft = { isDuration: boolean; isAllDay: boolean; startsAt: Date; endsAt: Date };

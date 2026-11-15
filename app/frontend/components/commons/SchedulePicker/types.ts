import type { UpdateTaskPayload } from "@/apis/types";

// The picker's working copy of a task's schedule. `endsAt` is kept on the Date tab too, so switching to Duration and
// back doesn't lose it. All-day dates sit at the start of their day.
export type ScheduleDraft = { isDuration: boolean; isAllDay: boolean; startsAt: Date; endsAt: Date };

// What the picker saves: the task's schedule fields, without its id.
export type SchedulePayload = Pick<UpdateTaskPayload, "isDuration" | "isAllDay" | "startsAt" | "endsAt">;

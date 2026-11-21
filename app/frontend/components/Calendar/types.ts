import type { Task, TimeLog } from "@/apis/types";
import type { Schedule } from "@/components/commons/ScheduleLabel/types";

import type { CALENDAR_VIEWS, EVENT_KINDS } from "./constants";

export type CalendarView = (typeof CALENDAR_VIEWS)[keyof typeof CALENDAR_VIEWS];

export type TimeRange = { start: Date; end: Date };

// Where an event sits on the grid. All-day ones end at the start of the day after their last.
export type EventTimes = TimeRange & { allDay: boolean };

type EventBase = EventTimes & { id: string; title: string; isEditable: boolean };

export type TaskEvent = EventBase & { kind: typeof EVENT_KINDS.TASK; task: Task };

export type TimeLogEvent = EventBase & { kind: typeof EVENT_KINDS.TIME_LOG; timeLog: TimeLog };

export type CalendarEvent = TaskEvent | TimeLogEvent;

// The on-screen box a popover opens beside: the slot or event clicked, or the point of a click.
export type AnchorRect = { top: number; left: number; width: number; height: number };

export type PopoverState =
  | { kind: "newTask"; anchor: AnchorRect; schedule: Schedule }
  | { kind: "editTask"; anchor: AnchorRect; task: Task }
  | { kind: "showTimeLog"; anchor: AnchorRect; event: TimeLogEvent }
  | { kind: "newTimeLog"; anchor: AnchorRect; range: TimeRange };

// What a click or drag on empty grid asks for: a task from now on, a time log in the last 24 hours.
export type SelectionIntent =
  | { kind: "task"; schedule: Schedule }
  | { kind: "timeLog"; range: TimeRange }
  | { kind: "none"; error?: string };

export type WheelDelta = { x: number; y: number };

export type WheelInput = Pick<WheelEvent, "deltaX" | "deltaY" | "deltaMode" | "shiftKey" | "timeStamp">;

// One swipe (or run of wheel clicks) so far: how far it paged, and after it turned a page, how fast its momentum is.
export type WheelGesture = {
  distance: number;
  lastWheelAt: number;
  hasTurned: boolean;
  peak: number;
  slowest: number;
};

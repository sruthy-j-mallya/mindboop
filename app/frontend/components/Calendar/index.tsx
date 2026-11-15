import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "@/styles/calendar.css";

import { type SyntheticEvent, useMemo, useState } from "react";

import { startOfDay, subHours } from "date-fns";
import type { SlotInfo, View, ViewsProps } from "react-big-calendar";
import { toast } from "sonner";

import { useCalendarEvents } from "@/hooks/reactQuery/useCalendarEventsApi";
import useCurrentTime from "@/hooks/useCurrentTime";

import {
  CALENDAR_VIEWS,
  DEFAULT_VIEW,
  EVENT_CLASS_NAMES,
  EVENT_KINDS,
  LOCALIZER,
  NOW_REFRESH_INTERVAL,
  SCROLL_BACK_HOURS,
  SLOT_CLASS_NAMES,
  SLOT_MINUTES,
  SLOTS_PER_HOUR,
} from "./constants";
import DragAndDropCalendar from "./DragAndDropCalendar";
import MultiDayView from "./MultiDayView";
import EditTaskPopover from "./TaskPopover/Edit";
import NewTaskPopover from "./TaskPopover/New";
import TimeLogPopover from "./TimeLogPopover";
import Toolbar from "./Toolbar";
import type { CalendarEvent, CalendarView, PopoverState } from "./types";
import useEventMoves from "./useEventMoves";
import {
  eventToAnchorRect,
  getCurrentSlotStart,
  getLogWindowStart,
  getSelectionIntent,
  getVisibleRange,
  toAnchorRect,
  toCalendarEvents,
} from "./utils";
import YearView from "./YearView";

// react-big-calendar's own views, plus a few days at a time and a whole year.
const VIEWS = {
  [CALENDAR_VIEWS.DAY]: true,
  [CALENDAR_VIEWS.MULTI_DAY]: MultiDayView,
  [CALENDAR_VIEWS.WEEK]: true,
  [CALENDAR_VIEWS.MONTH]: true,
  [CALENDAR_VIEWS.YEAR]: YearView,
} as unknown as ViewsProps<CalendarEvent>;

const COMPONENTS = { toolbar: Toolbar };

const getEventProps = ({ kind }: CalendarEvent) => ({
  className: kind === EVENT_KINDS.TASK ? EVENT_CLASS_NAMES.TASK : EVENT_CLASS_NAMES.TIME_LOG,
});

// Past time logs and upcoming tasks on one grid. Clicking or dragging across empty time adds a task from now on, or
// logs time in the last 24 hours; tasks open for editing on click, and both move and resize by dragging.
const Calendar = () => {
  const [view, setView] = useState<CalendarView>(DEFAULT_VIEW);
  const [date, setDate] = useState(() => new Date());
  const [popover, setPopover] = useState<PopoverState | null>(null);
  const [scrollToTime] = useState(() => subHours(new Date(), SCROLL_BACK_HOURS));
  const now = useCurrentTime(true, NOW_REFRESH_INTERVAL);
  const params = useMemo(() => {
    const { start, end } = getVisibleRange(view, date);

    return { from: start.toISOString(), to: end.toISOString() };
  }, [view, date]);
  const { data: { tasks = [], timeLogs = [] } = {}, error } = useCalendarEvents(params);
  const { movedTimes, handleEventDrop, handleEventResize } = useEventMoves(view === CALENDAR_VIEWS.MONTH);
  const events = useMemo(
    () => toCalendarEvents({ tasks, timeLogs }, now, movedTimes),
    [tasks, timeLogs, now, movedTimes],
  );

  const handleView = (nextView: View) => setView(nextView as CalendarView);

  const handleClosePopover = () => setPopover(null);

  // The drag-and-drop addon still reports a click on an event as a slot click too, a moment after the event's own
  // click opened its popover. Popovers are modal, so a slot picked while one is open is never meant.
  const handleSelectSlot = ({ start, end, action, box, bounds }: SlotInfo) => {
    if (popover) return;

    const intent = getSelectionIntent({ start, end }, action !== "select", Date.now());
    const anchor = toAnchorRect(box, bounds);

    if (intent.kind === "task") setPopover({ kind: "newTask", anchor, schedule: intent.schedule });
    else if (intent.kind === "timeLog") setPopover({ kind: "newTimeLog", anchor, range: intent.range });
    else if (intent.error) toast.error(intent.error);
  };

  // Time logs only move and resize; a click on one does nothing.
  const handleSelectEvent = (event: CalendarEvent, domEvent: SyntheticEvent<HTMLElement>) => {
    if (event.kind === EVENT_KINDS.TASK) {
      setPopover({ kind: "editTask", anchor: eventToAnchorRect(domEvent), task: event.task });
    }
  };

  // Past time is shaded, and time beyond the 24 hours that can be logged more so.
  const getSlotProps = (slot: Date) => {
    if (slot < getLogWindowStart(now)) return { className: SLOT_CLASS_NAMES.LOCKED };

    return slot < getCurrentSlotStart(now) ? { className: SLOT_CLASS_NAMES.PAST } : {};
  };

  const getDayProps = (day: Date) => (day < startOfDay(now) ? { className: SLOT_CLASS_NAMES.PAST } : {});

  return (
    <div className="flex flex-1 flex-col px-4 pb-4">
      <h1 className="sr-only">Calendar</h1>
      {error && (
        <p className="pb-3 text-sm text-destructive" role="alert">
          {error.message}
        </p>
      )}
      <div className="calendar h-[calc(100svh-5rem)] min-h-[36rem]">
        <DragAndDropCalendar
          popup
          resizable
          selectable="ignoreEvents"
          components={COMPONENTS}
          culture="en-US"
          date={date}
          dayPropGetter={getDayProps}
          draggableAccessor="isEditable"
          eventPropGetter={getEventProps}
          events={events}
          localizer={LOCALIZER}
          resizableAccessor="isEditable"
          scrollToTime={scrollToTime}
          slotPropGetter={getSlotProps}
          step={SLOT_MINUTES}
          timeslots={SLOTS_PER_HOUR}
          tooltipAccessor="title"
          view={view as View}
          views={VIEWS}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          onNavigate={setDate}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          onView={handleView}
        />
      </div>
      {popover?.kind === "newTask" && (
        <NewTaskPopover anchor={popover.anchor} schedule={popover.schedule} onClose={handleClosePopover} />
      )}
      {popover?.kind === "editTask" && (
        <EditTaskPopover anchor={popover.anchor} task={popover.task} onClose={handleClosePopover} />
      )}
      {popover?.kind === "newTimeLog" && (
        <TimeLogPopover anchor={popover.anchor} range={popover.range} onClose={handleClosePopover} />
      )}
    </div>
  );
};

export default Calendar;

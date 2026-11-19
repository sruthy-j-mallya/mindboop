import { addDays, endOfDay, startOfDay } from "date-fns";
import type { DateLocalizer, NavigateAction } from "react-big-calendar";
import TimeGridModule from "react-big-calendar/lib/TimeGrid";

import { CALENDAR_VIEWS, DEFAULT_MULTI_DAY_COUNT } from "./constants";
import { getMultiDayRange, shiftDate, unwrapDefault } from "./utils";

const TimeGrid = unwrapDefault(TimeGridModule);

// react-big-calendar hands its `length` prop (meant for the agenda view) to every view and to `navigate` and `title`,
// so it carries how many days this view shows.
type MultiDayViewProps = { date: Date; localizer: DateLocalizer; length?: number } & Record<string, unknown>;

type LengthOptions = { length?: number };

const getDays = (date: Date, { length = DEFAULT_MULTI_DAY_COUNT }: LengthOptions = {}) => {
  const { start } = getMultiDayRange(date, length);

  return Array.from({ length }, (_, index) => addDays(start, index));
};

// A time grid of a few days from the chosen one, built like react-big-calendar's own Week view.
const MultiDayView = ({ date, localizer, length, ...props }: MultiDayViewProps) => (
  <TimeGrid
    {...props}
    date={date}
    eventOffset={15}
    localizer={localizer}
    max={props.max ?? endOfDay(new Date())}
    min={props.min ?? startOfDay(new Date())}
    range={getDays(date, { length })}
  />
);

MultiDayView.range = getDays;

MultiDayView.navigate = (date: Date, action: NavigateAction, { length }: LengthOptions = {}) => {
  if (action === "PREV") return shiftDate(CALENDAR_VIEWS.MULTI_DAY, date, -1, length);

  return action === "NEXT" ? shiftDate(CALENDAR_VIEWS.MULTI_DAY, date, 1, length) : date;
};

MultiDayView.title = (date: Date, { localizer, length }: { localizer: DateLocalizer } & LengthOptions) => {
  const days = getDays(date, { length });

  return localizer.format({ start: days[0], end: days[days.length - 1] }, "dayRangeHeaderFormat");
};

export default MultiDayView;

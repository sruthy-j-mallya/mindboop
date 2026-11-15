import { addDays, endOfDay, startOfDay } from "date-fns";
import type { DateLocalizer, NavigateAction } from "react-big-calendar";
import TimeGridModule from "react-big-calendar/lib/TimeGrid";

import { MULTI_DAY_COUNT } from "./constants";
import { getMultiDayRange, unwrapDefault } from "./utils";

const TimeGrid = unwrapDefault(TimeGridModule);

type MultiDayViewProps = { date: Date; localizer: DateLocalizer } & Record<string, unknown>;

const getDays = (date: Date) => {
  const { start } = getMultiDayRange(date);

  return Array.from({ length: MULTI_DAY_COUNT }, (_, index) => addDays(start, index));
};

// A time grid of a few days from the chosen one, built like react-big-calendar's own Week view.
const MultiDayView = ({ date, localizer, ...props }: MultiDayViewProps) => (
  <TimeGrid
    {...props}
    date={date}
    eventOffset={15}
    localizer={localizer}
    max={props.max ?? endOfDay(new Date())}
    min={props.min ?? startOfDay(new Date())}
    range={getDays(date)}
  />
);

MultiDayView.range = getDays;

MultiDayView.navigate = (date: Date, action: NavigateAction) => {
  if (action === "PREV") return addDays(date, -MULTI_DAY_COUNT);

  return action === "NEXT" ? addDays(date, MULTI_DAY_COUNT) : date;
};

MultiDayView.title = (date: Date, { localizer }: { localizer: DateLocalizer }) => {
  const days = getDays(date);

  return localizer.format({ start: days[0], end: days[days.length - 1] }, "dayRangeHeaderFormat");
};

export default MultiDayView;

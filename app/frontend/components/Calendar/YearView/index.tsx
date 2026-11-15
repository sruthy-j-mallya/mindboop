import { eachMonthOfInterval, endOfYear, format, startOfYear } from "date-fns";
import type { NavigateAction } from "react-big-calendar";

import { CALENDAR_VIEWS } from "../constants";
import type { CalendarEvent } from "../types";
import { shiftDate } from "../utils";
import MonthGrid from "./MonthGrid";
import { getDayCounts } from "./utils";

type YearViewProps = {
  date: Date;
  events: CalendarEvent[];
  onDrillDown: (date: Date, view: string) => void;
};

// Twelve small months. A react-big-calendar custom view, so the toolbar pages it a year at a time.
const YearView = ({ date, events, onDrillDown }: YearViewProps) => {
  const months = eachMonthOfInterval({ start: startOfYear(date), end: endOfYear(date) });
  const counts = getDayCounts(events);

  const handleSelectDay = (day: Date) => onDrillDown(day, CALENDAR_VIEWS.DAY);

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 content-start gap-x-8 gap-y-6 overflow-y-auto p-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {months.map((month) => (
        <MonthGrid key={month.toISOString()} counts={counts} month={month} onSelectDay={handleSelectDay} />
      ))}
    </div>
  );
};

YearView.range = (date: Date) => [startOfYear(date), endOfYear(date)];

YearView.navigate = (date: Date, action: NavigateAction) => {
  if (action === "PREV") return shiftDate(CALENDAR_VIEWS.YEAR, date, -1);

  return action === "NEXT" ? shiftDate(CALENDAR_VIEWS.YEAR, date, 1) : date;
};

YearView.title = (date: Date) => format(date, "yyyy");

export default YearView;

import { useLayoutEffect, useMemo, useRef } from "react";

import { eachMonthOfInterval, endOfYear, format, getYear, isThisYear, setYear, startOfYear } from "date-fns";
import type { NavigateAction } from "react-big-calendar";

import useWeekStartsOn from "@/hooks/useWeekStartsOn";

import { CALENDAR_VIEWS, CURRENT_MONTH_SELECTOR } from "../constants";
import type { CalendarEvent } from "../types";
import { getVisibleRange, shiftDate } from "../utils";
import MonthGrid from "./MonthGrid";
import type { ScrollAnchor } from "./types";
import { getDayCounts, getTopMonth, getYearWindow, toMonthKey } from "./utils";

type YearViewProps = {
  date: Date;
  events: CalendarEvent[];
  onDrillDown: (date: Date, view: string) => void;
  onNavigate: (action: NavigateAction, date?: Date) => void;
};

// Small months that scroll on without end. A react-big-calendar custom view: its date is the year at the top, which
// changes as the view is scrolled past a year's end; the toolbar still pages it a year at a time. It shows a year
// either side of that one, and as the date moves, holds the month at the top in place while the years around it
// change.
const YearView = ({ date, events, onDrillDown, onNavigate }: YearViewProps) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const anchor = useRef<ScrollAnchor | null>(null);
  const years = getYearWindow(date);
  const counts = useMemo(() => getDayCounts(events), [events]);
  const weekStartsOn = useWeekStartsOn();

  // Scrolled to another year: keep the same month where it was. Opened or paged by the toolbar: show this month if
  // it's this year (Today), or the year from its January.
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const pending = anchor.current;
    anchor.current = null;
    if (pending) {
      const month = scroller.querySelector(`[data-month="${pending.monthKey}"]`);
      if (month) {
        const offset = month.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
        scroller.scrollTop += offset - pending.offset;
      }

      return;
    }

    const target = isThisYear(date)
      ? scroller.querySelector(CURRENT_MONTH_SELECTOR)
      : scroller.querySelector(`[data-month="${toMonthKey(startOfYear(date))}"]`);
    target?.scrollIntoView({ block: "start" });
  }, [date]);

  const handleScroll = () => {
    const scroller = scrollerRef.current;
    const month = scroller && getTopMonth(scroller);
    if (!month || anchor.current) return;

    const monthKey = month.dataset.month ?? "";
    const year = Number(monthKey.slice(0, 4));
    if (year === getYear(date)) return;

    const offset = month.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
    anchor.current = { monthKey, offset };
    onNavigate("DATE", setYear(date, year));
  };

  const handleSelectDay = (day: Date) => onDrillDown(day, CALENDAR_VIEWS.DAY);

  return (
    <div ref={scrollerRef} className="min-h-0 flex-1 overflow-y-auto p-2" onScroll={handleScroll}>
      {years.map((year) => (
        <div key={year.toISOString()} className="pb-6">
          <h3 className="px-1 pb-3 text-sm font-semibold text-muted-foreground">{format(year, "yyyy")}</h3>
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {eachMonthOfInterval({ start: year, end: endOfYear(year) }).map((month) => (
              <MonthGrid
                key={month.toISOString()}
                counts={counts}
                month={month}
                weekStartsOn={weekStartsOn}
                onSelectDay={handleSelectDay}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

YearView.range = (date: Date) => {
  const { start, end } = getVisibleRange(CALENDAR_VIEWS.YEAR, date);

  return [start, end];
};

YearView.navigate = (date: Date, action: NavigateAction) => {
  if (action === "PREV") return shiftDate(CALENDAR_VIEWS.YEAR, date, -1);

  return action === "NEXT" ? shiftDate(CALENDAR_VIEWS.YEAR, date, 1) : date;
};

YearView.title = (date: Date) => format(date, "yyyy");

export default YearView;

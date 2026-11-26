import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ToolbarProps, View } from "react-big-calendar";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { CALENDAR_VIEWS, MULTI_DAY_COUNT_OPTIONS, VIEW_OPTIONS } from "./constants";
import Legend from "./Legend";
import type { CalendarEvent, CalendarView } from "./types";

type ToolbarComponentProps = ToolbarProps<CalendarEvent> & {
  dayCount: number;
  onDayCountChange: (dayCount: number) => void;
};

// Replaces react-big-calendar's toolbar with the app's buttons and a view picker. The multi-day view also gets a
// picker for how many days it shows.
const Toolbar = ({ label, view, dayCount, onNavigate, onView, onDayCountChange }: ToolbarComponentProps) => {
  const handleToday = () => onNavigate("TODAY");
  const handlePrevious = () => onNavigate("PREV");
  const handleNext = () => onNavigate("NEXT");
  // The Calendar adds its own views (multi-day, year) to react-big-calendar's.
  const handleViewChange = (nextView: string) => onView(nextView as View);
  const isMultiDay = (view as CalendarView) === CALENDAR_VIEWS.MULTI_DAY;
  const handleDayCountChange = (nextDayCount: string) => onDayCountChange(Number(nextDayCount));

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <h2 aria-live="polite" className="text-lg font-semibold">
          {label}
        </h2>
        <Legend />
      </div>
      <div className="flex items-center gap-2">
        <ButtonGroup aria-label="Navigate dates">
          <Button
            aria-label="Previous"
            size="icon-sm"
            type="button"
            variant="outline"
            onClick={handlePrevious}
          >
            <ChevronLeft />
          </Button>
          <Button size="sm" type="button" variant="outline" onClick={handleToday}>
            Today
          </Button>
          <Button aria-label="Next" size="icon-sm" type="button" variant="outline" onClick={handleNext}>
            <ChevronRight />
          </Button>
        </ButtonGroup>
        {isMultiDay && (
          <Select value={String(dayCount)} onValueChange={handleDayCountChange}>
            <SelectTrigger aria-label="Number of days" className="w-24" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end" position="popper">
              {MULTI_DAY_COUNT_OPTIONS.map((count) => (
                <SelectItem key={count} value={String(count)}>
                  {count} days
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Select value={view} onValueChange={handleViewChange}>
          <SelectTrigger aria-label="Calendar view" className="w-28" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end" position="popper">
            {VIEW_OPTIONS.map(({ value, label: viewLabel }) => (
              <SelectItem key={value} value={value}>
                {viewLabel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default Toolbar;

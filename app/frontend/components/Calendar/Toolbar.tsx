import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ToolbarProps, View } from "react-big-calendar";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { VIEW_OPTIONS } from "./constants";
import type { CalendarEvent } from "./types";

// Replaces react-big-calendar's toolbar with the app's buttons and a view picker.
const Toolbar = ({ label, view, onNavigate, onView }: ToolbarProps<CalendarEvent>) => {
  const handleToday = () => onNavigate("TODAY");
  const handlePrevious = () => onNavigate("PREV");
  const handleNext = () => onNavigate("NEXT");
  // The Calendar adds its own views (multi-day, year) to react-big-calendar's.
  const handleViewChange = (nextView: string) => onView(nextView as View);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
      <h2 aria-live="polite" className="text-lg font-semibold">
        {label}
      </h2>
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

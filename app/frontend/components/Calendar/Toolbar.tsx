import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ToolbarProps, View } from "react-big-calendar";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { VIEW_OPTIONS } from "./constants";
import type { CalendarEvent } from "./types";

// Replaces react-big-calendar's toolbar with the app's buttons and tabs.
const Toolbar = ({ label, view, onNavigate, onView }: ToolbarProps<CalendarEvent>) => {
  const handleToday = () => onNavigate("TODAY");
  const handlePrevious = () => onNavigate("PREV");
  const handleNext = () => onNavigate("NEXT");
  // The Calendar adds its own views (multi-day, year) to react-big-calendar's.
  const handleViewChange = (nextView: string) => onView(nextView as View);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
      <div className="flex items-center gap-2">
        <Button size="sm" type="button" variant="outline" onClick={handleToday}>
          Today
        </Button>
        <div className="flex items-center">
          <Button aria-label="Previous" size="icon-sm" type="button" variant="ghost" onClick={handlePrevious}>
            <ChevronLeft />
          </Button>
          <Button aria-label="Next" size="icon-sm" type="button" variant="ghost" onClick={handleNext}>
            <ChevronRight />
          </Button>
        </div>
        <h2 aria-live="polite" className="text-lg font-semibold">
          {label}
        </h2>
      </div>
      <Tabs value={view} onValueChange={handleViewChange}>
        <TabsList aria-label="Calendar view">
          {VIEW_OPTIONS.map(({ value, label: viewLabel }) => (
            <TabsTrigger key={value} value={value}>
              {viewLabel}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default Toolbar;

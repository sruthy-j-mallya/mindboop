import type { WeekStartsOn } from "@/apis/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { WEEK_START_DAYS } from "./constants";

type CalendarSettingsProps = { weekStartsOn: WeekStartsOn; onChange: (weekStartsOn: WeekStartsOn) => void };

// Select values are strings, so the day number goes through `String` and back.
const CalendarSettings = ({ weekStartsOn, onChange }: CalendarSettingsProps) => {
  const handleValueChange = (value: string) => onChange(Number(value) as WeekStartsOn);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar</CardTitle>
        <CardDescription>Choose how the Calendar lays out your weeks.</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4">
        <Label htmlFor="week-starts-on">Week starts on</Label>
        <Select value={String(weekStartsOn)} onValueChange={handleValueChange}>
          <SelectTrigger className="w-48" id="week-starts-on">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WEEK_START_DAYS.map(({ id, label }) => (
              <SelectItem key={id} value={String(id)}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};

export default CalendarSettings;

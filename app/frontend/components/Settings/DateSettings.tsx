import type { DatePreferences, TimeFormat, WeekStartsOn } from "@/apis/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { TIME_FORMATS, WEEK_START_DAYS } from "./constants";

type DateSettingsProps = {
  preference: DatePreferences;
  onChange: (changes: Partial<DatePreferences>) => void;
};

// Select values are strings, so the day number goes through `String` and back.
const DateSettings = ({ preference, onChange }: DateSettingsProps) => {
  const handleTimeFormatChange = (timeFormat: TimeFormat) => onChange({ timeFormat });
  const handleWeekStartsOnChange = (value: string) =>
    onChange({ weekStartsOn: Number(value) as WeekStartsOn });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dates and times</CardTitle>
        <CardDescription>Choose how times read, and the day your weeks start on.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="time-format">Time format</Label>
          <Select value={preference.timeFormat} onValueChange={handleTimeFormatChange}>
            <SelectTrigger className="w-48" id="time-format">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_FORMATS.map(({ id, label }) => (
                <SelectItem key={id} value={id}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="week-starts-on">Week starts on</Label>
          <Select value={String(preference.weekStartsOn)} onValueChange={handleWeekStartsOnChange}>
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
        </div>
      </CardContent>
    </Card>
  );
};

export default DateSettings;

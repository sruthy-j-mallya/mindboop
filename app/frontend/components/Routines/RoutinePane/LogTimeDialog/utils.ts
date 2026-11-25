import { addMinutes, format, isSameDay, max, parse, set, startOfDay, subMinutes } from "date-fns";

import { DEFAULT_START_HOUR, type LogTimeFormValues, TIME_FORMAT } from "./constants";

// The routine's usual duration. Today it ends now, without reaching back into yesterday.
export const getInitialValues = (date: Date, durationMinutes: number, now: Date): LogTimeFormValues => {
  const start = isSameDay(date, now)
    ? max([subMinutes(now, durationMinutes), startOfDay(now)])
    : set(date, { hours: DEFAULT_START_HOUR });

  return { startTime: format(start, TIME_FORMAT), minutes: durationMinutes };
};

// The span the form describes on that day, in the browser's time zone.
export const getLoggedRange = (date: Date, { startTime, minutes }: LogTimeFormValues) => {
  const start = parse(startTime, TIME_FORMAT, startOfDay(date));

  return { start, end: addMinutes(start, minutes) };
};

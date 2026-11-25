export type MonthDay = {
  key: string;
  date: Date;
  // Minutes spent on the routine that day; 0 when it wasn't done.
  minutes: number;
  isInMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
};

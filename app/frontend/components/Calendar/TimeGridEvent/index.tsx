import { EVENT_KINDS } from "../constants";
import type { CalendarEvent } from "../types";
import { getBreakBands } from "../utils";
import BreakWave from "./BreakWave";

type TimeGridEventProps = { event: CalendarEvent; title: string };

// An event's title on the time grid. A time log also draws each break taken in it, where it happened.
const TimeGridEvent = ({ event, title }: TimeGridEventProps) => {
  if (event.kind !== EVENT_KINDS.TIME_LOG) return title;

  return (
    <>
      {title}
      {getBreakBands(event).map((band) => (
        <BreakWave band={band} key={band.id} />
      ))}
    </>
  );
};

export default TimeGridEvent;

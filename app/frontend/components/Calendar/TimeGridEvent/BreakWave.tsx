import { Coffee } from "lucide-react";

import type { BreakBand } from "../types";

type BreakWaveProps = { band: BreakBand };

// A break inside a time log: the log lightens there, with a gentle coral wave. Time past the break's planned end shows
// as a fainter, dashed wave under it. The cup only shows once the band is tall enough for it (calendar.css).
const BreakWave = ({ band: { intention, minutes, top, height, overrunShare } }: BreakWaveProps) => {
  const label = `${intention} · ${minutes} min`;

  return (
    <span className="calendar-break" style={{ top: `${top}%`, height: `${height}%` }} title={label}>
      <span className="sr-only">{`Break: ${label}`}</span>
      <span className="calendar-break-planned">
        <span aria-hidden="true" className="calendar-break-wave" />
        <span aria-hidden="true" className="calendar-break-icon">
          <Coffee />
        </span>
      </span>
      {overrunShare > 0 && (
        <span className="calendar-break-overrun" style={{ height: `${overrunShare}%` }}>
          <span aria-hidden="true" className="calendar-break-wave" />
        </span>
      )}
    </span>
  );
};

export default BreakWave;
